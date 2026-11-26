-- Segundo fator opcional para contas de professora.
ALTER TABLE utilizadores ADD COLUMN totp_secret TEXT;
ALTER TABLE utilizadores ADD COLUMN totp_ativo INTEGER NOT NULL DEFAULT 0;
ALTER TABLE utilizadores ADD COLUMN totp_recuperacao TEXT;

CREATE TABLE IF NOT EXISTS codigos_recuperacao (
  id       TEXT PRIMARY KEY,
  utilizador_id TEXT NOT NULL REFERENCES utilizadores(id) ON DELETE CASCADE,
  codigo   TEXT NOT NULL UNIQUE,
  usado_em TEXT
);
