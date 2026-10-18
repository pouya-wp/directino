package pacing

import (
	"strings"
	"testing"
	"time"
)

func TestPlanScalesWithLengthAndCaps(t *testing.T) {
	p := New(10)
	_, short := p.Plan("hi")
	_, long := p.Plan(strings.Repeat("x", 120))
	_, huge := p.Plan(strings.Repeat("x", 5000))
	if short >= long {
		t.Fatalf("typing time should grow with length: %v vs %v", short, long)
	}
	if huge > 15*time.Second {
		t.Fatalf("typing time should be capped, got %v", huge)
	}
}

func TestDailyLimit(t *testing.T) {
	p := New(2)
	if !p.Allow("a") || !p.Allow("a") || p.Allow("a") {
		t.Fatal("expected exactly two sends")
	}
	if !p.Allow("b") {
		t.Fatal("limits are per account")
	}
}
