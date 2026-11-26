import type { DatabaseSync } from 'node:sqlite';
import { ESQUEMA_INICIAL } from './schema.ts';
import { MIGRACAO_2FA } from './schema2.ts';

type Migração = { nome: string; sql: string };

const MIGRACOES: Migração[] = [
  { nome: '001_inicial', sql: ESQUEMA_INICIAL },
  { nome: '002_2fa', sql: MIGRACAO_2FA }
];

/** Aplica apenas as migrações ainda não registadas, em ordem. */
export function aplicarMigracoes(db: DatabaseSync): void {
  db.exec(`CREATE TABLE IF NOT EXISTS migracoes (
    nome TEXT PRIMARY KEY,
    aplicada_em TEXT NOT NULL
  )`);
  const aplicadas = new Set(
    (db.prepare('SELECT nome FROM migracoes').all() as Array<{ nome: string }>)
      .map((l) => l.nome)
  );
  for (const migracao of MIGRACOES) {
    if (aplicadas.has(migracao.nome)) continue;
    db.exec('BEGIN');
    try {
      db.exec(migracao.sql);
      db.prepare('INSERT INTO migracoes (nome, aplicada_em) VALUES (?, ?)')
        .run(migracao.nome, new Date().toISOString());
      db.exec('COMMIT');
    } catch (erro) {
      db.exec('ROLLBACK');
      throw erro;
    }
  }
}
