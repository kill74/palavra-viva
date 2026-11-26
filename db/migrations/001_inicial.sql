-- Palavra Viva — esquema inicial (SQLite via node:sqlite no Deno 2.9)
-- Os identificadores são textuais para manter compatibilidade com a
-- demonstração estática (ex.: 'alice', 'rec-alice-galinha').

PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS utilizadores (
  id            TEXT PRIMARY KEY,
  email         TEXT NOT NULL UNIQUE COLLATE NOCASE,
  nome          TEXT NOT NULL,
  papel         TEXT NOT NULL CHECK (papel IN ('professora', 'crianca')),
  password_hash TEXT NOT NULL,
  criado_em     TEXT NOT NULL,
  ultimo_entrar TEXT
);

CREATE TABLE IF NOT EXISTS turmas (
  id         TEXT PRIMARY KEY,
  nome       TEXT NOT NULL,
  professora_id TEXT NOT NULL REFERENCES utilizadores(id) ON DELETE CASCADE,
  criado_em  TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS criancas (
  id            TEXT PRIMARY KEY,
  utilizador_id TEXT NOT NULL REFERENCES utilizadores(id) ON DELETE CASCADE,
  turma_id      TEXT REFERENCES turmas(id) ON DELETE SET NULL,
  nome          TEXT NOT NULL,
  idade         INTEGER NOT NULL CHECK (idade BETWEEN 3 AND 12),
  fase          INTEGER NOT NULL CHECK (fase BETWEEN 1 AND 6),
  cor           TEXT NOT NULL CHECK (cor IN ('coral', 'cobalto', 'verde', 'sol')),
  nota          TEXT NOT NULL DEFAULT '',
  palavras_trabalhadas TEXT NOT NULL DEFAULT '[]'
);

CREATE TABLE IF NOT EXISTS recursos (
  id              TEXT PRIMARY KEY,
  crianca_id      TEXT NOT NULL REFERENCES criancas(id) ON DELETE CASCADE,
  palavra_id      TEXT NOT NULL,
  palavra         TEXT NOT NULL,
  silabas         TEXT NOT NULL DEFAULT '[]',
  frase           TEXT NOT NULL DEFAULT '',
  tipo            TEXT NOT NULL CHECK (tipo IN
    ('cartao','reconhecimento','associacao','silabas','frase','rima','ditado','ordem')),
  fase            INTEGER NOT NULL CHECK (fase BETWEEN 1 AND 6),
  opcoes          TEXT NOT NULL DEFAULT '[]',
  resposta_correta TEXT,
  apoios          TEXT NOT NULL DEFAULT '{"imagem":false,"audio":false,"silabas":false}',
  estado          TEXT NOT NULL CHECK (estado IN ('rascunho','aprovado')),
  origem          TEXT NOT NULL CHECK (origem IN ('ia-previa','manual')),
  prompt          TEXT NOT NULL DEFAULT '',
  modelo          TEXT NOT NULL DEFAULT '',
  criado_em       TEXT NOT NULL,
  aprovado_em     TEXT,
  feedback_certo  TEXT NOT NULL DEFAULT '',
  feedback_errado TEXT NOT NULL DEFAULT '',
  validacao       TEXT NOT NULL DEFAULT '[]'
);

CREATE TABLE IF NOT EXISTS sessoes (
  id         TEXT PRIMARY KEY,
  crianca_id TEXT NOT NULL REFERENCES criancas(id) ON DELETE CASCADE,
  inicio     TEXT NOT NULL,
  fim        TEXT NOT NULL,
  respostas  TEXT NOT NULL DEFAULT '[]'
);

CREATE TABLE IF NOT EXISTS escritas (
  id         TEXT PRIMARY KEY,
  crianca_id TEXT NOT NULL REFERENCES criancas(id) ON DELETE CASCADE,
  palavra_id TEXT NOT NULL,
  data       TEXT NOT NULL,
  nota       TEXT NOT NULL DEFAULT ''
);

CREATE TABLE IF NOT EXISTS sessoes_login (
  id         TEXT PRIMARY KEY,
  utilizador_id TEXT NOT NULL REFERENCES utilizadores(id) ON DELETE CASCADE,
  criado_em  TEXT NOT NULL,
  expira_em  TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_recursos_crianca ON recursos(crianca_id);
CREATE INDEX IF NOT EXISTS idx_recursos_estado ON recursos(estado);
CREATE INDEX IF NOT EXISTS idx_sessoes_crianca ON sessoes(crianca_id);
CREATE INDEX IF NOT EXISTS idx_escritas_crianca ON escritas(crianca_id);
CREATE INDEX IF NOT EXISTS idx_sessoes_login_expira ON sessoes_login(expira_em);

CREATE TABLE IF NOT EXISTS tokens_recuperacao (
  id         TEXT PRIMARY KEY,
  utilizador_id TEXT NOT NULL REFERENCES utilizadores(id) ON DELETE CASCADE,
  criado_em  TEXT NOT NULL,
  expira_em  TEXT NOT NULL,
  usado_em   TEXT
);

CREATE INDEX IF NOT EXISTS idx_recuperacao_token ON tokens_recuperacao(id);
