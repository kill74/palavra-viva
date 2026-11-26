/**
 * Logout: apaga a sessão na base de dados e remove o cookie HttpOnly.
 * Fazemos as duas coisas para que nem o servidor nem o browser guardem
 * uma credencial já inválida.
 */
import { redirect } from '@sveltejs/kit';
import { sair } from '../../../db/autenticacao.ts';
import { terminarSessao } from '../../../db/cookies.ts';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = ({ cookies }) => {
  sair(cookies.get('pv_sessao'));
  terminarSessao(cookies);
  redirect(303, '/entrar/');
};
