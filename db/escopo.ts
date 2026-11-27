/**
 * Resolução de permissões sobre as crianças da base de dados.
 *
 * Toda a leitura ou escrita de dados da aplicação passa por aqui: uma conta
 * só pode alcançar as crianças da sua própria turma (professora) ou a sua
 * própria criança (aluno). Nenhum ID vem da query string — apenas da sessão.
 */
import type { ContextoDados } from '../src/lib/repositorios/tipo.ts';
import { base } from './cliente.ts';

export type { ContextoDados };

/** IDs das crianças que a conta autenticada pode consultar. */
export function idsPermitidos(contexto: ContextoDados = {}): string[] {
  const db = base();
  if (contexto.professoraId) {
    return (db.prepare(`SELECT c.id FROM criancas c
      JOIN turmas t ON t.id = c.turma_id
      WHERE t.professora_id = ? ORDER BY c.id`)
      .all(contexto.professoraId) as Array<{ id: string }>).map((linha) => linha.id);
  }
  if (contexto.criancaId) {
    const linha = db.prepare('SELECT id FROM criancas WHERE id = ?')
      .get(contexto.criancaId) as { id: string } | undefined;
    return linha ? [linha.id] : [];
  }
  return [];
}

/** Falha rápida se um registo apontar para uma criança fora do escopo. */
export function exigirIds(ids: string[], permitidos: Set<string>, entidade: string): void {
  const extranhos = ids.filter((id) => !permitidos.has(id));
  if (extranhos.length > 0) {
    throw new Error(`${entidade} fora da turma autorizada: ${extranhos.join(', ')}`);
  }
}
