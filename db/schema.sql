-- Схема базы данных «Время сдавать» для Neon (Postgres).
-- Выполните один раз в SQL-редакторе Neon (или через psql).

CREATE TABLE IF NOT EXISTS users (
  id            TEXT PRIMARY KEY,           -- "email:...", "phone:...", "vk:..."
  email         TEXT UNIQUE,
  phone         TEXT UNIQUE,
  name          TEXT NOT NULL,
  age           INT,
  plan          TEXT NOT NULL DEFAULT 'free',
  twofa         BOOLEAN NOT NULL DEFAULT FALSE,
  provider      TEXT NOT NULL,              -- email | phone | vk
  password_hash TEXT,                       -- scrypt (соль:хэш); пароль не хранится
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS reset_codes (
  email      TEXT PRIMARY KEY,
  code       TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL
);

CREATE TABLE IF NOT EXISTS progress (
  user_id    TEXT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  results    JSONB NOT NULL DEFAULT '{}',
  studied    JSONB NOT NULL DEFAULT '{}',
  exam_dates JSONB NOT NULL DEFAULT '{}',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
