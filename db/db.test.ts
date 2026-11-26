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

Deno.test('hashPassword: produz hash Argon2id com parâmetros OWASP', async () => {
  const hash = await hashPassword('SenhaForte123');
  const partes = hash.split('$');
  assertEquals(partes[0], 'argon2id');
  assertEquals(Number(partes[1]), 3);
  assertEquals(Number(partes[2]), 65536);
  assertEquals(Number(partes[3]), 4);
  assertEquals(await verificarPassword('SenhaForte123', hash), true);
  assertEquals(await verificarPassword('Errada12345', hash), false);
});

Deno.test('verificarPassword: aceita hash PBKDF2 legado', async () => {
  // Hash gerado pelo formato antigo: pbkdf2$salt$hash
  const sal = new Uint8Array(16).fill(7);
  const material = await crypto.subtle.importKey('raw', new TextEncoder().encode('Legado12345'), 'PBKDF2', false, ['deriveBits']);
  const bits = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', salt: sal, iterations: 210000, hash: 'SHA-256' }, material, 256
  );
  const b64 = (b: Uint8Array) => btoa(String.fromCharCode(...b));
  const legado = `pbkdf2$${b64(sal)}$${b64(new Uint8Array(bits))}`;
  assertEquals(await verificarPassword('Legado12345', legado), true);
  assertEquals(await verificarPassword('Errada12345', legado), false);
});
