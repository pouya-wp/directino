# Directino backend (Go)

One process runs the API, the channel connections and the reply agent. It is built for a
single VPS in Germany and splits cleanly later if needed.

```
platform event ─► connector ─► runtime queue ─► agent ─► knowledge ─► Claude draft
                                                  │
                                         policy (mode, confidence, handoff)
                                                  │
                         dashboard (SSE) ◄── store ──► pacer ─► connector.Send
```

## Packages

| Package | Role |
|---|---|
| `internal/channels` | `Connector` contract every platform implements |
| `internal/channels/whatsapp` | Linked device over the WhatsApp Web multi-device protocol (whatsmeow), QR login. **Working.** |
| `internal/channels/telegram` | MTProto user session (gotd/td), QR login. **Planned, documented in the file.** |
| `internal/channels/instagram` | Private mobile-app API, username/password + challenge. **Planned, documented in the file.** |
| `internal/agent` | Inbound → draft → policy → paced send; approve and human takeover |
| `internal/llm/claude` | Claude Messages API with a strict `send_reply` tool returning text + confidence |
| `internal/pacing` | Human timing (read pause, typing time, jitter) and per-account daily caps |
| `internal/crypto` | AES-256-GCM sealing of session material, per-workspace keys via HKDF |
| `internal/knowledge` | Catalog + FAQ retrieval (keywords now, pgvector next) |
| `internal/store` | Store contract + in-memory implementation; Postgres schema in `migrations/` |
| `internal/httpapi` | JSON + SSE API for the dashboard |

## Run locally

```bash
export DIRECTINO_MASTER_KEY=$(openssl rand -base64 32)
export ANTHROPIC_API_KEY=...        # needed only when messages arrive
go run ./cmd/directino              # listens on :8080, SQLite file directino.db
```

Link WhatsApp: `POST /v1/channels/whatsapp/login` streams `qr` events; render the payload
as a QR code and scan it from WhatsApp > Linked devices.

## Deploy (VPS)

```bash
cp .env.example .env   # fill it in
cd deploy && docker compose up -d --build
```

## Not done yet

- Postgres implementation of `store.Store` (schema is ready)
- User auth and workspaces (a shared `DIRECTINO_API_TOKEN` guards the API meanwhile)
- Telegram and Instagram connectors
- Wiring the dashboard to this API (it still runs on mock data)
