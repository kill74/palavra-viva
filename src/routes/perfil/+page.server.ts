/**
 * Dados do perfil vindos do servidor: sessões ativas e estado do 2FA.
 * Na build estática não há conta nem base de dados, por isso devolvemos
 * listas vazias e a interface esconde estas secções.
 */
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
