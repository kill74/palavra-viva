import { building } from '$app/environment';
import { redirect, type Handle } from '@sveltejs/kit';
import { validarSessao } from '../db/autenticacao.ts';

export const handle: Handle = async ({ event, resolve }) => {
  // Durante o prerender da build estática não há sessão nem utilizadores:
  // a guarda real só corre no servidor com base de dados.
  if (building) return resolve(event);

  const token = event.cookies.get('pv_sessao');
  const utilizador = validarSessao(token) ?? null;
  event.locals.utilizador = utilizador;

  // A guarda de autoridade corre no servidor: um HTML estático não a contorna.
  const rota = event.route.id ?? '';
  if (rota.startsWith('/professor') || rota.startsWith('/perfil')) {
    if (!utilizador || utilizador.papel !== 'professora') {
      redirect(303, '/entrar/?perfil=professor');
    }
  }
  if (rota.startsWith('/crianca')) {
    if (!utilizador || utilizador.papel !== 'crianca') {
      redirect(303, '/entrar/?perfil=crianca');
    }
  }

  return resolve(event);
};
