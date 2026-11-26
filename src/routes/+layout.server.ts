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
  const criancaId = utilizador ? criancaDoUtilizador(utilizador.id) ?? null : null;
  const repositorio = new RepositorioDb();
  // Cada conta vê apenas os seus dados: professoras a turma, crianças só a sua.
  const estado = await repositorio.carregar(
    utilizador?.papel === 'professora' ? utilizador.id : undefined,
    utilizador?.papel === 'crianca' ? criancaId ?? undefined : undefined
  );
  return { utilizador, criancaId, estado };
};
