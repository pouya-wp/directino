// Package accounts is the contract for users, workspaces and login sessions.
package accounts

import (
	"context"
	"errors"
)

type User struct {
	ID        string `json:"id"`
	Email     string `json:"email"`
	Name      string `json:"name"`
	Workspace string `json:"workspace"` // the workspace this session is scoped to
	WorkspaceName string `json:"workspaceName"`
}

var (
	ErrTaken        = errors.New("accounts: email already registered")
	ErrBadLogin     = errors.New("accounts: wrong email or password")
	ErrNoSession    = errors.New("accounts: session not found or expired")
)

type SignUp struct {
	Name     string
	Email    string
	Business string
	Password string
	Edition  string // "fa" or "en"
}

type Accounts interface {
	// SignUp creates a user, their first workspace, and an active session.
	SignUp(ctx context.Context, in SignUp) (User, string, error)
	LogIn(ctx context.Context, email, password string) (User, string, error)
	Session(ctx context.Context, token string) (User, error)
	LogOut(ctx context.Context, token string) error
}
