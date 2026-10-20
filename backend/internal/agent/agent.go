// Package agent is the reply pipeline: inbound message -> knowledge -> draft ->
// policy (mode, confidence, handoff) -> human-paced send.
package agent

import (
	"context"
	"errors"
	"log/slog"
	"sync"
	"time"

	"directino/internal/channels"
	"directino/internal/domain"
	"directino/internal/hub"
	"directino/internal/llm"
	"directino/internal/pacing"
	"directino/internal/store"
)

const historyTurns = 12

type Agent struct {
	Store    store.Store
	Drafter  llm.Drafter
	Pacer    *pacing.Pacer
	Hub      *hub.Hub
	Log      *slog.Logger
	ShopName func(workspace string) string
	// Sleep is swapped out in tests so pacing doesn't slow them down.
	Sleep func(ctx context.Context, d time.Duration) error

	mu         sync.Mutex
	connectors map[string]channels.Connector // channel|account -> connector
	locks      sync.Map                      // conversation id -> *sync.Mutex
}

func (a *Agent) Register(account string, c channels.Connector) {
	a.mu.Lock()
	defer a.mu.Unlock()
	if a.connectors == nil {
		a.connectors = map[string]channels.Connector{}
	}
	a.connectors[string(c.Channel())+"|"+account] = c
}

func (a *Agent) connector(ch domain.Channel, account string) (channels.Connector, bool) {
	a.mu.Lock()
	defer a.mu.Unlock()
	c, ok := a.connectors[string(ch)+"|"+account]
	return c, ok
}

func (a *Agent) lock(convID string) func() {
	l, _ := a.locks.LoadOrStore(convID, &sync.Mutex{})
	m := l.(*sync.Mutex)
	m.Lock()
	return m.Unlock
}

func (a *Agent) publish(c domain.Conversation) {
	if a.Hub != nil {
		a.Hub.Publish(c.Workspace, hub.Event{Type: "conversation", Conversation: &c})
	}
}

// Handle processes one inbound message end to end. Messages in the same
// conversation are handled in order; different conversations run in parallel.
func (a *Agent) Handle(ctx context.Context, in domain.Inbound) error {
	conv, err := a.Store.Conversation(ctx, in)
	if err != nil {
		return err
	}
	unlock := a.lock(conv.ID)
	defer unlock()

	fresh, err := a.Store.Append(ctx, conv.ID, domain.Message{From: domain.FromCustomer, Text: in.Text, At: in.At, ExternalID: in.ExternalID})
	if err != nil || !fresh {
		return err // duplicates (reconnect replays) are dropped silently
	}
	conv, err = a.Store.Get(ctx, conv.ID)
	if err != nil {
		return err
	}
	a.publish(conv)
	if conv.HumanOnly {
		return a.status(ctx, conv.ID, domain.StatusNeedsHuman)
	}

	settings, err := a.Store.Settings(ctx, in.Workspace)
	if err != nil {
		return err
	}
	kb, err := a.Store.Knowledge(ctx, in.Workspace)
	if err != nil {
		return err
	}
	req := llm.Request{
		ShopName:   a.shop(in.Workspace),
		BrandVoice: settings.BrandVoice,
		Language:   settings.ReplyLanguage,
		Knowledge:  kb.Context(in.Text, 8),
		IsComment:  in.Kind == domain.KindComment,
	}
	msgs := conv.Messages
	if len(msgs) > historyTurns {
		msgs = msgs[len(msgs)-historyTurns:]
	}
	for _, m := range msgs {
		req.History = append(req.History, llm.Turn{From: m.From, Text: m.Text})
	}

	draft, err := a.Drafter.Draft(ctx, req)
	if err != nil {
		a.Log.Error("draft failed", "conv", conv.ID, "err", err)
		return a.status(ctx, conv.ID, domain.StatusNeedsHuman)
	}

	if a.shouldSend(settings, draft) {
		return a.send(ctx, conv, in.Kind, in.ExternalID, draft.Text, domain.FromAI)
	}
	updated, err := a.Store.Update(ctx, conv.ID, func(c *domain.Conversation) {
		c.Draft = &draft
		c.Status = domain.StatusNeedsHuman
	})
	if err == nil {
		a.publish(updated)
	}
	return err
}

func (a *Agent) shouldSend(s domain.Settings, d domain.Draft) bool {
	if d.Text == "" || d.Handoff || d.Confidence < s.Threshold {
		return false
	}
	return s.Mode == domain.ModeAuto
}

// Approve sends a draft (possibly edited) from the dashboard.
func (a *Agent) Approve(ctx context.Context, convID, text string) error {
	unlock := a.lock(convID)
	defer unlock()
	conv, err := a.Store.Get(ctx, convID)
	if err != nil {
		return err
	}
	if text == "" && conv.Draft != nil {
		text = conv.Draft.Text
	}
	if text == "" {
		return errors.New("agent: nothing to send")
	}
	return a.send(ctx, conv, domain.KindDM, "", text, domain.FromAI)
}

// Reply sends a teammate's own message and keeps the agent quiet in this chat.
func (a *Agent) Reply(ctx context.Context, convID, text string) error {
	unlock := a.lock(convID)
	defer unlock()
	conv, err := a.Store.Update(ctx, convID, func(c *domain.Conversation) { c.HumanOnly = true })
	if err != nil {
		return err
	}
	return a.send(ctx, conv, domain.KindDM, "", text, domain.FromHuman)
}

func (a *Agent) send(ctx context.Context, conv domain.Conversation, kind domain.Kind, replyTo, text string, from domain.Author) error {
	conn, ok := a.connector(conv.Channel, conv.Account)
	if !ok {
		return channels.ErrNotLinked
	}
	if from == domain.FromAI && !a.Pacer.Allow(conv.Account) {
		// Daily cap reached: keep it as a draft for a human instead of risking the account.
		d := &domain.Draft{Text: text, Confidence: 1, Reason: "daily reply limit reached"}
		updated, err := a.Store.Update(ctx, conv.ID, func(c *domain.Conversation) { c.Draft, c.Status = d, domain.StatusNeedsHuman })
		if err == nil {
			a.publish(updated)
		}
		return err
	}

	read, typing := a.Pacer.Plan(text)
	if err := a.Sleep(ctx, read); err != nil {
		return err
	}
	if kind == domain.KindDM {
		_ = conn.Typing(ctx, conv.ThreadID, true)
		if err := a.Sleep(ctx, typing); err != nil {
			return err
		}
	}
	extID, err := conn.Send(ctx, domain.Outbound{Channel: conv.Channel, Account: conv.Account, Kind: kind, ThreadID: conv.ThreadID, ReplyTo: replyTo, Text: text})
	if kind == domain.KindDM {
		_ = conn.Typing(ctx, conv.ThreadID, false)
	}
	if err != nil {
		return err
	}
	if _, err := a.Store.Append(ctx, conv.ID, domain.Message{From: from, Text: text, At: time.Now(), ExternalID: extID}); err != nil {
		return err
	}
	updated, err := a.Store.Update(ctx, conv.ID, func(c *domain.Conversation) {
		c.Draft = nil
		if from == domain.FromAI {
			c.Status = domain.StatusAI
		} else {
			c.Status = domain.StatusClosed
		}
	})
	if err == nil {
		a.publish(updated)
	}
	return err
}

func (a *Agent) status(ctx context.Context, convID string, s domain.Status) error {
	updated, err := a.Store.Update(ctx, convID, func(c *domain.Conversation) { c.Status = s })
	if err == nil {
		a.publish(updated)
	}
	return err
}

func (a *Agent) shop(ws string) string {
	if a.ShopName != nil {
		return a.ShopName(ws)
	}
	return ws
}

// SleepCtx waits for d or until ctx is cancelled.
func SleepCtx(ctx context.Context, d time.Duration) error {
	t := time.NewTimer(d)
	defer t.Stop()
	select {
	case <-ctx.Done():
		return ctx.Err()
	case <-t.C:
		return nil
	}
}
