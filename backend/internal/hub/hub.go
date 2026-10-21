// Package hub fans live events out to dashboard sessions (served as SSE).
package hub

import (
	"sync"

	"directino/internal/domain"
)

type Event struct {
	Type         string              `json:"type"` // "conversation" or "login"
	Conversation *domain.Conversation `json:"conversation,omitempty"`
}

type Hub struct {
	mu   sync.Mutex
	subs map[string]map[chan Event]struct{} // workspace -> subscribers
}

func New() *Hub { return &Hub{subs: map[string]map[chan Event]struct{}{}} }

func (h *Hub) Subscribe(workspace string) (<-chan Event, func()) {
	ch := make(chan Event, 32)
	h.mu.Lock()
	if h.subs[workspace] == nil {
		h.subs[workspace] = map[chan Event]struct{}{}
	}
	h.subs[workspace][ch] = struct{}{}
	h.mu.Unlock()
	return ch, func() {
		h.mu.Lock()
		delete(h.subs[workspace], ch)
		h.mu.Unlock()
		close(ch)
	}
}

// Publish never blocks: a slow dashboard tab drops events and refetches instead.
func (h *Hub) Publish(workspace string, e Event) {
	h.mu.Lock()
	defer h.mu.Unlock()
	for ch := range h.subs[workspace] {
		select {
		case ch <- e:
		default:
		}
	}
}
