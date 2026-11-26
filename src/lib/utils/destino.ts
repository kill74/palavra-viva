type Papel = 'professora' | 'crianca';

/** Destinos internos permitidos após o login. */
const DESTINOS: Record<Papel, Set<string>> = {
  professora: new Set(['/professor/', '/perfil/', '/professor/crianca/']),
  crianca: new Set(['/crianca/', '/crianca/sessao/'])
};

/**
 * Valida um destino de redirecionamento.
 *
 * Rejeita URLs externas, esquemas, barras duplas, barras invertidas e `@`
 * (todos usados em open redirects), e só aceita rotas da whitelist do papel.
 */
export function destinoSeguro(destino: string, papel: Papel): string | undefined {
  if (!destino.startsWith('/') || destino.startsWith('//')) return undefined;
  if (/[\\@]/.test(destino) || destino.includes('//')) return undefined;
  const caminho = destino.split('?')[0];
  return DESTINOS[papel].has(caminho) ? destino : undefined;
}
