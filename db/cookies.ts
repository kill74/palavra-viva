import type { Cookies } from '@sveltejs/kit';

const CAMPO_SESSAO = 'pv_sessao';
const CAMPO_FLASH = 'pv_aviso';
const MAX_IDADE = 60 * 60 * 24 * 7;

/** `Secure` em HTTPS; em localhost HTTP é desligado para o desenvolvimento. */
function seguro(): boolean {
  const origem = (globalThis as {
    process?: { env?: Record<string, string | undefined> };
    Deno?: { env?: { get(n: string): string | undefined } };
  });
  const valor = origem.process?.env?.ORIGIN ?? origem.Deno?.env?.get?.('ORIGIN');
  return Boolean(valor && valor.startsWith('https://'));
}

export function definirSessao(cookies: Cookies, token: string): void {
  cookies.set(CAMPO_SESSAO, token, {
    path: '/',
    httpOnly: true,
    sameSite: 'lax',
    secure: seguro(),
    maxAge: MAX_IDADE
  });
}

export function terminarSessao(cookies: Cookies): void {
  cookies.delete(CAMPO_SESSAO, { path: '/' });
}

/** Mensagem de erro/aviso num cookie HttpOnly, em vez da query string. */
export function definirAviso(cookies: Cookies, texto: string): void {
  cookies.set(CAMPO_FLASH, texto, {
    path: '/',
    httpOnly: true,
    sameSite: 'lax',
    secure: seguro(),
    maxAge: 60
  });
}

export function lerAviso(cookies: Cookies): string | undefined {
  const valor = cookies.get(CAMPO_FLASH);
  if (valor) cookies.delete(CAMPO_FLASH, { path: '/' });
  return valor;
}

export const nomeCookieSessao = CAMPO_SESSAO;
