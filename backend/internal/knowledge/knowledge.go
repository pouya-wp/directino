// Package knowledge is the only source of facts the agent may quote: the catalog
// and the shop's FAQ. Retrieval is keyword scoring for now; it moves to pgvector
// embeddings once the catalog lives in Postgres.
package knowledge

import (
	"fmt"
	"sort"
	"strings"
)

type Product struct {
	Name  string
	SKU   string
	Price string // already formatted in the shop's currency
	Stock int
}

type FAQ struct{ Q, A string }

type Base struct {
	Products []Product
	FAQs     []FAQ
}

var replacer = strings.NewReplacer("ي", "ی", "ك", "ک", "‌", " ", "؟", " ", "?", " ", "!", " ", "،", " ", ",", " ", ".", " ")

func tokens(s string) []string { return strings.Fields(replacer.Replace(strings.ToLower(s))) }

func score(query []string, text string) int {
	t := " " + strings.Join(tokens(text), " ") + " "
	n := 0
	for _, q := range query {
		if len([]rune(q)) > 1 && strings.Contains(t, q) {
			n++
		}
	}
	return n
}

// Context renders the most relevant facts as plain text for the model prompt.
func (b Base) Context(question string, limit int) string {
	q := tokens(question)
	type hit struct {
		line  string
		score int
	}
	var hits []hit
	for _, p := range b.Products {
		stock := "in stock"
		switch {
		case p.Stock == 0:
			stock = "sold out"
		case p.Stock < 8:
			stock = fmt.Sprintf("only %d left", p.Stock)
		}
		hits = append(hits, hit{fmt.Sprintf("PRODUCT %s (SKU %s): price %s, %s", p.Name, p.SKU, p.Price, stock), score(q, p.Name)})
	}
	for _, f := range b.FAQs {
		hits = append(hits, hit{fmt.Sprintf("FAQ Q: %s A: %s", f.Q, f.A), score(q, f.Q+" "+f.A)})
	}
	sort.SliceStable(hits, func(i, j int) bool { return hits[i].score > hits[j].score })
	var lines []string
	for i, h := range hits {
		if i >= limit {
			break
		}
		lines = append(lines, h.line)
	}
	return strings.Join(lines, "\n")
}
