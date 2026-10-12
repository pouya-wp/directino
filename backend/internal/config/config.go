// Package config reads runtime settings from the environment.
package config

import (
	"encoding/base64"
	"errors"
	"os"
	"strconv"
	"time"
)

type Config struct {
	Addr string // HTTP listen address, e.g. ":8080"

	// Database. "sqlite" keeps everything in one local file for development;
	// "postgres" is the production setting on the VPS.
	DBDriver string
	DBDSN    string

	// 32-byte master key (base64) that seals channel sessions at rest.
	MasterKey []byte

	// LLM. The Anthropic SDK reads ANTHROPIC_API_KEY itself.
	LLMModel string

	// Telegram MTProto app credentials from my.telegram.org.
	TelegramAppID   int
	TelegramAppHash string

	// CORS origin of the web dashboard.
	WebOrigin string

	ShutdownGrace time.Duration
}

func Load() (Config, error) {
	c := Config{
		Addr:          env("DIRECTINO_ADDR", ":8080"),
		DBDriver:      env("DIRECTINO_DB_DRIVER", "sqlite"),
		DBDSN:         env("DIRECTINO_DB_DSN", "file:directino.db?_pragma=foreign_keys(1)&_pragma=busy_timeout(5000)"),
		LLMModel:      env("DIRECTINO_LLM_MODEL", "claude-opus-5-5"),
		TelegramAppHash: os.Getenv("TELEGRAM_APP_HASH"),
		WebOrigin:     env("DIRECTINO_WEB_ORIGIN", "http://localhost:3000"),
		ShutdownGrace: 15 * time.Second,
	}
	if v := os.Getenv("TELEGRAM_APP_ID"); v != "" {
		id, err := strconv.Atoi(v)
		if err != nil {
			return c, errors.New("TELEGRAM_APP_ID must be a number")
		}
		c.TelegramAppID = id
	}
	raw := os.Getenv("DIRECTINO_MASTER_KEY")
	if raw == "" {
		return c, errors.New("DIRECTINO_MASTER_KEY is required (32 random bytes, base64)")
	}
	key, err := base64.StdEncoding.DecodeString(raw)
	if err != nil || len(key) != 32 {
		return c, errors.New("DIRECTINO_MASTER_KEY must be 32 bytes encoded as base64")
	}
	c.MasterKey = key
	return c, nil
}

func env(k, def string) string {
	if v := os.Getenv(k); v != "" {
		return v
	}
	return def
}
