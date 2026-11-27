import { error } from '@sveltejs/kit';
import { RepositorioDb } from '#lib/repositorios/db';
import { contextoDaProfessora } from '#lib/autorizacao/contexto';
import { validarCopia } from '#lib/utils/backup';
import type { RequestHandler } from './$types';

/** Só professoras podem exportar/importar, e apenas a sua própria turma. */

export const GET: RequestHandler = async ({ locals }) => {
  const contexto = contextoDaProfessora(locals);
  const estado = await new RepositorioDb().carregar(contexto);
  return Response.json(estado, {
    headers: { 'Cache-Control': 'no-store' }
  });
};

export const POST: RequestHandler = async ({ request, locals }) => {
  const contexto = contextoDaProfessora(locals);
  let texto: string;
  try {
    texto = await request.text();
  } catch {
    error(400, 'Não foi possível ler o ficheiro.');
  }

  const resultado = validarCopia(texto);
  if (!resultado.dados) {
    return Response.json({ erro: resultado.erros.join(' ') }, { status: 400 });
  }

  const repositorio = new RepositorioDb();
  // A cópia não pode introduzir crianças de outra turma nem omitir crianças
  // desta: comparamos com o estado atual antes de substituir qualquer coisa.
  const atual = await repositorio.carregar(contexto);
  const permitidos = new Set(atual.criancas.map((c) => c.id));
  const copia = resultado.dados;
  const divergentes = copia.criancas.filter((c) => !permitidos.has(c.id));
  const omissas = atual.criancas.filter((c) => !copia.criancas.some((d) => d.id === c.id));
  if (divergentes.length > 0 || omissas.length > 0 || copia.criancas.length === 0) {
    return Response.json(
      { erro: 'A cópia tem de incluir exatamente as crianças desta turma.' },
      { status: 400 }
    );
  }

  try {
    await repositorio.repor(copia, contexto);
  } catch (erro) {
    error(400, erro instanceof Error ? erro.message : 'Não foi possível importar a cópia.');
  }
  return Response.json({ ok: true });
};
