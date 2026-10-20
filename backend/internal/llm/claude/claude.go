// Package claude drafts customer replies with the Claude Messages API.
//
// The model answers through a strict "send_reply" tool, so every draft comes back as
// validated JSON with a confidence score the policy layer can act on. Forced
// tool_choice isn't available on this model, so the tool is requested in the prompt
// and a plain-text answer is accepted as a low-confidence fallback.
package claude

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"strings"

	"github.com/anthropics/anthropic-sdk-go"

	"directino/internal/domain"
	"directino/internal/llm"
)

type Drafter struct {
	client anthropic.Client
	model  string
}

func New(model string) *Drafter {
	// Credentials come from ANTHROPIC_API_KEY (or an `ant auth login` profile).
	return &Drafter{client: anthropic.NewClient(), model: model}
}

const system = `You are the customer-messaging admin for an online shop. You reply to Instagram, WhatsApp and Telegram messages on the shop's behalf.

Rules:
- Use only the facts in <knowledge>. Never invent prices, stock, delivery times or promises. If the facts don't answer the question, say you'll check and set handoff to true.
- Write like a friendly human admin: short, warm, natural. Match the customer's language and register (Persian, Finglish or English). No markdown.
- Public comments get one short line and move details to DM.
- Set handoff to true when the customer is upset, asks for a person, or wants something custom.
- Confidence is your probability that this reply is correct and safe to send without review.

Always answer by calling the send_reply tool exactly once.`

var replyTool = anthropic.BetaToolParam{
	Name:        "send_reply",
	Description: anthropic.String("Send the drafted reply to the customer, with a self-assessed confidence."),
	Strict:      anthropic.Bool(true),
	InputSchema: anthropic.BetaToolInputSchemaParam{
		Properties: map[string]any{
			"reply":      map[string]any{"type": "string", "description": "The message to send, in the customer's language."},
			"confidence": map[string]any{"type": "number", "description": "0 to 1."},
			"intent":     map[string]any{"type": "string", "enum": []string{"price", "stock", "shipping", "order_status", "returns", "complaint", "greeting", "other"}},
			"handoff":    map[string]any{"type": "boolean"},
			"reason":     map[string]any{"type": "string", "description": "One short sentence for the shop team explaining the choice."},
		},
		Required:    []string{"reply", "confidence", "intent", "handoff", "reason"},
		ExtraFields: map[string]any{"additionalProperties": false},
	},
}

func (d *Drafter) Draft(ctx context.Context, req llm.Request) (domain.Draft, error) {
	var shop strings.Builder
	fmt.Fprintf(&shop, "<shop>%s</shop>\n<voice>%s</voice>\n<language>%s</language>\n<knowledge>\n%s\n</knowledge>", req.ShopName, req.BrandVoice, req.Language, req.Knowledge)
	if req.IsComment {
		shop.WriteString("\nThis is a public comment under a post.")
	}

	msgs := []anthropic.BetaMessageParam{anthropic.NewBetaUserMessage(anthropic.NewBetaTextBlock(shop.String()))}
	for _, t := range req.History {
		block := anthropic.NewBetaTextBlock(t.Text)
		if t.From == domain.FromCustomer {
			msgs = append(msgs, anthropic.NewBetaUserMessage(block))
		} else {
			msgs = append(msgs, anthropic.BetaMessageParam{Role: anthropic.BetaMessageParamRoleAssistant, Content: []anthropic.BetaContentBlockParamUnion{block}})
		}
	}

	resp, err := d.client.Beta.Messages.New(ctx, anthropic.BetaMessageNewParams{
		Model:     anthropic.Model(d.model),
		MaxTokens: 2048,
		System:    []anthropic.BetaTextBlockParam{{Text: system, CacheControl: anthropic.NewBetaCacheControlEphemeralParam()}},
		Messages:  msgs,
		Tools:     []anthropic.BetaToolUnionParam{{OfTool: &replyTool}},
		// Short chat replies don't need deep reasoning; low effort keeps latency down.
		OutputConfig: anthropic.BetaOutputConfigParam{Effort: anthropic.BetaOutputConfigEffortLow},
		// If a safety classifier declines, the API re-serves the request on a fallback
		// model it picks by refusal category ("default" mode), inside the same call.
		Fallbacks: anthropic.BetaFallbacksParamOfDefault(),
		Betas:     []anthropic.AnthropicBeta{anthropic.AnthropicBetaServerSideFallback2026_07_01},
	})
	if err != nil {
		return domain.Draft{}, err
	}
	if resp.StopReason == anthropic.BetaStopReasonRefusal {
		return domain.Draft{Handoff: true, Reason: "model declined to answer"}, nil
	}

	var text string
	for _, block := range resp.Content {
		switch v := block.AsAny().(type) {
		case anthropic.BetaToolUseBlock:
			if v.Name != replyTool.Name {
				continue
			}
			var out domain.Draft
			if err := json.Unmarshal([]byte(v.JSON.Input.Raw()), &out); err != nil {
				return domain.Draft{}, fmt.Errorf("claude: bad send_reply input: %w", err)
			}
			return out, nil
		case anthropic.BetaTextBlock:
			text += v.Text
		}
	}
	if strings.TrimSpace(text) == "" {
		return domain.Draft{}, errors.New("claude: empty response")
	}
	// The tool wasn't called: keep the text but force review.
	return domain.Draft{Text: strings.TrimSpace(text), Confidence: 0.3, Intent: "other", Handoff: true, Reason: "no structured reply"}, nil
}
