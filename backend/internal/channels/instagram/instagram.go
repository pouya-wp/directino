// Package instagram will connect a regular Instagram account through the private API
// the official mobile app uses, not the Graph API (no Business account, no Meta review).
//
// Plan (next step):
//   - Client: our own minimal Go client for the app API (login, direct inbox, comments),
//     emulating one fixed Android device per account (stable device id, user agent,
//     app version) so the account never "changes phones".
//   - Login: username + password from the dashboard, then the challenge / 2FA code step
//     streamed as LoginStep "code_required". Session cookies sealed with crypto.Sealer.
//   - Inbound DMs: realtime over the app's MQTT channel (edge-mqtt), with inbox polling
//     every 20-45s (jittered) as the fallback.
//   - Inbound comments: poll the latest posts' comments every 1-3 minutes.
//   - Outbound: direct_v2 text with "typing" via the indicate_activity call; public
//     comment replies via the comment endpoint, then the full answer in DM.
//   - Safety: one residential-quality egress IP per account (proxy), the pacing package
//     for timing and daily caps, and an immediate pause if the app asks for a checkpoint.
package instagram

import (
	"context"
	"errors"

	"directino/internal/channels"
	"directino/internal/domain"
)

var ErrNotImplemented = errors.New("instagram: connector not implemented yet")

type Connector struct{}

func (c *Connector) Channel() domain.Channel { return domain.Instagram }
func (c *Connector) Login(context.Context) (<-chan channels.LoginStep, error) {
	return nil, ErrNotImplemented
}
func (c *Connector) Run(context.Context, chan<- domain.Inbound) error { return ErrNotImplemented }
func (c *Connector) Typing(context.Context, string, bool) error      { return ErrNotImplemented }
func (c *Connector) Send(context.Context, domain.Outbound) (string, error) {
	return "", ErrNotImplemented
}
func (c *Connector) Logout(context.Context) error { return ErrNotImplemented }
