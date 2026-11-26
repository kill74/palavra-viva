/** Utilitários de segurança partilhados pela base de dados e pela autenticação. */
import { argon2idAsync } from '@noble/hashes/argon2';

const SAL_TAMANHO = 16;
const CHAVE_TAMANHO = 32;

// Recomendação OWASP para Argon2id: 64 MB, 3 passagens, 4 paralelizações.
const ARGON_T = 3;
const ARGON_M = 64 * 1024;
const ARGON_P = 4;

// Parâmetros legados, mantidos apenas para verificar hashes antigos.
const PBKDF2_ITERACOES = 210_000;

function paraBase64(bytes: Uint8Array): string {
  return btoa(String.fromCharCode(...bytes));
}

function deBase64(texto: string): Uint8Array {
  return Uint8Array.from(atob(texto), (c) => c.charCodeAt(0));
}

function comparaConstante(a: Uint8Array, b: Uint8Array): boolean {
  if (a.length !== b.length) return false;
  let diferenca = 0;
  for (let i = 0; i < a.length; i++) diferenca |= a[i] ^ b[i];
  return diferenca === 0;
}

/** Cria um hash Argon2id com sal aleatório: `argon2id$t$m$p$salt$hash`. */
export async function hashPassword(password: string): Promise<string> {
  const sal = crypto.getRandomValues(new Uint8Array(SAL_TAMANHO));
  const chave = await argon2idAsync(password, sal, {
    t: ARGON_T,
    m: ARGON_M,
    p: ARGON_P,
    dkLen: CHAVE_TAMANHO,
    maxmem: ARGON_M * 2 * 1024,
    asyncTick: 10
  });
  return `argon2id$${ARGON_T}$${ARGON_M}$${ARGON_P}$${paraBase64(sal)}$${paraBase64(chave)}`;
}

/**
 * Verifica uma password. Aceita os formatos Argon2id e PBKDF2 (legado),
 * para não deslogar contas criadas antes desta atualização.
 */
export async function verificarPassword(password: string, guardado: string): Promise<boolean> {
  const partes = guardado.split('$');
  if (partes[0] === 'argon2id' && partes.length === 6) {
    const t = Number(partes[1]);
    const m = Number(partes[2]);
    const p = Number(partes[3]);
    if (![t, m, p].every(Number.isInteger) || t < 1 || m < 8 || p < 1) return false;
    const sal = deBase64(partes[4]);
    const esperado = deBase64(partes[5]);
    const obtido = await argon2idAsync(password, sal, {
      t, m, p, dkLen: esperado.length, maxmem: m * 2 * 1024, asyncTick: 10
    });
    return comparaConstante(obtido, esperado);
  }
  if (partes[0] === 'pbkdf2' && partes.length === 3) {
    const sal = deBase64(partes[1]);
    const esperado = deBase64(partes[2]);
    const obtido = await derivarPbkdf2(password, sal);
    return comparaConstante(obtido, esperado);
  }
  return false;
}

/** Hash legado, usado apenas na verificação de contas antigas. */
async function derivarPbkdf2(password: string, sal: Uint8Array): Promise<Uint8Array> {
  const material = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(password),
    'PBKDF2',
    false,
    ['deriveBits']
  );
  const bits = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', salt: new Uint8Array(sal), iterations: PBKDF2_ITERACOES, hash: 'SHA-256' },
    material,
    CHAVE_TAMANHO * 8
  );
  return new Uint8Array(bits);
}

/** Identificador opaco para sessões e contas. */
export function idSeguro(): string {
  return crypto.randomUUID();
}
