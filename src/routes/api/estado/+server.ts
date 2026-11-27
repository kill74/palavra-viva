/**
 * Sincronização de estado no modo servidor.
 *
 * A store do browser usa este endpoint sempre que uma alteração é feita.
 * O corpo é validado como uma cópia completa e gravado dentro do escopo da
 * sessão: nenhum ID de criança ou turma é aceite do cliente.
 */
import { error } from '@sveltejs/kit';
import { RepositorioDb } from '#lib/repositorios/db';
import { contextoDoUtilizador } from '#lib/autorizacao/contexto';
import { validarCopia } from '#lib/utils/backup';
import type { RequestHandler } from './$types';

function estadoDoCorpo(texto: string) {
  const resultado = validarCopia(texto);
  if (!resultado.dados) error(400, resultado.erros.join(' '));
  return resultado.dados;
}

export const GET: RequestHandler = async ({ locals }) => {
  const estado = await new RepositorioDb().carregar(contextoDoUtilizador(locals));
  return Response.json(estado, { headers: { 'Cache-Control': 'no-store' } });
};

export const PUT: RequestHandler = async ({ request, locals }) => {
  const contexto = contextoDoUtilizador(locals);
  const estado = estadoDoCorpo(await request.text());
  try {
    await new RepositorioDb().guardar(estado, contexto);
  } catch (erro) {
    error(400, erro instanceof Error ? erro.message : 'Não foi possível guardar os dados.');
  }
  return Response.json({ ok: true }, { headers: { 'Cache-Control': 'no-store' } });
};
