// Package httpapi is the JSON + SSE API the Next.js dashboard talks to.
package httpapi

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"log/slog"
	"net/http"
	"strings"
	"time"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"

	"directino/internal/accounts"
	"directino/internal/agent"
	"directino/internal/channels"
	"directino/internal/domain"
	"directino/internal/hub"
	"directino/internal/store"
)

const sessionCookie = "dx_session"

type ctxKey int

const userKey ctxKey = 0

// Linker starts a login for a channel and, once linked, starts the account's runtime.
type Linker interface {
	Link(ctx context.Context, workspace string, ch domain.Channel) (<-chan channels.LoginStep, error)
}

type Server struct {
	Agent     *agent.Agent
	Store     store.Store
	Accounts  accounts.Accounts
	Hub       *hub.Hub
	Linker    Linker
	Log       *slog.Logger
	WebOrigin string
	Secure    bool // set the session cookie Secure flag (true behind HTTPS)
}

func (s *Server) Routes() http.Handler {
	r := chi.NewRouter()
	r.Use(middleware.RequestID, middleware.RealIP, middleware.Recoverer, s.cors)
	r.Get("/healthz", func(w http.ResponseWriter, _ *http.Request) { w.Write([]byte("ok")) })

	r.Route("/v1", func(r chi.Router) {
		// Public auth endpoints.
		r.Post("/auth/signup", s.signup)
		r.Post("/auth/login", s.login)
		r.Post("/auth/logout", s.logout)

		// Everything else needs a valid session.
		r.Group(func(r chi.Router) {
			r.Use(s.requireSession)
			r.Get("/auth/me", s.me)
			r.Get("/conversations", s.listConversations)
			r.Get("/conversations/{id}", s.getConversation)
			r.Post("/conversations/{id}/approve", s.approve)
			r.Post("/conversations/{id}/reply", s.reply)
			r.Post("/conversations/{id}/handback", s.handback)
			r.Get("/settings", s.getSettings)
			r.Put("/settings", s.putSettings)
			r.Get("/channels/{channel}/link", s.linkChannel)
			r.Get("/events", s.events)
		})
	})
	return r
}

func user(r *http.Request) accounts.User {
	u, _ := r.Context().Value(userKey).(accounts.User)
	return u
}

func workspace(r *http.Request) string { return user(r).Workspace }

func (s *Server) cors(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", s.WebOrigin)
		w.Header().Set("Access-Control-Allow-Credentials", "true")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type")
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, OPTIONS")
		w.Header().Set("Vary", "Origin")
		if r.Method == http.MethodOptions {
			w.WriteHeader(http.StatusNoContent)
			return
		}
		next.ServeHTTP(w, r)
	})
}

// requireSession resolves the session cookie into a user and stores it in the context.
func (s *Server) requireSession(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		c, err := r.Cookie(sessionCookie)
		if err != nil {
			writeErr(w, http.StatusUnauthorized, errors.New("not signed in"))
			return
		}
		u, err := s.Accounts.Session(r.Context(), c.Value)
		if err != nil {
			s.clearCookie(w)
			writeErr(w, http.StatusUnauthorized, errors.New("session expired"))
			return
		}
		ctx := context.WithValue(r.Context(), userKey, u)
		next.ServeHTTP(w, r.WithContext(ctx))
	})
}

func (s *Server) setCookie(w http.ResponseWriter, token string) {
	http.SetCookie(w, &http.Cookie{
		Name: sessionCookie, Value: token, Path: "/", HttpOnly: true,
		Secure: s.Secure, SameSite: http.SameSiteLaxMode, MaxAge: 30 * 24 * 3600,
	})
}

func (s *Server) clearCookie(w http.ResponseWriter) {
	http.SetCookie(w, &http.Cookie{Name: sessionCookie, Value: "", Path: "/", HttpOnly: true, Secure: s.Secure, MaxAge: -1})
}

type credentials struct {
	Name     string `json:"name"`
	Email    string `json:"email"`
	Business string `json:"business"`
	Password string `json:"password"`
	Edition  string `json:"edition"`
}

func (s *Server) signup(w http.ResponseWriter, r *http.Request) {
	var b credentials
	if err := json.NewDecoder(r.Body).Decode(&b); err != nil {
		writeErr(w, http.StatusBadRequest, err)
		return
	}
	if !strings.Contains(b.Email, "@") || len(b.Password) < 8 || strings.TrimSpace(b.Name) == "" {
		writeErr(w, http.StatusBadRequest, errors.New("name, a valid email and an 8+ character password are required"))
		return
	}
	u, token, err := s.Accounts.SignUp(r.Context(), accounts.SignUp{Name: b.Name, Email: b.Email, Business: b.Business, Password: b.Password, Edition: b.Edition})
	if errors.Is(err, accounts.ErrTaken) {
		writeErr(w, http.StatusConflict, err)
		return
	}
	if err != nil {
		writeErr(w, http.StatusInternalServerError, err)
		return
	}
	s.setCookie(w, token)
	writeJSON(w, http.StatusOK, u)
}

func (s *Server) login(w http.ResponseWriter, r *http.Request) {
	var b credentials
	if err := json.NewDecoder(r.Body).Decode(&b); err != nil {
		writeErr(w, http.StatusBadRequest, err)
		return
	}
	u, token, err := s.Accounts.LogIn(r.Context(), b.Email, b.Password)
	if err != nil {
		writeErr(w, http.StatusUnauthorized, accounts.ErrBadLogin)
		return
	}
	s.setCookie(w, token)
	writeJSON(w, http.StatusOK, u)
}

func (s *Server) logout(w http.ResponseWriter, r *http.Request) {
	if c, err := r.Cookie(sessionCookie); err == nil {
		_ = s.Accounts.LogOut(r.Context(), c.Value)
	}
	s.clearCookie(w)
	w.WriteHeader(http.StatusNoContent)
}

func (s *Server) me(w http.ResponseWriter, r *http.Request) {
	writeJSON(w, http.StatusOK, user(r))
}

func (s *Server) listConversations(w http.ResponseWriter, r *http.Request) {
	list, err := s.Store.List(r.Context(), workspace(r))
	if err != nil {
		writeErr(w, http.StatusInternalServerError, err)
		return
	}
	writeJSON(w, http.StatusOK, list)
}

func (s *Server) getConversation(w http.ResponseWriter, r *http.Request) {
	c, err := s.Store.Get(r.Context(), chi.URLParam(r, "id"))
	if err != nil || c.Workspace != workspace(r) {
		writeErr(w, http.StatusNotFound, store.ErrNotFound)
		return
	}
	writeJSON(w, http.StatusOK, c)
}

type textBody struct {
	Text string `json:"text"`
}

func (s *Server) owned(r *http.Request) (string, error) {
	id := chi.URLParam(r, "id")
	c, err := s.Store.Get(r.Context(), id)
	if err != nil || c.Workspace != workspace(r) {
		return "", store.ErrNotFound
	}
	return id, nil
}

func (s *Server) approve(w http.ResponseWriter, r *http.Request) {
	id, err := s.owned(r)
	if err != nil {
		writeErr(w, http.StatusNotFound, err)
		return
	}
	var b textBody
	_ = json.NewDecoder(r.Body).Decode(&b)
	// Sending is paced like a human, so it runs in the background and the UI updates over SSE.
	go func() {
		if err := s.Agent.Approve(context.WithoutCancel(r.Context()), id, b.Text); err != nil {
			s.Log.Error("approve failed", "conv", id, "err", err)
		}
	}()
	w.WriteHeader(http.StatusAccepted)
}

func (s *Server) reply(w http.ResponseWriter, r *http.Request) {
	id, err := s.owned(r)
	if err != nil {
		writeErr(w, http.StatusNotFound, err)
		return
	}
	var b textBody
	if err := json.NewDecoder(r.Body).Decode(&b); err != nil || strings.TrimSpace(b.Text) == "" {
		writeErr(w, http.StatusBadRequest, errors.New("text is required"))
		return
	}
	go func() {
		if err := s.Agent.Reply(context.WithoutCancel(r.Context()), id, b.Text); err != nil {
			s.Log.Error("reply failed", "conv", id, "err", err)
		}
	}()
	w.WriteHeader(http.StatusAccepted)
}

func (s *Server) handback(w http.ResponseWriter, r *http.Request) {
	id, err := s.owned(r)
	if err != nil {
		writeErr(w, http.StatusNotFound, err)
		return
	}
	c, err := s.Store.Update(r.Context(), id, func(c *domain.Conversation) { c.HumanOnly = false })
	if err != nil {
		writeErr(w, http.StatusInternalServerError, err)
		return
	}
	writeJSON(w, http.StatusOK, c)
}

type settingsBody struct {
	Mode          domain.Mode `json:"mode"`
	Threshold     float64     `json:"threshold"`
	BrandVoice    string      `json:"brandVoice"`
	ReplyLanguage string      `json:"replyLanguage"`
}

func (s *Server) getSettings(w http.ResponseWriter, r *http.Request) {
	st, err := s.Store.Settings(r.Context(), workspace(r))
	if err != nil {
		writeErr(w, http.StatusInternalServerError, err)
		return
	}
	writeJSON(w, http.StatusOK, settingsBody{st.Mode, st.Threshold, st.BrandVoice, st.ReplyLanguage})
}

func (s *Server) putSettings(w http.ResponseWriter, r *http.Request) {
	var b settingsBody
	if err := json.NewDecoder(r.Body).Decode(&b); err != nil {
		writeErr(w, http.StatusBadRequest, err)
		return
	}
	switch b.Mode {
	case domain.ModeDraft, domain.ModeApprove, domain.ModeAuto:
	default:
		writeErr(w, http.StatusBadRequest, errors.New("mode must be draft, approve or auto"))
		return
	}
	if b.Threshold < 0.3 || b.Threshold > 0.99 {
		writeErr(w, http.StatusBadRequest, errors.New("threshold must be between 0.3 and 0.99"))
		return
	}
	cur, _ := s.Store.Settings(r.Context(), workspace(r))
	cur.Mode, cur.Threshold, cur.BrandVoice, cur.ReplyLanguage = b.Mode, b.Threshold, b.BrandVoice, b.ReplyLanguage
	if err := s.Store.SaveSettings(r.Context(), workspace(r), cur); err != nil {
		writeErr(w, http.StatusInternalServerError, err)
		return
	}
	writeJSON(w, http.StatusOK, b)
}

// linkChannel streams LoginStep values (QR codes, prompts, result) as server-sent events.
func (s *Server) linkChannel(w http.ResponseWriter, r *http.Request) {
	ch := domain.Channel(chi.URLParam(r, "channel"))
	steps, err := s.Linker.Link(r.Context(), workspace(r), ch)
	if err != nil {
		writeErr(w, http.StatusBadRequest, err)
		return
	}
	flusher, ok := sse(w)
	if !ok {
		return
	}
	for step := range steps {
		writeEvent(w, "login", step)
		flusher.Flush()
	}
}

func (s *Server) events(w http.ResponseWriter, r *http.Request) {
	flusher, ok := sse(w)
	if !ok {
		return
	}
	events, cancel := s.Hub.Subscribe(workspace(r))
	defer cancel()
	ping := time.NewTicker(25 * time.Second)
	defer ping.Stop()
	for {
		select {
		case <-r.Context().Done():
			return
		case e := <-events:
			writeEvent(w, e.Type, e)
			flusher.Flush()
		case <-ping.C:
			fmt.Fprint(w, ": ping\n\n")
			flusher.Flush()
		}
	}
}

func sse(w http.ResponseWriter) (http.Flusher, bool) {
	f, ok := w.(http.Flusher)
	if !ok {
		writeErr(w, http.StatusInternalServerError, errors.New("streaming unsupported"))
		return nil, false
	}
	w.Header().Set("Content-Type", "text/event-stream")
	w.Header().Set("Cache-Control", "no-cache")
	w.Header().Set("X-Accel-Buffering", "no")
	return f, true
}

func writeEvent(w http.ResponseWriter, name string, v any) {
	b, _ := json.Marshal(v)
	fmt.Fprintf(w, "event: %s\ndata: %s\n\n", name, b)
}

func writeJSON(w http.ResponseWriter, code int, v any) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(code)
	_ = json.NewEncoder(w).Encode(v)
}

func writeErr(w http.ResponseWriter, code int, err error) {
	writeJSON(w, code, map[string]string{"error": err.Error()})
}
