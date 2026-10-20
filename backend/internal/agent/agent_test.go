package agent

import (
	"context"
	"io"
	"log/slog"
	"testing"
	"time"

	"directino/internal/channels"
	"directino/internal/domain"
	"directino/internal/llm"
	"directino/internal/pacing"
	"directino/internal/store"
)

type fakeDrafter struct{ d domain.Draft }

func (f fakeDrafter) Draft(context.Context, llm.Request) (domain.Draft, error) { return f.d, nil }

type fakeConn struct{ sent []domain.Outbound }

func (f *fakeConn) Channel() domain.Channel                               { return domain.WhatsApp }
func (f *fakeConn) Login(context.Context) (<-chan channels.LoginStep, error) { return nil, nil }
func (f *fakeConn) Run(context.Context, chan<- domain.Inbound) error        { return nil }
func (f *fakeConn) Typing(context.Context, string, bool) error              { return nil }
func (f *fakeConn) Logout(context.Context) error                            { return nil }
func (f *fakeConn) Send(_ context.Context, o domain.Outbound) (string, error) {
	f.sent = append(f.sent, o)
	return "out-1", nil
}

func newAgent(t *testing.T, mode domain.Mode, d domain.Draft) (*Agent, *fakeConn, *store.Memory) {
	t.Helper()
	st := store.NewMemory()
	_ = st.SaveSettings(context.Background(), "ws", domain.Settings{Mode: mode, Threshold: 0.75})
	conn := &fakeConn{}
	a := &Agent{
		Store: st, Drafter: fakeDrafter{d}, Pacer: pacing.New(100),
		Log:   slog.New(slog.NewTextHandler(io.Discard, nil)),
		Sleep: func(context.Context, time.Duration) error { return nil },
	}
	a.Register("acct", conn)
	return a, conn, st
}

func inbound(id string) domain.Inbound {
	return domain.Inbound{Workspace: "ws", Channel: domain.WhatsApp, Account: "acct", Kind: domain.KindDM, ThreadID: "t1", ExternalID: id, Text: "price?", At: time.Now()}
}

func TestAutoModeSendsConfidentReplies(t *testing.T) {
	a, conn, st := newAgent(t, domain.ModeAuto, domain.Draft{Text: "It's $84.", Confidence: 0.9})
	if err := a.Handle(context.Background(), inbound("m1")); err != nil {
		t.Fatal(err)
	}
	if len(conn.sent) != 1 || conn.sent[0].Text != "It's $84." {
		t.Fatalf("expected one send, got %+v", conn.sent)
	}
	list, _ := st.List(context.Background(), "ws")
	if list[0].Status != domain.StatusAI || len(list[0].Messages) != 2 {
		t.Fatalf("unexpected conversation state: %+v", list[0])
	}
}

func TestLowConfidenceWaitsForHuman(t *testing.T) {
	a, conn, st := newAgent(t, domain.ModeAuto, domain.Draft{Text: "Maybe?", Confidence: 0.4})
	_ = a.Handle(context.Background(), inbound("m1"))
	if len(conn.sent) != 0 {
		t.Fatal("low-confidence draft must not be sent")
	}
	list, _ := st.List(context.Background(), "ws")
	if list[0].Status != domain.StatusNeedsHuman || list[0].Draft == nil {
		t.Fatalf("expected a pending draft, got %+v", list[0])
	}
}

func TestApproveModeQueuesThenSends(t *testing.T) {
	a, conn, st := newAgent(t, domain.ModeApprove, domain.Draft{Text: "Yes, in stock.", Confidence: 0.95})
	_ = a.Handle(context.Background(), inbound("m1"))
	if len(conn.sent) != 0 {
		t.Fatal("approve mode must wait for a tap")
	}
	list, _ := st.List(context.Background(), "ws")
	if err := a.Approve(context.Background(), list[0].ID, ""); err != nil {
		t.Fatal(err)
	}
	if len(conn.sent) != 1 {
		t.Fatal("approve should send the draft")
	}
}

func TestDuplicateInboundIsIgnored(t *testing.T) {
	a, conn, _ := newAgent(t, domain.ModeAuto, domain.Draft{Text: "Hi", Confidence: 0.9})
	_ = a.Handle(context.Background(), inbound("m1"))
	_ = a.Handle(context.Background(), inbound("m1"))
	if len(conn.sent) != 1 {
		t.Fatalf("replayed message answered twice: %d sends", len(conn.sent))
	}
}
