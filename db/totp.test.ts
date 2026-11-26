import { assertEquals } from 'jsr:@std/assert';
import { gerarSecret, uriTotp, verificarTotp } from './totp.ts';

Deno.test('TOTP: secret tem 32 caracteres base32', () => {
  const secret = gerarSecret();
  assertEquals(secret.length, 32);
  assertEquals(/^[A-Z2-7]+$/.test(secret), true);
});

Deno.test('TOTP: uri contém emissor e conta', () => {
  const uri = uriTotp('JBSWY3DPEHPK3PXPJBSWY3DPEHPK3PXP', 'prof@teste.pt');
  assertEquals(uri.startsWith('otpauth://totp/'), true);
  assertEquals(uri.includes('Palavra%20Viva'), true);
});

Deno.test('TOTP: recusa códigos malformados', async () => {
  const secret = gerarSecret();
  assertEquals(await verificarTotp(secret, 'abc'), false);
  assertEquals(await verificarTotp(secret, '12345'), false);
  assertEquals(await verificarTotp(secret, '1234567'), false);
});
