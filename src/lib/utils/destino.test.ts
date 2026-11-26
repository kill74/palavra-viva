import { assertEquals } from 'jsr:@std/assert';
import { destinoSeguro } from './destino.ts';

Deno.test('destinoSeguro: aceita rotas da whitelist', () => {
  assertEquals(destinoSeguro('/professor/', 'professora'), '/professor/');
  assertEquals(destinoSeguro('/crianca/sessao/', 'crianca'), '/crianca/sessao/');
});

Deno.test('destinoSeguro: rejeita open redirects', () => {
  assertEquals(destinoSeguro('//evil.com', 'professora'), undefined);
  assertEquals(destinoSeguro('/\\evil.com', 'professora'), undefined);
  assertEquals(destinoSeguro('/professor@evil.com', 'professora'), undefined);
  assertEquals(destinoSeguro('https://evil.com', 'professora'), undefined);
  assertEquals(destinoSeguro('/professor//evil', 'professora'), undefined);
});

Deno.test('destinoSeguro: rejeita rotas de outro papel', () => {
  assertEquals(destinoSeguro('/professor/', 'crianca'), undefined);
  assertEquals(destinoSeguro('/crianca/', 'professora'), undefined);
});
