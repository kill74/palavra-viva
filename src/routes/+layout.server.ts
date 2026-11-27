import { building } from '$app/environment';
import { eModoServidor } from '#lib/ambiente-servidor';
import { contextoDoUtilizador } from '#lib/autorizacao/contexto';
import { RepositorioDb } from '#lib/repositorios/db';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals }) => {
  if (building || !eModoServidor()) {
    return { utilizador: null, criancaId: null, estado: null };
  }
  const utilizador = locals.utilizador;
  // Na build com servidor os dados vêm da base de dados; na build estática
  // este ficheiro devolve apenas nulos e a store usa o localStorage.
  const contexto = utilizador ? contextoDoUtilizador(locals) : undefined;
  const criancaId = contexto?.criancaId ?? null;
  const repositorio = new RepositorioDb();
  // Cada conta vê apenas os seus dados: professoras a turma, crianças só a sua.
  const estado = await repositorio.carregar(contexto);
  return { utilizador, criancaId, estado };
};
