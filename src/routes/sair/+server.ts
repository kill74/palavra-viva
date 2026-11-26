import { redirect } from '@sveltejs/kit';
import { sair } from '../../../db/autenticacao.ts';
import { terminarSessao } from '../../../db/cookies.ts';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = ({ cookies }) => {
  sair(cookies.get('pv_sessao'));
  terminarSessao(cookies);
  redirect(303, '/entrar/');
};
