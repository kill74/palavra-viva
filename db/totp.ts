/** TOTP (RFC 6238) com HMAC-SHA1 via WebCrypto, sem dependências externas. */

const ALFABETO = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
const PERIODO = 30;
const JANELA = 1; // aceita códigos do período anterior e seguinte

export function gerarSecret(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(20));
  return base32(bytes);
}

function base32(bytes: Uint8Array): string {
  let bits = '';
  for (const b of bytes) bits += b.toString(2).padStart(8, '0');
  let saida = '';
  for (let i = 0; i < bits.length; i += 5) {
    saida += ALFABETO[parseInt(bits.slice(i, i + 5).padEnd(5, '0'), 2)];
  }
  return saida;
}

function deBase32(texto: string): Uint8Array {
  let bits = '';
  for (const c of texto.toUpperCase().replace(/=+$/, '')) {
    const indice = ALFABETO.indexOf(c);
    if (indice < 0) throw new Error('Secret inválido.');
    bits += indice.toString(2).padStart(5, '0');
  }
  const bytes: number[] = [];
  for (let i = 0; i + 8 <= bits.length; i += 8) {
    bytes.push(parseInt(bits.slice(i, i + 8), 2));
  }
  return new Uint8Array(bytes);
}

async function codigo(secret: string, passo: number): Promise<string> {
  const chave = await crypto.subtle.importKey(
    'raw',
    new Uint8Array(deBase32(secret)),
    { name: 'HMAC', hash: 'SHA-1' },
    false,
    ['sign']
  );
  const mensagem = new Uint8Array(8);
  let resto = passo;
  for (let i = 7; i >= 0; i--) {
    mensagem[i] = resto & 0xff;
    resto = Math.floor(resto / 256);
  }
  const assinatura = new Uint8Array(
    await crypto.subtle.sign('HMAC', chave, mensagem)
  );
  const deslocamento = assinatura[assinatura.length - 1] & 0x0f;
  const valor =
    ((assinatura[deslocamento] & 0x7f) << 24) |
    (assinatura[deslocamento + 1] << 16) |
    (assinatura[deslocamento + 2] << 8) |
    assinatura[deslocamento + 3];
  return String(valor % 1_000_000).padStart(6, '0');
}

/** Código válido para o período atual (útil em testes e configuração). */
export function codigoAtual(secret: string): Promise<string> {
  return codigo(secret, Math.floor(Date.now() / 1000 / PERIODO));
}

/** Verifica um código TOTP, aceitando uma janela de ±1 período. */
export async function verificarTotp(secret: string, codigoUtilizador: string): Promise<boolean> {
  if (!/^\d{6}$/.test(codigoUtilizador)) return false;
  const passo = Math.floor(Date.now() / 1000 / PERIODO);
  for (let delta = -JANELA; delta <= JANELA; delta++) {
    if (await codigo(secret, passo + delta) === codigoUtilizador) return true;
  }
  return false;
}

/** URI para configurar a app de autenticação. */
export function uriTotp(secret: string, email: string): string {
  const emissor = encodeURIComponent('Palavra Viva');
  const conta = encodeURIComponent(email);
  return `otpauth://totp/${emissor}:${conta}?secret=${secret}&issuer=${emissor}&algorithm=SHA1&digits=6&period=${PERIODO}`;
}
