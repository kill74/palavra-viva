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
