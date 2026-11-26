import { redirect } from '@sveltejs/kit';
import { building } from '$app/environment';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = ({ locals, url }) => {
  if (building || !locals.utilizador || url.searchParams.has('trocar')) return {};
  const destino = locals.utilizador.papel === 'professora' ? '/professor/' : '/crianca/';
  redirect(303, destino);
};
