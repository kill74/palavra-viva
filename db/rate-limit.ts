/**
 * Limitador de tentativas em memória, por chave (IP + email).
 *
 * Não é uma solução distribuída — para uma única instância é suficiente e
 * impede força bruta. As entradas expiradas são removidas oportunisticamente.
 */
type Entrada = { tentativas: number; reiniciarEm: number };

const JANELA_MS = 15 * 60 * 1000;
const LIMITE = 5;
const registos = new Map<string, Entrada>();

export function verificador(chave: string, agora = Date.now()): {
  permitido: boolean;
  restantes: number;
} {
  limpar(agora);
  const entrada = registos.get(chave);
  if (!entrada || entrada.reiniciarEm <= agora) {
    return { permitido: true, restantes: LIMITE };
  }
  return { permitido: entrada.tentativas < LIMITE, restantes: Math.max(0, LIMITE - entrada.tentativas) };
}

export function registarFalha(chave: string, agora = Date.now()): void {
  const entrada = registos.get(chave);
  if (!entrada || entrada.reiniciarEm <= agora) {
    registos.set(chave, { tentativas: 1, reiniciarEm: agora + JANELA_MS });
  } else {
    entrada.tentativas += 1;
  }
}

export function limparSucesso(chave: string): void {
  registos.delete(chave);
}

function limpar(agora: number): void {
  for (const [chave, entrada] of registos) {
    if (entrada.reiniciarEm <= agora) registos.delete(chave);
  }
}
