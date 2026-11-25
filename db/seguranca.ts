/** Utilitários de segurança partilhados pela base de dados e pela autenticação. */

const ITERACOES = 210_000;
const SAL_TAMANHO = 16;
const CHAVE_TAMANHO = 32;

function paraBase64(bytes: Uint8Array): string {
  return btoa(String.fromCharCode(...bytes));
}

function deBase64(texto: string): Uint8Array {
  return Uint8Array.from(atob(texto), (c) => c.charCodeAt(0));
}

/** Cria um hash PBKDF2-SHA256 com sal aleatório: `pbkdf2$salt$hash`. */
export async function hashPassword(password: string): Promise<string> {
  const sal = crypto.getRandomValues(new Uint8Array(SAL_TAMANHO));
  const chave = await derivar(password, sal);
  return `pbkdf2$${paraBase64(sal)}$${paraBase64(chave)}`;
}

/** Verifica uma password contra um hash guardado, em tempo constante. */
export async function verificarPassword(password: string, guardado: string): Promise<boolean> {
  const partes = guardado.split('$');
  if (partes.length !== 3 || partes[0] !== 'pbkdf2') return false;
  const sal = deBase64(partes[1]);
  const esperado = deBase64(partes[2]);
  const obtido = await derivar(password, sal);
  if (obtido.length !== esperado.length) return false;
  let diferenca = 0;
  for (let i = 0; i < obtido.length; i++) diferenca |= obtido[i] ^ esperado[i];
  return diferenca === 0;
}

async function derivar(password: string, sal: Uint8Array): Promise<Uint8Array> {
  const material = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(password),
    'PBKDF2',
    false,
    ['deriveBits']
  );
  const bits = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', salt: new Uint8Array(sal), iterations: ITERACOES, hash: 'SHA-256' },
    material,
    CHAVE_TAMANHO * 8
  );
  return new Uint8Array(bits);
}

/** Identificador opaco para sessões e contas. */
export function idSeguro(): string {
  return crypto.randomUUID();
}
