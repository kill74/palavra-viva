import { DatabaseSync } from 'node:sqlite';
import { mkdirSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';

/** Caminho da base de dados local. Pode ser alterado por variável de ambiente. */
export function caminhoBase(): string {
  return Deno.env.get('PALAVRA_VIVA_DB') ?? join(import.meta.dirname ?? '.', 'dados', 'palavra-viva.sqlite');
}

let instancia: DatabaseSync | undefined;

/** Abre a base de dados, aplica migrações e devolve a ligação partilhada. */
export function base(): DatabaseSync {
  if (instancia) return instancia;
  const caminho = caminhoBase();
  mkdirSync(dirname(caminho), { recursive: true });
  const db = new DatabaseSync(caminho);
  db.exec('PRAGMA foreign_keys = ON');
  db.exec('PRAGMA journal_mode = WAL');
  const migracao = readFileSync(
    new URL('./migrations/001_inicial.sql', import.meta.url),
    'utf8'
  );
  db.exec(migracao);
  instancia = db;
  return db;
}

/** Fecha a ligação (útil em testes e no arranque controlado). */
export function fecharBase(): void {
  instancia?.close();
  instancia = undefined;
}

/** Executa uma função dentro de uma transação, com rollback em caso de erro. */
export function transacao<T>(fn: () => T): T {
  const db = base();
  db.exec('BEGIN');
  try {
    const resultado = fn();
    db.exec('COMMIT');
    return resultado;
  } catch (erro) {
    db.exec('ROLLBACK');
    throw erro;
  }
}
