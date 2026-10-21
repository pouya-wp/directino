// Package runtime owns the live channel connections: it links new accounts, keeps
// linked ones running, and feeds their inbound messages to the agent.
package runtime

import (
	"context"
	"fmt"
	"log/slog"
	"sync"

	"go.mau.fi/whatsmeow/store/sqlstore"

	"directino/internal/agent"
	"directino/internal/channels"
	"directino/internal/channels/whatsapp"
	"directino/internal/domain"
)

type Runtime struct {
	Agent    *agent.Agent
	WAStore  *sqlstore.Container
	Log      *slog.Logger
	Workers  int // concurrent agent handlers
	inbound  chan domain.Inbound
	startMu  sync.Once
	baseCtx  context.Context
}

func (rt *Runtime) Start(ctx context.Context) {
	rt.startMu.Do(func() {
		rt.baseCtx = ctx
		rt.inbound = make(chan domain.Inbound, 256)
		for range max(rt.Workers, 1) {
			go func() {
				for {
					select {
					case <-ctx.Done():
						return
					case in := <-rt.inbound:
						if err := rt.Agent.Handle(ctx, in); err != nil {
							rt.Log.Error("handle inbound", "channel", in.Channel, "err", err)
						}
					}
				}
			}()
		}
	})
}

// Resume reconnects WhatsApp accounts that were linked before a restart.
func (rt *Runtime) Resume(ctx context.Context, workspace string) error {
	devices, err := rt.WAStore.GetAllDevices(ctx)
	if err != nil {
		return err
	}
	for _, d := range devices {
		if d.ID == nil {
			continue
		}
		rt.run(whatsapp.New(rt.WAStore, workspace, d.ID.String(), rt.Log))
	}
	return nil
}

type accountConnector interface {
	channels.Connector
	Account() string
}

func (rt *Runtime) run(c accountConnector) {
	rt.Agent.Register(c.Account(), c)
	go func() {
		if err := c.Run(rt.baseCtx, rt.inbound); err != nil {
			rt.Log.Error("connector stopped", "channel", c.Channel(), "account", c.Account(), "err", err)
		}
	}()
	rt.Log.Info("channel online", "channel", c.Channel(), "account", c.Account())
}

func (rt *Runtime) Link(ctx context.Context, workspace string, ch domain.Channel) (<-chan channels.LoginStep, error) {
	switch ch {
	case domain.WhatsApp:
		c := whatsapp.New(rt.WAStore, workspace, "", rt.Log)
		// The QR session must outlive the HTTP request only until it finishes.
		steps, err := c.Login(context.WithoutCancel(ctx))
		if err != nil {
			return nil, err
		}
		out := make(chan channels.LoginStep)
		go func() {
			defer close(out)
			for s := range steps {
				if s.Kind == "connected" {
					rt.run(c)
				}
				select {
				case out <- s:
				case <-ctx.Done():
				}
			}
		}()
		return out, nil
	default:
		return nil, fmt.Errorf("runtime: %s linking is not available yet", ch)
	}
}
