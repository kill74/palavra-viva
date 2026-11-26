/**
 * Distingue a build estática (GitHub Pages) da build com servidor.
 * O valor é substituído em tempo de build pelo Vite.
 */
export const MODO_SERVIDOR: boolean = import.meta.env.VITE_MODO_SERVIDOR === '1';
