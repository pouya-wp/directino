// Package whatsapp connects a regular WhatsApp (or WhatsApp Business app) account as a
// linked device, the same multi-device protocol WhatsApp Web uses, via whatsmeow.
// No Business API, no Meta app review: the shop scans a QR code once.
package whatsapp

import (
	"context"
	"errors"
	"fmt"
	"log/slog"
	"strings"
	"sync"
	"time"

	"go.mau.fi/whatsmeow"
	"go.mau.fi/whatsmeow/proto/waE2E"
	"go.mau.fi/whatsmeow/store/sqlstore"
	"go.mau.fi/whatsmeow/types"
	"go.mau.fi/whatsmeow/types/events"
	"google.golang.org/protobuf/proto"

	"directino/internal/channels"
	"directino/internal/domain"
)

type Connector struct {
	container *sqlstore.Container
	workspace string
	log       *slog.Logger

	mu      sync.Mutex
	account string // our JID once linked, e.g. "98912xxxxxxx@s.whatsapp.net"
	client  *whatsmeow.Client
}

// New returns a connector for one workspace account. account is empty for a new link.
func New(container *sqlstore.Container, workspace, account string, log *slog.Logger) *Connector {
	return &Connector{container: container, workspace: workspace, account: account, log: log}
}

func (c *Connector) Channel() domain.Channel { return domain.WhatsApp }

func (c *Connector) Account() string {
	c.mu.Lock()
	defer c.mu.Unlock()
	return c.account
}

func (c *Connector) Login(ctx context.Context) (<-chan channels.LoginStep, error) {
	device := c.container.NewDevice()
	client := whatsmeow.NewClient(device, nil)
	qr, err := client.GetQRChannel(ctx)
	if err != nil {
		return nil, err
	}
	if err := client.Connect(); err != nil {
		return nil, err
	}
	out := make(chan channels.LoginStep, 4)
	go func() {
		defer close(out)
		for item := range qr {
			switch item.Event {
			case "code":
				out <- channels.LoginStep{Kind: "qr", Payload: item.Code}
			case "success":
				c.mu.Lock()
				c.account, c.client = client.Store.ID.String(), client
				c.mu.Unlock()
				out <- channels.LoginStep{Kind: "connected", Payload: c.Account()}
				return
			default:
				client.Disconnect()
				out <- channels.LoginStep{Kind: "error", Payload: item.Event}
				return
			}
		}
	}()
	return out, nil
}

func (c *Connector) Run(ctx context.Context, inbound chan<- domain.Inbound) error {
	c.mu.Lock()
	client, account := c.client, c.account
	c.mu.Unlock()
	if client == nil {
		if account == "" {
			return channels.ErrNotLinked
		}
		jid, err := types.ParseJID(account)
		if err != nil {
			return err
		}
		device, err := c.container.GetDevice(ctx, jid)
		if err != nil {
			return err
		}
		if device == nil {
			return channels.ErrNotLinked
		}
		client = whatsmeow.NewClient(device, nil)
		if err := client.Connect(); err != nil {
			return err
		}
		c.mu.Lock()
		c.client = client
		c.mu.Unlock()
	}

	id := client.AddEventHandler(func(evt any) {
		switch v := evt.(type) {
		case *events.Message:
			if in, ok := c.normalize(v); ok {
				select {
				case inbound <- in:
				case <-ctx.Done():
				}
			}
		case *events.LoggedOut:
			c.log.Warn("whatsapp: logged out from phone", "account", account)
		}
	})
	<-ctx.Done()
	client.RemoveEventHandler(id)
	client.Disconnect()
	return nil
}

// normalize keeps one-to-one text chats; groups, status updates and our own echoes are skipped.
func (c *Connector) normalize(v *events.Message) (domain.Inbound, bool) {
	if v.Info.IsFromMe || v.Info.IsGroup || v.Info.Chat.Server == types.BroadcastServer {
		return domain.Inbound{}, false
	}
	text := v.Message.GetConversation()
	if text == "" {
		text = v.Message.GetExtendedTextMessage().GetText()
	}
	if strings.TrimSpace(text) == "" {
		return domain.Inbound{}, false
	}
	return domain.Inbound{
		Workspace:  c.workspace,
		Channel:    domain.WhatsApp,
		Account:    c.Account(),
		Kind:       domain.KindDM,
		ThreadID:   v.Info.Chat.String(),
		ExternalID: "wa:" + v.Info.ID,
		From:       domain.Contact{ID: v.Info.Sender.User, Handle: "+" + v.Info.Sender.User, Name: v.Info.PushName},
		Text:       text,
		At:         v.Info.Timestamp,
	}, true
}

func (c *Connector) clientOrErr() (*whatsmeow.Client, error) {
	c.mu.Lock()
	defer c.mu.Unlock()
	if c.client == nil {
		return nil, channels.ErrNotLinked
	}
	return c.client, nil
}

func (c *Connector) Typing(ctx context.Context, threadID string, on bool) error {
	client, err := c.clientOrErr()
	if err != nil {
		return err
	}
	jid, err := types.ParseJID(threadID)
	if err != nil {
		return err
	}
	state := types.ChatPresencePaused
	if on {
		state = types.ChatPresenceComposing
	}
	return client.SendChatPresence(ctx, jid, state, types.ChatPresenceMediaText)
}

func (c *Connector) Send(ctx context.Context, out domain.Outbound) (string, error) {
	if out.Kind != domain.KindDM {
		return "", errors.New("whatsapp: only direct messages are supported")
	}
	client, err := c.clientOrErr()
	if err != nil {
		return "", err
	}
	jid, err := types.ParseJID(out.ThreadID)
	if err != nil {
		return "", err
	}
	ctx, cancel := context.WithTimeout(ctx, 30*time.Second)
	defer cancel()
	resp, err := client.SendMessage(ctx, jid, &waE2E.Message{Conversation: proto.String(out.Text)})
	if err != nil {
		return "", fmt.Errorf("whatsapp: send: %w", err)
	}
	return "wa:" + resp.ID, nil
}

func (c *Connector) Logout(ctx context.Context) error {
	client, err := c.clientOrErr()
	if err != nil {
		return err
	}
	return client.Logout(ctx)
}
