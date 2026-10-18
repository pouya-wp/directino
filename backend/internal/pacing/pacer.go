// Package pacing makes outgoing replies look like a person typed them: a reading
// pause, typing time proportional to length, jitter, and a daily cap per account.
// Unofficial clients get flagged for robotic timing, so every send goes through here.
package pacing

import (
	"math/rand/v2"
	"sync"
	"time"
)

type Pacer struct {
	mu       sync.Mutex
	limit    int // replies per account per day
	sent     map[string]int
	day      int
	now      func() time.Time
	charRate float64 // characters per second while "typing"
}

func New(dailyLimit int) *Pacer {
	return &Pacer{limit: dailyLimit, sent: map[string]int{}, now: time.Now, charRate: 14}
}

// Plan returns how long to wait before showing "typing" and how long to type.
func (p *Pacer) Plan(text string) (read, typing time.Duration) {
	read = time.Duration(1200+rand.IntN(2200)) * time.Millisecond
	chars := float64(len([]rune(text)))
	secs := chars/p.charRate*(0.8+rand.Float64()*0.4) + 0.6
	if secs > 12 {
		secs = 12 + rand.Float64()*2 // long answers are pasted, not typed
	}
	return read, time.Duration(secs * float64(time.Second))
}

// Allow reserves one send for the account, or reports that today's cap is reached.
func (p *Pacer) Allow(account string) bool {
	p.mu.Lock()
	defer p.mu.Unlock()
	if d := p.now().YearDay(); d != p.day {
		p.day, p.sent = d, map[string]int{}
	}
	if p.sent[account] >= p.limit {
		return false
	}
	p.sent[account]++
	return true
}
