import { building } from '$app/environment';
import { MODO_SERVIDOR } from '#lib/ambiente';
import { criancaDoUtilizador } from '../../db/autenticacao.ts';
import { RepositorioDb } from '#lib/repositorios/db';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals }) => {
  if (building || !MODO_SERVIDOR) {
    return { utilizador: null, criancaId: null, estado: null };
  }
  const utilizador = locals.utilizador;
  // Na build com servidor os dados vêm da base de dados; na build estática
  // este ficheiro devolve apenas nulos e a store usa o localStorage.
  const repositorio = new RepositorioDb();
  const estado = await repositorio.carregar();
  return {
    utilizador,
    criancaId: utilizador ? criancaDoUtilizador(utilizador.id) ?? null : null,
    estado
  };
};
