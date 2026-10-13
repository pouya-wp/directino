-- Directino schema (Postgres 17 + pgvector). Every row is scoped to a workspace and
-- protected by row-level security keyed on the `app.workspace` session setting.

CREATE EXTENSION IF NOT EXISTS vector;
CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE EXTENSION IF NOT EXISTS citext;

CREATE TABLE workspaces (
    id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name        text NOT NULL,
    edition     text NOT NULL CHECK (edition IN ('fa', 'en')),
    plan        text NOT NULL DEFAULT 'trial',
    created_at  timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE users (
    id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    email         citext UNIQUE,
    phone         text UNIQUE,
    name          text NOT NULL,
    password_hash text,                      -- argon2id; null for Google-only accounts
    created_at    timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE members (
    workspace_id uuid NOT NULL REFERENCES workspaces ON DELETE CASCADE,
    user_id      uuid NOT NULL REFERENCES users ON DELETE CASCADE,
    role         text NOT NULL CHECK (role IN ('owner', 'admin', 'agent')),
    PRIMARY KEY (workspace_id, user_id)
);

-- One row per connected account. Session material is sealed (AES-256-GCM) by the app.
CREATE TABLE channel_accounts (
    id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id  uuid NOT NULL REFERENCES workspaces ON DELETE CASCADE,
    channel       text NOT NULL CHECK (channel IN ('instagram', 'whatsapp', 'telegram')),
    external_id   text NOT NULL,             -- WhatsApp JID, Telegram user id, Instagram pk
    handle        text NOT NULL,
    session       bytea,                     -- sealed; WhatsApp keys live in whatsmeow tables
    proxy_url     text,                      -- dedicated egress per account (Instagram)
    daily_limit   int NOT NULL DEFAULT 300,
    status        text NOT NULL DEFAULT 'connected',
    connected_at  timestamptz NOT NULL DEFAULT now(),
    UNIQUE (channel, external_id)
);

CREATE TABLE contacts (
    id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id  uuid NOT NULL REFERENCES workspaces ON DELETE CASCADE,
    channel       text NOT NULL,
    external_id   text NOT NULL,
    handle        text,
    name          text,
    tags          text[] NOT NULL DEFAULT '{}',
    notes         text NOT NULL DEFAULT '',
    UNIQUE (workspace_id, channel, external_id)
);

CREATE TABLE conversations (
    id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id  uuid NOT NULL REFERENCES workspaces ON DELETE CASCADE,
    account_id    uuid NOT NULL REFERENCES channel_accounts ON DELETE CASCADE,
    contact_id    uuid NOT NULL REFERENCES contacts ON DELETE CASCADE,
    thread_id     text NOT NULL,
    status        text NOT NULL DEFAULT 'ai' CHECK (status IN ('needs', 'ai', 'closed')),
    human_only    boolean NOT NULL DEFAULT false,
    draft         jsonb,                     -- {text, confidence, intent, handoff, reason}
    updated_at    timestamptz NOT NULL DEFAULT now(),
    UNIQUE (account_id, thread_id)
);
CREATE INDEX conversations_inbox ON conversations (workspace_id, status, updated_at DESC);

CREATE TABLE messages (
    id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id  uuid NOT NULL REFERENCES conversations ON DELETE CASCADE,
    author           text NOT NULL CHECK (author IN ('customer', 'ai', 'human')),
    kind             text NOT NULL DEFAULT 'dm' CHECK (kind IN ('dm', 'comment')),
    body             text NOT NULL,
    external_id      text,
    created_at       timestamptz NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX messages_dedupe ON messages (conversation_id, external_id) WHERE external_id IS NOT NULL;
CREATE INDEX messages_thread ON messages (conversation_id, created_at);

-- Knowledge: products and FAQ, embedded for retrieval.
CREATE TABLE products (
    id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id  uuid NOT NULL REFERENCES workspaces ON DELETE CASCADE,
    name          text NOT NULL,
    sku           text,
    price_minor   bigint NOT NULL,           -- toman or cents, per workspace edition
    stock         int NOT NULL DEFAULT 0,
    embedding     vector(1024)
);

CREATE TABLE faqs (
    id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id  uuid NOT NULL REFERENCES workspaces ON DELETE CASCADE,
    question      text NOT NULL,
    answer        text NOT NULL,
    embedding     vector(1024)
);

CREATE TABLE settings (
    workspace_id    uuid PRIMARY KEY REFERENCES workspaces ON DELETE CASCADE,
    mode            text NOT NULL DEFAULT 'approve' CHECK (mode IN ('draft', 'approve', 'auto')),
    threshold       real NOT NULL DEFAULT 0.75,
    brand_voice     text NOT NULL DEFAULT '',
    reply_language  text NOT NULL DEFAULT 'match',
    rules           jsonb NOT NULL DEFAULT '[]'
);

-- Usage metering for plan limits and billing.
CREATE TABLE usage_daily (
    workspace_id  uuid NOT NULL REFERENCES workspaces ON DELETE CASCADE,
    day           date NOT NULL,
    ai_replies    int NOT NULL DEFAULT 0,
    input_tokens  bigint NOT NULL DEFAULT 0,
    output_tokens bigint NOT NULL DEFAULT 0,
    PRIMARY KEY (workspace_id, day)
);

-- Row-level security: the API sets `SET app.workspace = '<uuid>'` per request.
DO $$
DECLARE t text;
BEGIN
  FOREACH t IN ARRAY ARRAY['channel_accounts','contacts','conversations','products','faqs','settings','usage_daily'] LOOP
    EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY', t);
    EXECUTE format('CREATE POLICY ws_isolation ON %I USING (workspace_id = current_setting(''app.workspace'')::uuid)', t);
  END LOOP;
END $$;
