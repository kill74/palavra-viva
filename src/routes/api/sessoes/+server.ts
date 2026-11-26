/**
 * Termina todas as sessões ativas da conta autenticada, incluindo a atual.
 * O cliente desloca-se depois para `/entrar/`, onde o cookie deixou de ser
 * válido. Usado pelo botão "Terminar todas as sessões" do perfil.
 */
import { error } from '@sveltejs/kit';
import { eModoServidor } from '#lib/ambiente-servidor';
import { terminarTodasSessoes } from '../../../../db/autenticacao.ts';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = ({ locals }) => {
  if (!eModoServidor()) error(404, 'Não encontrado');
  if (!locals.utilizador) error(401, 'Sessão inválida.');
  terminarTodasSessoes(locals.utilizador.id);
  return Response.json({ ok: true });
};
