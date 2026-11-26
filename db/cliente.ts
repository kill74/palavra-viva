import { DatabaseSync } from 'node:sqlite';
import { mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { ESQUEMA_INICIAL } from './schema.ts';

/** Caminho da base de dados local. Pode ser alterado por variável de ambiente. */
export function caminhoBase(): string {
  // Funciona tanto no Deno (testes e seed) como no Node (servidor gerado).
  const ambiente = (globalThis as {
    Deno?: { env?: { get(nome: string): string | undefined } };
    process?: { env?: Record<string, string | undefined> };
  });
  const configurado = ambiente.Deno?.env?.get?.('PALAVRA_VIVA_DB') ??
    ambiente.process?.env?.PALAVRA_VIVA_DB;
  const raiz = import.meta.dirname ?? process.cwd();
  return configurado ?? join(raiz, 'dados', 'palavra-viva.sqlite');
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
  db.exec(ESQUEMA_INICIAL);
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
