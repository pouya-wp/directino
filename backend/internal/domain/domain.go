// Package domain holds the types every other package speaks: channels, messages,
// conversations and the agent's decisions. No I/O lives here.
package domain

import "time"

type Channel string

const (
	Instagram Channel = "instagram"
	WhatsApp  Channel = "whatsapp"
	Telegram  Channel = "telegram"
)

type Kind string

const (
	KindDM      Kind = "dm"
	KindComment Kind = "comment"
)

type Author string

const (
	FromCustomer Author = "customer"
	FromAI       Author = "ai"
	FromHuman    Author = "human"
)

// Inbound is one message as it arrives from any connector, already normalized.
type Inbound struct {
	Workspace  string
	Channel    Channel
	Account    string // our connected account on that channel
	Kind       Kind
	ThreadID   string // chat / DM thread id on the platform
	ExternalID string // platform message id, used for de-duplication
	PostID     string // for comments: the post the comment is under
	From       Contact
	Text       string
	At         time.Time
}

type Contact struct {
	ID     string // platform user id
	Handle string // @username or phone
	Name   string
}

// Outbound is what the agent (or a human) wants to send back.
type Outbound struct {
	Channel  Channel
	Account  string
	Kind     Kind
	ThreadID string
	ReplyTo  string // comment id when replying publicly
	Text     string
}

type Mode string

const (
	ModeDraft   Mode = "draft"   // write only, a human sends
	ModeApprove Mode = "approve" // queue for one-tap approval
	ModeAuto    Mode = "auto"    // send when confident
)

type Status string

const (
	StatusNeedsHuman Status = "needs"
	StatusAI         Status = "ai"
	StatusClosed     Status = "closed"
)

type Message struct {
	ID         string    `json:"id"`
	From       Author    `json:"from"`
	Text       string    `json:"text"`
	At         time.Time `json:"at"`
	ExternalID string    `json:"-"`
}

type Draft struct {
	Text       string  `json:"text"`
	Confidence float64 `json:"confidence"`
	Intent     string  `json:"intent"`
	Handoff    bool    `json:"handoff"`
	Reason     string  `json:"reason"`
}

type Conversation struct {
	ID        string    `json:"id"`
	Workspace string    `json:"workspace"`
	Channel   Channel   `json:"channel"`
	Account   string    `json:"account"`
	ThreadID  string    `json:"threadId"`
	Contact   Contact   `json:"contact"`
	Status    Status    `json:"status"`
	HumanOnly bool      `json:"humanOnly"` // a teammate took over; the agent stays quiet
	Messages  []Message `json:"messages"`
	Draft     *Draft    `json:"draft,omitempty"`
	UpdatedAt time.Time `json:"updatedAt"`
}

// Settings are the per-workspace agent controls shown in the dashboard.
type Settings struct {
	Mode           Mode
	Threshold      float64 // below this confidence, wait for a human
	BrandVoice     string  // free-form tone instructions
	ReplyLanguage  string  // "match", "fa" or "en"
	HandoffOnAngry bool
}

func DefaultSettings() Settings {
	return Settings{Mode: ModeApprove, Threshold: 0.75, ReplyLanguage: "match", HandoffOnAngry: true}
}
