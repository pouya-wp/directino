// Package channels defines the contract every platform connector implements.
//
// A connector logs into one account the way the official app does (a linked device
// or a user session, never a business API), turns platform events into
// domain.Inbound, and sends domain.Outbound back, with typing indicators.
package channels

import (
	"context"
	"errors"

	"directino/internal/domain"
)

// LoginStep is streamed to the dashboard while an account is being linked:
// a QR code to scan, a code to enter, or the final "connected" state.
type LoginStep struct {
	Kind    string `json:"kind"` // "qr", "code_required", "password_required", "connected", "error"
	Payload string `json:"payload,omitempty"`
}

type Connector interface {
	Channel() domain.Channel
	// Login links a new account and streams the steps; the channel closes when done.
	Login(ctx context.Context) (<-chan LoginStep, error)
	// Run connects an already linked account and pushes inbound messages until ctx ends.
	Run(ctx context.Context, inbound chan<- domain.Inbound) error
	// Typing shows (or clears) the "typing…" indicator in a thread.
	Typing(ctx context.Context, threadID string, on bool) error
	Send(ctx context.Context, out domain.Outbound) (externalID string, err error)
	Logout(ctx context.Context) error
}

var ErrNotLinked = errors.New("channels: account is not linked yet")
