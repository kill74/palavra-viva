/**
 * Reads a query parameter from the browser URL.
 *
 * Call this from `onMount` (or another client-only path). Reading
 * `page.url.searchParams` during prerender throws `url_search_unavailable_prerender`,
 * and reading `window.location` during SSR is impossible, so pages start from a
 * neutral state and hydrate the requested value after mount.
 */
export function parametroUrl(nome: string): string | null {
  if (typeof window === 'undefined') return null;
  return new URLSearchParams(window.location.search).get(nome);
}
