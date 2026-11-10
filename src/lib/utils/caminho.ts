import { asset } from '$app/paths';

/**
 * Resolve um ficheiro de `static/` com a base configurada pelo SvelteKit.
 * O caminho é relativo à raiz de `static/`, sem barra inicial.
 */
export function recursoEstatico(caminho: string): string {
  return asset(caminho as Parameters<typeof asset>[0]);
}
