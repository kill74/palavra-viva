import { building } from '$app/environment';
import { redirect, type Handle } from '@sveltejs/kit';
import { origemConfigurada } from '#lib/ambiente-servidor';
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

  const response = await resolve(event);

  // O CSP é gerado pelo SvelteKit a partir de `vite.config.ts`, com nonces
  // por pedido (ou hashes no prerender). Aqui só acrescentamos o resto.
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  response.headers.set('Cross-Origin-Opener-Policy', 'same-origin');

  // HSTS só faz sentido em HTTPS. Em HTTP local não é enviado, para não
  // bloquear o desenvolvimento com ORIGIN=http://localhost.
  if (origemConfigurada()?.startsWith('https://')) {
    response.headers.set(
      'Strict-Transport-Security',
      'max-age=31536000; includeSubDomains'
    );
  }

  return response;
};
