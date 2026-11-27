/**
 * Constrói o contexto de dados a partir da sessão validada pelo cookie.
 *
 * É o único ponto da aplicação que transforma `locals.utilizador` em escopo
 * de base de dados. Nenhum endpoint aceita um ID de turma ou de criança vindo
 * do cliente — o que impede IDOR entre contas.
 */
import { error } from '@sveltejs/kit';
import { eModoServidor } from '#lib/ambiente-servidor';
import { criancaDoUtilizador } from '../../../db/autenticacao.ts';
import type { ContextoDados } from '../../../db/escopo.ts';

export function contextoDoUtilizador(locals: App.Locals): ContextoDados {
  if (!eModoServidor()) error(404, 'Não encontrado');
  const utilizador = locals.utilizador;
  if (!utilizador) error(401, 'Sessão inválida.');

  if (utilizador.papel === 'professora') return { professoraId: utilizador.id };
  const criancaId = criancaDoUtilizador(utilizador.id);
  if (!criancaId) error(403, 'Esta conta não tem uma criança associada.');
  return { criancaId };
}

/** Exige perfil de professora, devolvendo o contexto dessa turma. */
export function contextoDaProfessora(
  locals: App.Locals
): ContextoDados & { professoraId: string } {
  const contexto = contextoDoUtilizador(locals);
  if (!contexto.professoraId) error(403, 'Acesso reservado à professora.');
  return contexto as ContextoDados & { professoraId: string };
}
