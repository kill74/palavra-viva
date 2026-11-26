import { error } from '@sveltejs/kit';
import type { Crianca } from '#lib/data/tipos';
import { eModoServidor } from '#lib/ambiente-servidor';
import {
  atualizarContaCrianca,
  criarContaCrianca
} from '../../../../db/autenticacao.ts';
import { RepositorioDb } from '#lib/repositorios/db';
import { base } from '../../../../db/cliente.ts';
import type { RequestHandler } from './$types';

/** Só professoras, e apenas crianças da sua própria turma. */
async function autorizar(locals: App.Locals, criancaId?: string): Promise<string> {
  if (!eModoServidor()) error(404, 'Não encontrado');
  if (!locals.utilizador || locals.utilizador.papel !== 'professora') {
    error(403, 'Acesso reservado à professora.');
  }
  const repositorio = new RepositorioDb();
  const estado = await repositorio.carregar(locals.utilizador.id);
  const daMinhaTurma = estado.criancas.some((c) => c.id === criancaId);
  if (criancaId && !daMinhaTurma) {
    // O id pode pertencer a outra turma: não podemos permitir que esta
    // professora o reutilize e sobrescreva os dados de outrem.
    const existente = base().prepare('SELECT id FROM criancas WHERE id = ?').get(criancaId);
    if (existente) error(403, 'Esta criança pertence a outra turma.');
  }
  return locals.utilizador.id;
}

/** Grava a criança na BD da professora (sem depender da store do browser). */
async function gravarCrianca(
  professoraId: string,
  crianca: Crianca
): Promise<{ nome: string; utilizadorId: string | null }> {
  const db = base();
  const existente = db.prepare('SELECT utilizador_id FROM criancas WHERE id = ?')
    .get(crianca.id) as { utilizador_id: string | null } | undefined;

  if (existente) {
    db.prepare(`UPDATE criancas SET nome=?, idade=?, fase=?, cor=?, nota=?,
      palavras_trabalhadas=? WHERE id=?`)
      .run(crianca.nome, crianca.idade, crianca.fase, crianca.cor, crianca.nota,
        JSON.stringify(crianca.palavrasTrabalhadas), crianca.id);
    return { nome: crianca.nome, utilizadorId: existente.utilizador_id };
  }

  // A coluna utilizador_id é obrigatória; associamos primeiro à professora
  // e `criarContaCrianca` troca pelo id da conta da criança.
  db.prepare(`INSERT INTO criancas
    (id, utilizador_id, turma_id, nome, idade, fase, cor, nota, palavras_trabalhadas)
    VALUES (?, ?, (SELECT id FROM turmas WHERE professora_id = ? LIMIT 1), ?, ?, ?, ?, ?, ?)`)
    .run(crianca.id, professoraId, professoraId, crianca.nome, crianca.idade,
      crianca.fase, crianca.cor, crianca.nota, JSON.stringify(crianca.palavrasTrabalhadas));
  return { nome: crianca.nome, utilizadorId: null };
}

export const POST: RequestHandler = async ({ request, locals }) => {
  const dados = await request.json().catch(() => null) as {
    crianca?: Crianca;
    email?: string;
    password?: string;
  } | null;

  if (!dados?.crianca?.id || !dados.crianca.nome || !dados.email || !dados.password) {
    return Response.json({ erro: 'Faltam dados da criança ou da conta.' }, { status: 400 });
  }
  const professorId = await autorizar(locals, dados.crianca.id);
  const alvo = await gravarCrianca(professorId, dados.crianca);

  if (alvo.utilizadorId) {
    const erros = await atualizarContaCrianca({
      utilizadorId: alvo.utilizadorId,
      email: dados.email,
      password: dados.password
    });
    if (erros.length > 0) return Response.json({ erro: erros.join(' ') }, { status: 400 });
    return Response.json({ ok: true });
  }

  const resultado = await criarContaCrianca({
    email: dados.email,
    nome: alvo.nome,
    password: dados.password,
    criancaId: dados.crianca.id
  });
  if (!resultado.utilizadorId) {
    return Response.json({ erro: resultado.erros.join(' ') }, { status: 400 });
  }
  return Response.json({ ok: true, utilizadorId: resultado.utilizadorId });
};
