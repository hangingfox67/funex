-- W1: User identity table + session linking
CREATE TABLE IF NOT EXISTS funex_user (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL,
  name TEXT,
  picture TEXT,
  google_id TEXT NOT NULL,
  destination_slug TEXT REFERENCES destination(slug),
  profile JSONB NOT NULL DEFAULT '{}',
  weekly_turns_used INTEGER NOT NULL DEFAULT 0,
  weekly_turns_reset_at TIMESTAMP NOT NULL DEFAULT now(),
  created_at TIMESTAMP NOT NULL DEFAULT now(),
  updated_at TIMESTAMP NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS user_google_id_idx ON funex_user(google_id);
CREATE INDEX IF NOT EXISTS user_email_idx ON funex_user(email);

-- Add user_id + channel to session (non-breaking — nullable)
ALTER TABLE session ADD COLUMN IF NOT EXISTS user_id TEXT REFERENCES funex_user(id);
ALTER TABLE session ADD COLUMN IF NOT EXISTS channel TEXT DEFAULT 'agent';
