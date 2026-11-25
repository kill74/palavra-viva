import { assertEquals, assertNotEquals } from 'jsr:@std/assert';
import { hashPassword, verificarPassword } from './seguranca.ts';
import { base } from './cliente.ts';

Deno.test('hashPassword: aceita a password correta e recusa outra', async () => {
  const hash = await hashPassword('professora2026');
  assertNotEquals(hash, 'professora2026');
  assertEquals(await verificarPassword('professora2026', hash), true);
  assertEquals(await verificarPassword('errada', hash), false);
});

Deno.test('hashPassword: dois hashes da mesma password são distintos', async () => {
  const a = await hashPassword('mesma');
  const b = await hashPassword('mesma');
  assertNotEquals(a, b);
});

Deno.test('verificarPassword: recusa formatos inválidos', async () => {
  assertEquals(await verificarPassword('x', 'invalido'), false);
});

Deno.test('base de dados: tabelas criadas e foreign keys íntegras', () => {
  const db = base();
  const tabelas = db.prepare(
    "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' ORDER BY name"
  ).all().map((linha) => (linha as { name: string }).name);
  for (const nome of [
    'utilizadores', 'turmas', 'criancas', 'recursos', 'sessoes', 'escritas', 'sessoes_login'
  ]) {
    assertEquals(tabelas.includes(nome), true, `Falta a tabela ${nome}`);
  }
  assertEquals(db.prepare('PRAGMA foreign_key_check').all().length, 0);
});
