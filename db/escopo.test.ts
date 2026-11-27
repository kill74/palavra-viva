import { assertEquals, assertThrows } from 'jsr:@std/assert';
import { base } from './cliente.ts';
import { exigirIds, idsPermitidos } from './escopo.ts';

Deno.test('escopo: uma professora só alcança as crianças das suas turmas', () => {
  const db = base();
  const agora = new Date().toISOString();
  const ids = {
    profA: 'p-escopo-a', profB: 'p-escopo-b',
    turmaA: 't-escopo-a', turmaB: 't-escopo-b',
    utilA: 'u-escopo-a', utilB: 'u-escopo-b',
    criancaA: 'c-escopo-a', criancaB: 'c-escopo-b'
  };

  try {
    for (const [id, papel, email] of [
      [ids.profA, 'professora', 'escopo-a@teste.pt'],
      [ids.profB, 'professora', 'escopo-b@teste.pt'],
      [ids.utilA, 'crianca', 'crianca-a@teste.pt'],
      [ids.utilB, 'crianca', 'crianca-b@teste.pt']
    ]) {
      db.prepare(`INSERT INTO utilizadores
        (id, email, nome, papel, password_hash, criado_em) VALUES (?, ?, ?, ?, ?, ?)`)
        .run(id, email, id, papel, 'hash-teste', agora);
    }
    db.prepare('INSERT INTO turmas (id, nome, professora_id, criado_em) VALUES (?, ?, ?, ?)')
      .run(ids.turmaA, 'A', ids.profA, agora);
    db.prepare('INSERT INTO turmas (id, nome, professora_id, criado_em) VALUES (?, ?, ?, ?)')
      .run(ids.turmaB, 'B', ids.profB, agora);
    for (const [id, util, turma] of [
      [ids.criancaA, ids.utilA, ids.turmaA],
      [ids.criancaB, ids.utilB, ids.turmaB]
    ]) {
      db.prepare(`INSERT INTO criancas
        (id, utilizador_id, turma_id, nome, idade, fase, cor, palavras_trabalhadas)
        VALUES (?, ?, ?, ?, 6, 1, 'coral', '[]')`).run(id, util, turma, id);
    }

    assertEquals(idsPermitidos({ professoraId: ids.profA }), [ids.criancaA]);
    assertEquals(idsPermitidos({ professoraId: ids.profB }), [ids.criancaB]);
    assertEquals(idsPermitidos({ criancaId: ids.criancaA }), [ids.criancaA]);
    assertEquals(idsPermitidos({}), []);

    assertThrows(() => exigirIds([ids.criancaB], new Set([ids.criancaA]), 'Crianças'));
    assertEquals(exigirIds([ids.criancaA], new Set([ids.criancaA]), 'Crianças'), undefined);
  } finally {
    db.prepare('DELETE FROM criancas WHERE id IN (?, ?)').run(ids.criancaA, ids.criancaB);
    db.prepare('DELETE FROM turmas WHERE id IN (?, ?)').run(ids.turmaA, ids.turmaB);
    db.prepare('DELETE FROM utilizadores WHERE id IN (?, ?, ?, ?)')
      .run(ids.profA, ids.profB, ids.utilA, ids.utilB);
  }
});
