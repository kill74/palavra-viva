import { assertEquals, assertRejects } from 'jsr:@std/assert';
import { base } from '../../../db/cliente.ts';
import type { Crianca } from '../data/tipos.ts';
import { RepositorioDb } from './db.ts';
import type { EstadoDados } from './tipo.ts';

const IDS = {
  profA: 'p-repo-a', profB: 'p-repo-b',
  turmaA: 't-repo-a', turmaB: 't-repo-b',
  utilA: 'u-repo-a', utilB: 'u-repo-b',
  criancaA: 'c-repo-a', criancaB: 'c-repo-b'
};

function estadoComRecurso(criancaId: string): EstadoDados {
  const crianca: Crianca = {
    id: criancaId, nome: criancaId, idade: 6, fase: 1,
    cor: 'coral', nota: '', palavrasTrabalhadas: []
  };
  return {
    versao: 1,
    criancas: [crianca],
    recursos: [{
      id: `rec-${criancaId}`, criancaId, palavraId: 'uva', palavra: 'uva',
      silabas: ['u', 'va'], frase: 'A uva é doce.', tipo: 'cartao', fase: 1,
      opcoes: [], apoios: { imagem: true, audio: true, silabas: false },
      estado: 'aprovado', origem: 'manual', prompt: '', modelo: '',
      criadoEm: '2026-01-01T00:00:00.000Z', feedbackCerto: 'Bem!',
      feedbackErrado: 'Tenta.', validacao: []
    }],
    sessoes: [],
    escritas: []
  };
}

Deno.test('RepositorioDb: leitura, escrita e reposição ficam presas à turma', async () => {
  const db = base();
  const agora = new Date().toISOString();
  const ctxA = { professoraId: IDS.profA };
  const ctxB = { professoraId: IDS.profB };

  try {
    for (const [id, papel, email] of [
      [IDS.profA, 'professora', 'repo-a@teste.pt'],
      [IDS.profB, 'professora', 'repo-b@teste.pt'],
      [IDS.utilA, 'crianca', 'repo-crianca-a@teste.pt'],
      [IDS.utilB, 'crianca', 'repo-crianca-b@teste.pt']
    ]) {
      db.prepare(`INSERT INTO utilizadores
        (id, email, nome, papel, password_hash, criado_em) VALUES (?, ?, ?, ?, ?, ?)`)
        .run(id, email, id, papel, 'hash-teste', agora);
    }
    db.prepare('INSERT INTO turmas (id, nome, professora_id, criado_em) VALUES (?, ?, ?, ?)')
      .run(IDS.turmaA, 'A', IDS.profA, agora);
    db.prepare('INSERT INTO turmas (id, nome, professora_id, criado_em) VALUES (?, ?, ?, ?)')
      .run(IDS.turmaB, 'B', IDS.profB, agora);
    for (const [id, util, turma] of [
      [IDS.criancaA, IDS.utilA, IDS.turmaA],
      [IDS.criancaB, IDS.utilB, IDS.turmaB]
    ]) {
      db.prepare(`INSERT INTO criancas
        (id, utilizador_id, turma_id, nome, idade, fase, cor, palavras_trabalhadas)
        VALUES (?, ?, ?, ?, 6, 1, 'coral', '[]')`).run(id, util, turma, id);
    }
    db.prepare(`INSERT INTO sessoes_login (id, utilizador_id, criado_em, expira_em)
      VALUES (?, ?, ?, ?)`).run('sess-repo-a', IDS.profA, agora, '2099-01-01T00:00:00.000Z');

    const repositorio = new RepositorioDb();
    const estadoA = estadoComRecurso(IDS.criancaA);
    const estadoB = estadoComRecurso(IDS.criancaB);

    assertEquals((await repositorio.carregar(ctxA)).criancas.map((c) => c.id), [IDS.criancaA]);
    assertEquals((await repositorio.carregar(ctxB)).criancas.map((c) => c.id), [IDS.criancaB]);

    await repositorio.guardar(estadoA, ctxA);
    assertEquals((await repositorio.carregar(ctxA)).recursos.length, 1);
    assertEquals((await repositorio.carregar(ctxB)).recursos.length, 0);

    // Uma professora não pode introduzir a criança da outra na sua cópia.
    const misto: EstadoDados = {
      ...estadoA,
      criancas: [...estadoA.criancas, ...estadoB.criancas]
    };
    await assertRejects(() => repositorio.guardar(misto, ctxA));

    // Repor a turma A não apaga dados da turma B nem sessões de login.
    await repositorio.repor(estadoA, ctxA);
    assertEquals((await repositorio.carregar(ctxB)).recursos.length, 0);
    assertEquals((await repositorio.carregar(ctxA)).recursos.length, 1);
    assertEquals(db.prepare('SELECT id FROM sessoes_login WHERE id = ?').get('sess-repo-a'),
      { id: 'sess-repo-a' });
  } finally {
    db.prepare('DELETE FROM sessoes_login WHERE id = ?').run('sess-repo-a');
    db.prepare('DELETE FROM sessoes WHERE crianca_id IN (?, ?)').run(IDS.criancaA, IDS.criancaB);
    db.prepare('DELETE FROM escritas WHERE crianca_id IN (?, ?)').run(IDS.criancaA, IDS.criancaB);
    db.prepare('DELETE FROM recursos WHERE crianca_id IN (?, ?)').run(IDS.criancaA, IDS.criancaB);
    db.prepare('DELETE FROM criancas WHERE id IN (?, ?)').run(IDS.criancaA, IDS.criancaB);
    db.prepare('DELETE FROM turmas WHERE id IN (?, ?)').run(IDS.turmaA, IDS.turmaB);
    db.prepare('DELETE FROM utilizadores WHERE id IN (?, ?, ?, ?)')
      .run(IDS.profA, IDS.profB, IDS.utilA, IDS.utilB);
  }
});
