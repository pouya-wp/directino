// Package telegram will connect a regular Telegram user account over MTProto
// (the protocol the official apps use), not the Bot API.
//
// Plan (next step):
//   - Library: github.com/gotd/td, pure Go MTProto client.
//   - Login: QR login (auth.exportLoginToken) shown in the dashboard and scanned from
//     Telegram > Settings > Devices > Link Desktop Device; 2FA password prompt if set.
//     Phone + code login as a fallback.
//   - App credentials: one api_id/api_hash from my.telegram.org for the whole platform.
//   - Session: gotd session bytes sealed with crypto.Sealer per workspace.
//   - Inbound: updates.Dispatcher OnNewMessage for private chats only (no groups/channels).
//   - Typing: messages.setTyping with SendMessageTypingAction.
//   - Outbound: messages.sendMessage with a random_id; the shop's own replies from
//     other devices arrive as outgoing updates and are ignored.
package telegram

import (
	"context"
	"errors"

	"directino/internal/channels"
	"directino/internal/domain"
)

var ErrNotImplemented = errors.New("telegram: connector not implemented yet")

type Connector struct {
	AppID   int
	AppHash string
}

func (c *Connector) Channel() domain.Channel { return domain.Telegram }
func (c *Connector) Login(context.Context) (<-chan channels.LoginStep, error) {
	return nil, ErrNotImplemented
}
func (c *Connector) Run(context.Context, chan<- domain.Inbound) error { return ErrNotImplemented }
func (c *Connector) Typing(context.Context, string, bool) error      { return ErrNotImplemented }
func (c *Connector) Send(context.Context, domain.Outbound) (string, error) {
	return "", ErrNotImplemented
}
func (c *Connector) Logout(context.Context) error { return ErrNotImplemented }
