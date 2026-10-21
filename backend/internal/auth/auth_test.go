package auth

import "testing"

func TestHashVerify(t *testing.T) {
	h, err := Hash("correct horse battery staple")
	if err != nil {
		t.Fatal(err)
	}
	if err := Verify("correct horse battery staple", h); err != nil {
		t.Fatalf("valid password rejected: %v", err)
	}
	if err := Verify("wrong", h); err == nil {
		t.Fatal("wrong password accepted")
	}
}

func TestTokenHashStable(t *testing.T) {
	tok, h, err := NewToken()
	if err != nil {
		t.Fatal(err)
	}
	if HashToken(tok) != h {
		t.Fatal("token hash not reproducible")
	}
	if tok == h {
		t.Fatal("stored hash equals the raw token")
	}
}
