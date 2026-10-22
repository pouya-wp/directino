// Command directino runs the API, the channel connections and the reply agent in one
// process. That is plenty for a single VPS; the pieces split cleanly later if needed.
package main

import (
	"context"
	"database/sql"
	"errors"
	"log/slog"
	"net/http"
	"os"
	"os/signal"
	"sync"
	"syscall"
	"time"

	_ "github.com/jackc/pgx/v5/stdlib"
	"go.mau.fi/whatsmeow/store/sqlstore"
	_ "modernc.org/sqlite"

	"directino/internal/accounts"
	"directino/internal/agent"
	"directino/internal/config"
	"directino/internal/domain"
	"directino/internal/httpapi"
	"directino/internal/hub"
	"directino/internal/knowledge"
	"directino/internal/llm/claude"
	"directino/internal/pacing"
	"directino/internal/runtime"
	"directino/internal/store"
)

// nameBook maps workspace id -> display name for the agent's shop context.
type nameBook struct {
	mu sync.Mutex
	m  map[string]string
}

func newNameBook() *nameBook { return &nameBook{m: map[string]string{}} }
func (n *nameBook) set(ws, name string) {
	n.mu.Lock()
	n.m[ws] = name
	n.mu.Unlock()
}
func (n *nameBook) get(ws string) string {
	n.mu.Lock()
	defer n.mu.Unlock()
	if v := n.m[ws]; v != "" {
		return v
	}
	return "our shop"
}

func main() {
	log := slog.New(slog.NewJSONHandler(os.Stdout, nil))
	if err := run(log); err != nil {
		log.Error("fatal", "err", err)
		os.Exit(1)
	}
}

func run(log *slog.Logger) error {
	cfg, err := config.Load()
	if err != nil {
		return err
	}
	ctx, stop := signal.NotifyContext(context.Background(), os.Interrupt, syscall.SIGTERM)
	defer stop()

	// The WhatsApp device store needs SQL. Local dev uses pure-Go SQLite, production Postgres.
	driver, dialect := "sqlite", "sqlite3"
	if cfg.DBDriver == "postgres" {
		driver, dialect = "pgx", "postgres"
	}
	db, err := sql.Open(driver, cfg.DBDSN)
	if err != nil {
		return err
	}
	defer db.Close()
	if driver == "sqlite" {
		db.SetMaxOpenConns(1) // SQLite allows one writer
	}
	wa := sqlstore.NewWithDB(db, dialect, nil)
	if err := wa.Upgrade(ctx); err != nil {
		return err
	}

	st := store.NewMemory()
	h := hub.New()

	// Each new signup gets starter settings and a sample catalog so the dashboard
	// isn't empty before the shop fills in its own knowledge.
	names := newNameBook()
	acc := accounts.NewMemory()
	acc.OnSignUp = func(workspace, name, edition string) {
		names.set(workspace, name)
		st.SetKnowledge(workspace, demoKnowledge())
		_ = st.SaveSettings(ctx, workspace, domain.DefaultSettings())
	}

	ag := &agent.Agent{
		Store:    st,
		Drafter:  claude.New(cfg.LLMModel),
		Pacer:    pacing.New(300),
		Hub:      h,
		Log:      log,
		Sleep:    agent.SleepCtx,
		ShopName: names.get,
	}
	rt := &runtime.Runtime{Agent: ag, WAStore: wa, Log: log, Workers: 8}
	rt.Start(ctx)

	api := &httpapi.Server{
		Agent: ag, Store: st, Accounts: acc, Hub: h, Linker: rt, Log: log,
		WebOrigin: cfg.WebOrigin, Secure: os.Getenv("DIRECTINO_SECURE_COOKIE") == "1",
	}
	srv := &http.Server{Addr: cfg.Addr, Handler: api.Routes(), ReadHeaderTimeout: 10 * time.Second}

	errc := make(chan error, 1)
	go func() {
		log.Info("listening", "addr", cfg.Addr)
		errc <- srv.ListenAndServe()
	}()
	select {
	case err := <-errc:
		if !errors.Is(err, http.ErrServerClosed) {
			return err
		}
	case <-ctx.Done():
	}
	shutdown, cancel := context.WithTimeout(context.Background(), cfg.ShutdownGrace)
	defer cancel()
	return srv.Shutdown(shutdown)
}

// Placeholder catalog until the dashboard's Knowledge page is wired to the API.
func demoKnowledge() knowledge.Base {
	return knowledge.Base{
		Products: []knowledge.Product{
			{Name: "ست کتان Linen set", SKU: "LN-001", Price: "1,480,000 تومان", Stock: 38},
			{Name: "شال ابریشم Silk scarf", SKU: "SK-014", Price: "590,000 تومان", Stock: 6},
			{Name: "کت پشمی Wool coat", SKU: "WC-203", Price: "4,200,000 تومان", Stock: 0},
		},
		FAQs: []knowledge.FAQ{
			{Q: "ارسال به شهرستان دارین؟ shipping", A: "بله، با پست پیشتاز به همه‌ی شهرها، ۲ تا ۴ روز کاری. برای خرید بالای ۲ میلیون رایگان."},
			{Q: "امکان تعویض هست؟ exchange return", A: "تا ۷ روز بعد از تحویل، اگه محصول سالم باشه."},
		},
	}
}
