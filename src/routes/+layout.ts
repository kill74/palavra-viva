import { MODO_SERVIDOR } from '#lib/ambiente';

// A demonstração pública é pré-renderizada; a versão com base de dados
// precisa de servidor para as form actions e para o cookie de sessão.
export const prerender = !MODO_SERVIDOR;
export const trailingSlash = 'always';
