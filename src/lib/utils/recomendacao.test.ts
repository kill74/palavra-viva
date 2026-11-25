import { assertEquals } from 'jsr:@std/assert';
import type { Crianca, Recurso, Sessao } from '../data/tipos.ts';
import { conquistas, proximoRecurso, resumoCrianca } from './recomendacao.ts';

function crianca(fase: 1 | 2 | 3 | 4 | 5 | 6 = 3): Crianca {
  return {
    id: 'alice',
    nome: 'Alice',
    idade: 6,
    fase,
    palavrasTrabalhadas: [],
    cor: 'coral',
    nota: ''
  };
}

function recurso(id: string, fase: 1 | 2 | 3 | 4 | 5 | 6 = 3): Recurso {
  return {
    id,
    criancaId: 'alice',
    palavraId: id,
    palavra: id,
    silabas: [],
    frase: '',
    tipo: 'cartao',
    fase,
    opcoes: [],
    apoios: { imagem: true, audio: true, silabas: false },
    estado: 'aprovado',
    origem: 'manual',
    prompt: '',
    modelo: '',
    criadoEm: '2026-01-01T10:00:00.000Z',
    feedbackCerto: '',
    feedbackErrado: '',
    validacao: []
  };
}

function sessao(respostas: Sessao['respostas']): Sessao {
  return {
    id: 's1',
    criancaId: 'alice',
    inicio: '2026-01-01T10:00:00.000Z',
    fim: '2026-01-01T10:05:00.000Z',
    respostas
  };
}

Deno.test('proximoRecurso: escolhe a fase da criança', () => {
  const resultado = proximoRecurso(
    crianca(3),
    [recurso('posterior', 5), recurso('certo', 3), recurso('anterior', 1)],
    []
  );
  assertEquals(resultado?.id, 'certo');
});

Deno.test('proximoRecurso: ignora rascunhos e recursos de outras crianças', () => {
  const rascunho = { ...recurso('rascunho'), estado: 'rascunho' as const };
  const alheio = { ...recurso('alheio'), criancaId: 'benjamim' };
  assertEquals(proximoRecurso(crianca(), [rascunho, alheio], []), undefined);
});

Deno.test('proximoRecurso: evita palavras já dominadas', () => {
  const sessoes = [
    sessao([
      {
        recursoId: 'dominada',
        palavra: 'dominada',
        tipo: 'cartao',
        tentativas: 1,
        ajudas: 0,
        acertouPrimeira: true,
        tempoMs: 1000,
        usouAudio: false,
        usouDica: false,
        revelou: false
      }
    ])
  ];
  const resultado = proximoRecurso(crianca(), [recurso('dominada'), recurso('nova')], sessoes);
  assertEquals(resultado?.id, 'nova');
});

Deno.test('resumoCrianca: conta respostas, autonomia e ajudas', () => {
  const respostas = [
    {
      recursoId: 'a',
      palavra: 'a',
      tipo: 'cartao' as const,
      tentativas: 1,
      ajudas: 0,
      acertouPrimeira: true,
      tempoMs: 900,
      usouAudio: false,
      usouDica: false,
      revelou: false
    },
    {
      recursoId: 'b',
      palavra: 'b',
      tipo: 'silabas' as const,
      tentativas: 2,
      ajudas: 1,
      acertouPrimeira: false,
      tempoMs: 1500,
      usouAudio: true,
      usouDica: true,
      revelou: false
    }
  ];
  const resumo = resumoCrianca([sessao(respostas)], 'alice');
  assertEquals(resumo.respostas, 2);
  assertEquals(resumo.autonomas, 1);
  assertEquals(resumo.ajudas, 1);
  assertEquals(resumo.tiposDistintos, 2);
});

Deno.test('conquistas: desbloqueia apenas com dados reais', () => {
  const bloqueadas = conquistas([], 'alice');
  assertEquals(bloqueadas.every((c) => !c.desbloqueada), true);

  const respostas = Array.from({ length: 5 }, (_, i) => ({
    recursoId: `r${i}`,
    palavra: `r${i}`,
    tipo: 'cartao' as const,
    tentativas: 1,
    ajudas: 0,
    acertouPrimeira: true,
    tempoMs: 800,
    usouAudio: false,
    usouDica: false,
    revelou: false
  }));
  const desbloqueadas = conquistas([sessao(respostas)], 'alice');
  assertEquals(desbloqueadas.find((c) => c.id === 'leo-sozinha')?.desbloqueada, true);
  assertEquals(desbloqueadas.find((c) => c.id === 'exploradora')?.desbloqueada, false);
});
