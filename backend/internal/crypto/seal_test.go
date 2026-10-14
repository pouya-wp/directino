package crypto

import (
	"bytes"
	"testing"
)

func TestSealRoundTripAndBinding(t *testing.T) {
	s, err := NewSealer(bytes.Repeat([]byte{7}, 32))
	if err != nil {
		t.Fatal(err)
	}
	blob, err := s.Seal("ws1", []byte("session-cookie"))
	if err != nil {
		t.Fatal(err)
	}
	got, err := s.Open("ws1", blob)
	if err != nil || string(got) != "session-cookie" {
		t.Fatalf("round trip failed: %q %v", got, err)
	}
	if _, err := s.Open("ws2", blob); err == nil {
		t.Fatal("blob opened under another workspace")
	}
}
