package accounts

import (
	"context"
	"crypto/rand"
	"encoding/hex"
	"strings"
	"sync"
	"time"

	"directino/internal/auth"
)

// Memory is an in-process Accounts for local development and tests.
// Production uses the Postgres implementation. Hook assigns the first workspace
// for a new signup (so the agent and store share the same id).
type Memory struct {
	mu       sync.Mutex
	byEmail  map[string]*record
	sessions map[string]session // token hash -> session
	ttl      time.Duration
	now      func() time.Time
	OnSignUp func(workspace, name, edition string)
}

type record struct {
	user User
	hash string
}

type session struct {
	user    User
	expires time.Time
}

func NewMemory() *Memory {
	return &Memory{byEmail: map[string]*record{}, sessions: map[string]session{}, ttl: 30 * 24 * time.Hour, now: time.Now}
}

func normalizeEmail(e string) string { return strings.ToLower(strings.TrimSpace(e)) }

func (m *Memory) newSession(u User) (string, error) {
	token, hash, err := auth.NewToken()
	if err != nil {
		return "", err
	}
	m.sessions[hash] = session{user: u, expires: m.now().Add(m.ttl)}
	return token, nil
}

func (m *Memory) SignUp(_ context.Context, in SignUp) (User, string, error) {
	email := normalizeEmail(in.Email)
	m.mu.Lock()
	defer m.mu.Unlock()
	if _, ok := m.byEmail[email]; ok {
		return User{}, "", ErrTaken
	}
	hash, err := auth.Hash(in.Password)
	if err != nil {
		return User{}, "", err
	}
	wsName := in.Business
	if wsName == "" {
		wsName = in.Name
	}
	u := User{ID: newID(), Email: email, Name: in.Name, Workspace: newID(), WorkspaceName: wsName}
	m.byEmail[email] = &record{user: u, hash: hash}
	if m.OnSignUp != nil {
		m.OnSignUp(u.Workspace, wsName, in.Edition)
	}
	tok, err := m.newSession(u)
	return u, tok, err
}

func (m *Memory) LogIn(_ context.Context, email, password string) (User, string, error) {
	m.mu.Lock()
	defer m.mu.Unlock()
	rec, ok := m.byEmail[normalizeEmail(email)]
	if !ok {
		return User{}, "", ErrBadLogin
	}
	if err := auth.Verify(password, rec.hash); err != nil {
		return User{}, "", ErrBadLogin
	}
	tok, err := m.newSession(rec.user)
	return rec.user, tok, err
}

func (m *Memory) Session(_ context.Context, token string) (User, error) {
	m.mu.Lock()
	defer m.mu.Unlock()
	s, ok := m.sessions[auth.HashToken(token)]
	if !ok || m.now().After(s.expires) {
		return User{}, ErrNoSession
	}
	return s.user, nil
}

func (m *Memory) LogOut(_ context.Context, token string) error {
	m.mu.Lock()
	defer m.mu.Unlock()
	delete(m.sessions, auth.HashToken(token))
	return nil
}

func newID() string {
	b := make([]byte, 10)
	_, _ = rand.Read(b)
	return hex.EncodeToString(b)
}
