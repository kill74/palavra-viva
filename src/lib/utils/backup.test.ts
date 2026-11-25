import { assertEquals } from 'jsr:@std/assert';
import { criarCopia, validarCopia } from './backup.ts';

const estado = {
  criancas: [
    {
      id: 'alice',
      nome: 'Alice',
      idade: 6,
      fase: 3 as const,
      palavrasTrabalhadas: ['uva'],
      cor: 'coral' as const,
      nota: ''
    }
  ],
  recursos: [],
  sessoes: [],
  escritas: []
};

Deno.test('validarCopia: aceita uma cópia íntegra', () => {
  const texto = criarCopia(estado);
  const resultado = validarCopia(texto);
  assertEquals(resultado.erros, []);
  assertEquals(resultado.dados?.criancas[0].nome, 'Alice');
});

Deno.test('validarCopia: rejeita JSON inválido', () => {
  assertEquals(validarCopia('{').erros.length > 0, true);
});

Deno.test('validarCopia: aceita ficheiro com BOM inicial', () => {
  const resultado = validarCopia(`\uFEFF${criarCopia(estado)}`);
  assertEquals(resultado.erros, []);
});

Deno.test('validarCopia: rejeita versão desconhecida', () => {
  const texto = JSON.stringify({ ...estado, versao: 2 });
  assertEquals(validarCopia(texto).erros[0].includes('Versão'), true);
});

Deno.test('validarCopia: rejeita referência a criança inexistente', () => {
  const recurso = {
    id: 'r1',
    criancaId: 'inexistente',
    palavraId: 'uva',
    palavra: 'uva',
    silabas: [],
    frase: '',
    tipo: 'cartao',
    fase: 1,
    opcoes: [],
    apoios: { imagem: true, audio: true, silabas: false },
    estado: 'aprovado',
    origem: 'manual',
    prompt: '',
    modelo: '',
    criadoEm: '2026-01-01',
    feedbackCerto: '',
    feedbackErrado: '',
    validacao: []
  };
  const texto = JSON.stringify({ versao: 1, ...estado, recursos: [recurso] });
  assertEquals(validarCopia(texto).erros.some((e) => e.includes('criança inexistente')), true);
});

Deno.test('validarCopia: rejeita ids repetidos', () => {
  const copia = JSON.parse(JSON.stringify(estado));
  copia.criancas.push({ ...copia.criancas[0] });
  const resultado = validarCopia(JSON.stringify({ versao: 1, ...copia }));
  assertEquals(resultado.erros.some((e) => e.includes('repetido')), true);
});
