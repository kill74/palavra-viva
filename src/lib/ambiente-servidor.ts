/** Detecta a build com servidor a partir do ambiente do processo Node/Deno. */
export function eModoServidor(): boolean {
  const ambiente = globalThis as {
    process?: { env?: Record<string, string | undefined> };
    Deno?: { env?: { get(nome: string): string | undefined } };
  };
  return (ambiente.process?.env?.MODO_SERVIDOR ??
    ambiente.Deno?.env?.get?.('MODO_SERVIDOR')) === '1';
}
