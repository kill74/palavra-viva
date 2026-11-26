import { building } from '$app/environment';
import { eModoServidor } from '#lib/ambiente-servidor';
import { listarSessoes } from '../../../db/autenticacao.ts';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = ({ locals }) => {
  if (building || !eModoServidor() || !locals.utilizador) return { sessoes: [] };
  return { sessoes: listarSessoes(locals.utilizador.id) };
};
