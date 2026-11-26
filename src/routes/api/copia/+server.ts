import { error } from '@sveltejs/kit';
import { MODO_SERVIDOR } from '#lib/ambiente';
import { RepositorioDb } from '#lib/repositorios/db';
import { validarCopia } from '#lib/utils/backup';
import type { RequestHandler } from './$types';

/** Só professoras podem exportar/importar, e apenas a sua própria turma. */
function professoraId(locals: App.Locals): string {
  if (!MODO_SERVIDOR) error(404, 'Não encontrado');
  if (!locals.utilizador || locals.utilizador.papel !== 'professora') {
    error(403, 'Acesso reservado à professora.');
  }
  return locals.utilizador.id;
}

export const GET: RequestHandler = async ({ locals }) => {
  const repositorio = new RepositorioDb();
  const estado = await repositorio.carregar(professoraId(locals));
  return Response.json(estado, {
    headers: { 'Cache-Control': 'no-store' }
  });
};

export const POST: RequestHandler = async ({ request, locals }) => {
  const id = professoraId(locals);
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
  // A cópia não pode introduzir crianças de outra turma: comparamos com o
  // estado atual da professora autenticada antes de substituir qualquer coisa.
  const atual = await repositorio.carregar(id);
  const permitidos = new Set(atual.criancas.map((c) => c.id));
  const extranhos = resultado.dados.criancas.filter((c) => !permitidos.has(c.id));
  if (extranhos.length > 0 || resultado.dados.criancas.length === 0) {
    return Response.json(
      { erro: 'A cópia contém crianças que não pertencem a esta turma.' },
      { status: 400 }
    );
  }

  await repositorio.repor(resultado.dados);
  return Response.json({ ok: true });
};
