// Package store persists conversations, settings and knowledge.
//
// Store is the contract; Memory is the in-process implementation used for local
// development and tests. The Postgres implementation follows migrations/0001_init.sql.
package store

import (
	"context"
	"crypto/rand"
	"encoding/hex"
	"errors"
	"slices"
	"sync"
	"time"

	"directino/internal/domain"
	"directino/internal/knowledge"
)

var ErrNotFound = errors.New("store: not found")

type Store interface {
	// Conversation finds the thread or opens a new one for this contact.
	Conversation(ctx context.Context, in domain.Inbound) (domain.Conversation, error)
	// Append adds a message; ok is false when the external id was already stored.
	Append(ctx context.Context, convID string, m domain.Message) (ok bool, err error)
	Update(ctx context.Context, convID string, fn func(*domain.Conversation)) (domain.Conversation, error)
	Get(ctx context.Context, convID string) (domain.Conversation, error)
	List(ctx context.Context, workspace string) ([]domain.Conversation, error)
	Settings(ctx context.Context, workspace string) (domain.Settings, error)
	SaveSettings(ctx context.Context, workspace string, s domain.Settings) error
	Knowledge(ctx context.Context, workspace string) (knowledge.Base, error)
}

func NewID() string {
	b := make([]byte, 10)
	_, _ = rand.Read(b)
	return hex.EncodeToString(b)
}

type Memory struct {
	mu       sync.RWMutex
	convs    map[string]*domain.Conversation
	byThread map[string]string // channel|account|thread -> conv id
	seen     map[string]bool   // external message ids
	settings map[string]domain.Settings
	kb       map[string]knowledge.Base
}

func NewMemory() *Memory {
	return &Memory{
		convs:    map[string]*domain.Conversation{},
		byThread: map[string]string{},
		seen:     map[string]bool{},
		settings: map[string]domain.Settings{},
		kb:       map[string]knowledge.Base{},
	}
}

func (m *Memory) SetKnowledge(workspace string, b knowledge.Base) {
	m.mu.Lock()
	defer m.mu.Unlock()
	m.kb[workspace] = b
}

func (m *Memory) Conversation(_ context.Context, in domain.Inbound) (domain.Conversation, error) {
	key := string(in.Channel) + "|" + in.Account + "|" + in.ThreadID
	m.mu.Lock()
	defer m.mu.Unlock()
	if id, ok := m.byThread[key]; ok {
		return clone(m.convs[id]), nil
	}
	c := &domain.Conversation{
		ID: NewID(), Workspace: in.Workspace, Channel: in.Channel, Account: in.Account,
		ThreadID: in.ThreadID, Contact: in.From, Status: domain.StatusAI, UpdatedAt: time.Now(),
	}
	m.convs[c.ID] = c
	m.byThread[key] = c.ID
	return clone(c), nil
}

func (m *Memory) Append(_ context.Context, convID string, msg domain.Message) (bool, error) {
	m.mu.Lock()
	defer m.mu.Unlock()
	c, ok := m.convs[convID]
	if !ok {
		return false, ErrNotFound
	}
	if msg.ExternalID != "" {
		if m.seen[msg.ExternalID] {
			return false, nil
		}
		m.seen[msg.ExternalID] = true
	}
	if msg.ID == "" {
		msg.ID = NewID()
	}
	c.Messages = append(c.Messages, msg)
	c.UpdatedAt = msg.At
	return true, nil
}

func (m *Memory) Update(_ context.Context, convID string, fn func(*domain.Conversation)) (domain.Conversation, error) {
	m.mu.Lock()
	defer m.mu.Unlock()
	c, ok := m.convs[convID]
	if !ok {
		return domain.Conversation{}, ErrNotFound
	}
	fn(c)
	return clone(c), nil
}

func (m *Memory) Get(_ context.Context, convID string) (domain.Conversation, error) {
	m.mu.RLock()
	defer m.mu.RUnlock()
	c, ok := m.convs[convID]
	if !ok {
		return domain.Conversation{}, ErrNotFound
	}
	return clone(c), nil
}

func (m *Memory) List(_ context.Context, workspace string) ([]domain.Conversation, error) {
	m.mu.RLock()
	defer m.mu.RUnlock()
	out := []domain.Conversation{}
	for _, c := range m.convs {
		if c.Workspace == workspace {
			out = append(out, clone(c))
		}
	}
	slices.SortFunc(out, func(a, b domain.Conversation) int { return b.UpdatedAt.Compare(a.UpdatedAt) })
	return out, nil
}

func (m *Memory) Settings(_ context.Context, workspace string) (domain.Settings, error) {
	m.mu.RLock()
	defer m.mu.RUnlock()
	if s, ok := m.settings[workspace]; ok {
		return s, nil
	}
	return domain.DefaultSettings(), nil
}

func (m *Memory) SaveSettings(_ context.Context, workspace string, s domain.Settings) error {
	m.mu.Lock()
	defer m.mu.Unlock()
	m.settings[workspace] = s
	return nil
}

func (m *Memory) Knowledge(_ context.Context, workspace string) (knowledge.Base, error) {
	m.mu.RLock()
	defer m.mu.RUnlock()
	return m.kb[workspace], nil
}

func clone(c *domain.Conversation) domain.Conversation {
	out := *c
	out.Messages = slices.Clone(c.Messages)
	if c.Draft != nil {
		d := *c.Draft
		out.Draft = &d
	}
	return out
}
