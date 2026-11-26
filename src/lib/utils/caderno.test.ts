import { assertEquals } from 'jsr:@std/assert';
import type { Crianca, Sessao } from '#lib/data/tipos';
import { palavrasLidas } from './caderno.ts';

const crianca: Crianca = {
  id: 'alice', nome: 'Alice', idade: 6, fase: 3,
  palavrasTrabalhadas: [], cor: 'coral', nota: ''
};

function sessao(fim: string, palavras: Array<[string, boolean]>): Sessao {
  return {
    id: `s-${fim}`,
    criancaId: 'alice',
    inicio: fim,
    fim,
    respostas: palavras.map(([palavra, acertouPrimeira]) => ({
      recursoId: `r-${palavra}`, palavra, tipo: 'cartao', tentativas: 1, ajudas: 0,
      acertouPrimeira, tempoMs: 1000, usouAudio: false, usouDica: false, revelou: false
    }))
  };
}

Deno.test('palavrasLidas: apenas acertos à primeira e sem repetições', () => {
  const sessoes = [
    sessao('2026-01-02', [['uva', true], ['gato', false]]),
    sessao('2026-01-01', [['menina', true], ['uva', true]])
  ];
  assertEquals(palavrasLidas(sessoes, crianca), ['menina', 'uva']);
});

Deno.test('palavrasLidas: ignora sessões de outra criança', () => {
  const alheia = sessao('2026-01-03', [['casa', true]]);
  assertEquals(palavrasLidas([{ ...alheia, criancaId: 'benjamim' }], crianca), []);
});
