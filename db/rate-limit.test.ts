/** Testes do limitador: bloqueio após cinco falhas e expiração da janela. */
import { assertEquals } from 'jsr:@std/assert';
import { limparSucesso, registarFalha, verificador } from './rate-limit.ts';

Deno.test('rate limit: bloqueia após cinco falhas e expira a janela', () => {
  let agora = 1_000_000;
  const chave = 'teste@palavraviva.pt';
  for (let i = 0; i < 5; i++) {
    assertEquals(verificador(chave, agora).permitido, true);
    registarFalha(chave, agora);
  }
  assertEquals(verificador(chave, agora).permitido, false);
  agora += 15 * 60 * 1000 + 1;
  assertEquals(verificador(chave, agora).permitido, true);
});

Deno.test('rate limit: sucesso limpa o histórico', () => {
  const chave = 'outro@palavraviva.pt';
  registarFalha(chave);
  registarFalha(chave);
  limparSucesso(chave);
  assertEquals(verificador(chave).restantes, 5);
});
