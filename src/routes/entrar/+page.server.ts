/**
 * Carregamento da página de entrada na build com servidor.
 *
 * Lê e consome o aviso "flash" guardado num cookie HttpOnly, para que
 * mensagens de erro não apareçam na URL. Se já houver sessão válida, envia a
 * pessoa diretamente para a sua área — exceto com `?trocar=1`, usado para
 * escolher outra identidade.
 */
import { building } from '$app/environment';
import { redirect } from '@sveltejs/kit';
import { lerAviso } from '../../../db/cookies.ts';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = ({ locals, url, cookies }) => {
  const aviso = lerAviso(cookies);
  if (building || !locals.utilizador || url.searchParams.has('trocar')) return { aviso };
  const destino = locals.utilizador.papel === 'professora' ? '/professor/' : '/crianca/';
  redirect(303, destino);
};
