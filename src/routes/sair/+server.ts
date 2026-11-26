import { redirect } from '@sveltejs/kit';
import { sair } from '../../../db/autenticacao.ts';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = ({ cookies }) => {
  sair(cookies.get('pv_sessao'));
  cookies.delete('pv_sessao', { path: '/' });
  redirect(303, '/entrar/');
};
