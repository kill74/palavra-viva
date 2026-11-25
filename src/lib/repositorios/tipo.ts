import type { Crianca, Recurso, RegistoEscrita, Sessao } from '#lib/data/tipos';

export type EstadoDados = {
  versao: 1;
  criancas: Crianca[];
  recursos: Recurso[];
  sessoes: Sessao[];
  escritas: RegistoEscrita[];
};

/**
 * Origem dos dados da aplicação.
 *
 * A implementação local usa `localStorage` (build estático e demonstração);
 * a implementação em base de dados fala com o servidor. A store não precisa
 * de saber qual está ativa.
 */
export interface Repositorio {
  carregar(): Promise<EstadoDados>;
  guardar(estado: EstadoDados): Promise<void>;
  repor(estado: EstadoDados): Promise<void>;
}
