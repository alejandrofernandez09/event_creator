-- ─── Extensão UUID (necessária para gen_random_uuid()) ────────────────────────
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ─── Enums ────────────────────────────────────────────────────────────────────

CREATE TYPE account_status AS ENUM ('active', 'suspended');
CREATE TYPE order_status   AS ENUM ('PENDING', 'CONFIRMED', 'CANCELED', 'EXPIRED');
CREATE TYPE rsvp_status    AS ENUM ('confirmed', 'declined', 'pending');

-- ─── accounts ─────────────────────────────────────────────────────────────────
-- Configuração financeira do dono do evento

CREATE TABLE accounts (
    id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_name  TEXT        NOT NULL,
    email       TEXT        NOT NULL UNIQUE,
    asaas_key   TEXT        NOT NULL DEFAULT '',
    wallet_id   TEXT        NOT NULL DEFAULT '',
    status      account_status NOT NULL DEFAULT 'active',
    created_at  TIMESTAMP   NOT NULL DEFAULT NOW()
);

-- ─── events ───────────────────────────────────────────────────────────────────
-- Hub central de cada evento (ex: /julia-30)

CREATE TABLE events (
    id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    slug        TEXT        NOT NULL UNIQUE,
    account_id  UUID        NOT NULL REFERENCES accounts(id),
    name        TEXT        NOT NULL,
    date        TIMESTAMP   NOT NULL,
    theme_json  TEXT        NOT NULL DEFAULT '{}',
    description TEXT        NOT NULL DEFAULT '',
    created_at  TIMESTAMP   NOT NULL DEFAULT NOW()
);

-- ─── products ─────────────────────────────────────────────────────────────────
-- Itens da lista de presentes (preço em centavos: 20000 = R$200,00)

CREATE TABLE products (
    id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id    UUID        NOT NULL REFERENCES events(id),
    name        TEXT        NOT NULL,
    description TEXT        NOT NULL DEFAULT '',
    price       INTEGER     NOT NULL,
    img_url     TEXT        NOT NULL DEFAULT '',
    available   INTEGER     NOT NULL DEFAULT 1,
    created_at  TIMESTAMP   NOT NULL DEFAULT NOW()
);

-- ─── orders ───────────────────────────────────────────────────────────────────
-- Rastreio financeiro — status atualizado SOMENTE via webhook Asaas

CREATE TABLE orders (
    id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id    UUID        NOT NULL REFERENCES events(id),
    product_id  UUID        REFERENCES products(id),
    guest_name  TEXT        NOT NULL,
    guest_email TEXT        NOT NULL DEFAULT '',
    amount      INTEGER     NOT NULL,
    status      order_status NOT NULL DEFAULT 'PENDING',
    pix_id      TEXT        NOT NULL DEFAULT '',
    pix_code    TEXT        NOT NULL DEFAULT '',
    pix_expiry  TIMESTAMP,
    created_at  TIMESTAMP   NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMP   NOT NULL DEFAULT NOW()
);

-- ─── rsvps ────────────────────────────────────────────────────────────────────
-- Confirmações de presença

CREATE TABLE rsvps (
    id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id    UUID        NOT NULL REFERENCES events(id),
    guest_name  TEXT        NOT NULL,
    guest_email TEXT        NOT NULL DEFAULT '',
    phone       TEXT        NOT NULL DEFAULT '',
    status      rsvp_status NOT NULL DEFAULT 'confirmed',
    message     TEXT        NOT NULL DEFAULT '',
    created_at  TIMESTAMP   NOT NULL DEFAULT NOW()
);

-- ─── Índices de performance ───────────────────────────────────────────────────

CREATE INDEX idx_events_slug        ON events(slug);
CREATE INDEX idx_events_account_id  ON events(account_id);
CREATE INDEX idx_products_event_id  ON products(event_id);
CREATE INDEX idx_orders_event_id    ON orders(event_id);
CREATE INDEX idx_orders_pix_id      ON orders(pix_id);
CREATE INDEX idx_orders_status      ON orders(status);
CREATE INDEX idx_rsvps_event_id     ON rsvps(event_id);

-- ─── Verificação ──────────────────────────────────────────────────────────────
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;