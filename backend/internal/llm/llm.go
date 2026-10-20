// Package llm is the seam between the agent and whichever model writes the reply.
// The international edition uses Claude; a self-hosted open model can implement the
// same interface for deployments that need it.
package llm

import (
	"context"

	"directino/internal/domain"
)

type Turn struct {
	From domain.Author
	Text string
}

type Request struct {
	ShopName   string
	BrandVoice string
	Language   string // "match", "fa" or "en"
	Knowledge  string // facts the reply may use; nothing else
	History    []Turn // oldest first, ends with the customer's latest message
	IsComment  bool   // public comment: keep it short, move details to DM
}

type Drafter interface {
	Draft(ctx context.Context, req Request) (domain.Draft, error)
}
