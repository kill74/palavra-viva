/** Contrato da origem de dados. A implementação local usa localStorage; a de servidor usa SQLite. A store não precisa de saber qual está ativa. */
import type { Crianca, Recurso, RegistoEscrita, Sessao } from '#lib/data/tipos';

export type EstadoDados = {
  versao: 1;
  criancas: Crianca[];
  recursos: Recurso[];
  sessoes: Sessao[];
  escritas: RegistoEscrita[];
};

/**
 * Escopo de uma conta autenticada.
 *
 * Definido aqui (e não em `db/`) para que a build estática, que só usa
 * `localStorage`, não precise de resolver módulos de base de dados.
 */
export type ContextoDados = {
  professoraId?: string;
  criancaId?: string;
};

/**
 * Origem dos dados da aplicação.
 *
 * A implementação local usa `localStorage` (build estática e demonstração);
 * a implementação em base de dados fala com o servidor. A store não precisa
 * de saber qual está ativa.
 */
export interface Repositorio {
  /** No servidor, o contexto limita os dados à conta autenticada. */
  carregar(contexto?: ContextoDados): Promise<EstadoDados>;
  /** O contexto é ignorado na demonstração e obrigatório no servidor. */
  guardar(estado: EstadoDados, contexto?: ContextoDados): Promise<void>;
  /** Substitui os dados da turma autorizada, preservando as contas. */
  repor(estado: EstadoDados, contexto?: ContextoDados): Promise<void>;
}
