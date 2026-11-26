import { building } from '$app/environment';
import { eModoServidor } from '#lib/ambiente-servidor';
import { estado2fa, listarSessoes } from '../../../db/autenticacao.ts';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = ({ locals }) => {
  if (building || !eModoServidor() || !locals.utilizador) return { sessoes: [] };
  return {
    sessoes: listarSessoes(locals.utilizador.id),
    doisFatores: estado2fa(locals.utilizador.id)
  };
};
