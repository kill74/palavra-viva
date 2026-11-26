import { assertEquals, assertNotEquals } from 'jsr:@std/assert';
import {
  entrar,
  registarUtilizador,
  sair,
  validarRegisto,
  validarSessao
} from './autenticacao.ts';

Deno.test('validarRegisto: recusa passwords fracas e emails inválidos', () => {
  const erros = validarRegisto('mau', 'A', 'curta', 'professora');
  assertEquals(erros.length >= 3, true);
});

Deno.test('registarUtilizador: cria conta e recusa email repetido', async () => {
  const primeiro = await registarUtilizador({
    email: 'nova@palavraviva.pt',
    nome: 'Nova Professora',
    password: 'SenhaForte123',
    papel: 'professora'
  });
  assertEquals(primeiro.erros, []);
  assertNotEquals(primeiro.utilizador?.id, undefined);

  const repetido = await registarUtilizador({
    email: 'NOVA@palavraviva.pt',
    nome: 'Outra',
    password: 'SenhaForte123',
    papel: 'professora'
  });
  assertEquals(repetido.erros[0].includes('Já existe'), true);
});

Deno.test('entrar: credenciais corretas criam sessão válida', async () => {
  await registarUtilizador({
    email: 'entrar@palavraviva.pt',
    nome: 'Entrar Teste',
    password: 'SenhaForte123',
    papel: 'professora'
  });
  const resultado = await entrar('entrar@palavraviva.pt', 'SenhaForte123');
  assertEquals(resultado.erro, undefined);
  assertNotEquals(resultado.token, undefined);
  assertEquals(validarSessao(resultado.token)?.email, 'entrar@palavraviva.pt');

  sair(resultado.token);
  assertEquals(validarSessao(resultado.token), undefined);
});

Deno.test('entrar: recusa password errada e email inexistente com a mesma mensagem', async () => {
  const errada = await entrar('entrar@palavraviva.pt', 'Errada12345');
  const inexistente = await entrar('ninguem@palavraviva.pt', 'SenhaForte123');
  assertEquals(errada.erro, inexistente.erro);
});
