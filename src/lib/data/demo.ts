import type {
  Apoios,
  Crianca,
  EstadoRecurso,
  Fase,
  Recurso,
  RegistoEscrita,
  Sessao,
  TipoAtividade
} from './tipos';
import { MODELO_IA, construirPrompt } from './prompts';
import { obterPalavra } from './palavras';
import { feedbackCerto, feedbackErrado } from '#lib/utils/gerador';
import { comValidacao } from '#lib/utils/validacao';

export const TURMA: Crianca[] = [
  {
    id: 'alice',
    nome: 'Alice',
    idade: 6,
    fase: 3,
    palavrasTrabalhadas: ['menina', 'menino', 'uva', 'sapato', 'bota'],
    cor: 'coral',
    nota: 'Reconhece as cinco primeiras palavras e já junta sílabas.'
  },
  {
    id: 'benjamim',
    nome: 'Benjamim',
    idade: 7,
    fase: 2,
    palavrasTrabalhadas: ['menina', 'menino', 'uva'],
    cor: 'cobalto',
    nota: 'Está a reconhecer a palavra sem depender da imagem.'
  },
  {
    id: 'clara',
    nome: 'Clara',
    idade: 6,
    fase: 4,
    palavrasTrabalhadas: [
      'menina', 'menino', 'uva', 'sapato', 'bota', 'mama', 'leque', 'casa',
      'janela', 'telhado', 'escada', 'chave'
    ],
    cor: 'verde',
    nota: 'Constrói palavras novas com sílabas que já conhece.'
  },
  {
    id: 'duarte',
    nome: 'Duarte',
    idade: 6,
    fase: 1,
    palavrasTrabalhadas: ['menina', 'menino'],
    cor: 'sol',
    nota: 'Começou esta semana; apoia-se muito no som e na imagem.'
  }
];

const porCrianca = new Map(TURMA.map((c) => [c.id, c]));

type DadosDemo = {
  id: string;
  criancaId: string;
  palavraId: string;
  tipo: TipoAtividade;
  fase: Fase;
  opcoes: string[];
  apoios: Apoios;
  estado: EstadoRecurso;
  criadoEm: string;
  aprovadoEm?: string;
};

function recursoDemo(dados: DadosDemo): Recurso {
  const crianca = porCrianca.get(dados.criancaId) ?? TURMA[0];
  const palavra = obterPalavra(dados.palavraId);
  const prompt = construirPrompt({
    palavra: palavra.palavra,
    silabas: palavra.silabas,
    frase: palavra.frase,
    fase: dados.fase,
    tipo: dados.tipo,
    numeroOpcoes: dados.opcoes.length || 2,
    apoios: dados.apoios,
    crianca
  });

  const base: Recurso = {
    id: dados.id,
    criancaId: dados.criancaId,
    palavraId: palavra.id,
    palavra: palavra.palavra,
    silabas: [...palavra.silabas],
    frase: palavra.frase,
    tipo: dados.tipo,
    fase: dados.fase,
    opcoes: [...dados.opcoes],
    apoios: { ...dados.apoios },
    estado: dados.estado,
    origem: 'ia-previa',
    prompt,
    modelo: MODELO_IA,
    criadoEm: dados.criadoEm,
    aprovadoEm: dados.aprovadoEm,
    feedbackCerto: feedbackCerto(dados.tipo, palavra.palavra, palavra.silabas),
    feedbackErrado: feedbackErrado(dados.tipo, palavra.palavra, palavra.silabas),
    validacao: []
  };
  return comValidacao(base);
}

export const RECURSOS_DEMO: Recurso[] = [
  recursoDemo({
    id: 'rec-alice-menina',
    criancaId: 'alice',
    palavraId: 'menina',
    tipo: 'reconhecimento',
    fase: 2,
    opcoes: ['menina', 'menino', 'uva'],
    apoios: { imagem: true, audio: true, silabas: false },
    estado: 'aprovado',
    criadoEm: '2026-11-04T16:10:00.000Z',
    aprovadoEm: '2026-11-04T16:14:00.000Z'
  }),
  recursoDemo({
    id: 'rec-alice-sapato',
    criancaId: 'alice',
    palavraId: 'sapato',
    tipo: 'silabas',
    fase: 3,
    opcoes: ['me', 'ni'],
    apoios: { imagem: true, audio: true, silabas: true },
    estado: 'aprovado',
    criadoEm: '2026-11-05T17:20:00.000Z',
    aprovadoEm: '2026-11-05T17:24:00.000Z'
  }),
  recursoDemo({
    id: 'rec-alice-galinha',
    criancaId: 'alice',
    palavraId: 'galinha',
    tipo: 'associacao',
    fase: 3,
    opcoes: ['galinha', 'girafa', 'cenoura'],
    apoios: { imagem: false, audio: true, silabas: false },
    estado: 'rascunho',
    criadoEm: '2026-11-08T08:40:00.000Z'
  }),
  recursoDemo({
    id: 'rec-benjamim-uva',
    criancaId: 'benjamim',
    palavraId: 'uva',
    tipo: 'cartao',
    fase: 1,
    opcoes: [],
    apoios: { imagem: true, audio: true, silabas: true },
    estado: 'aprovado',
    criadoEm: '2026-11-03T15:00:00.000Z',
    aprovadoEm: '2026-11-03T15:05:00.000Z'
  }),
  recursoDemo({
    id: 'rec-benjamim-menino',
    criancaId: 'benjamim',
    palavraId: 'menino',
    tipo: 'reconhecimento',
    fase: 1,
    opcoes: ['menino', 'menina'],
    apoios: { imagem: true, audio: true, silabas: false },
    estado: 'aprovado',
    criadoEm: '2026-11-05T09:10:00.000Z',
    aprovadoEm: '2026-11-05T09:12:00.000Z'
  }),
  recursoDemo({
    id: 'rec-clara-casa',
    criancaId: 'clara',
    palavraId: 'casa',
    tipo: 'frase',
    fase: 5,
    opcoes: ['casa', 'janela', 'mesa', 'escada'],
    apoios: { imagem: false, audio: true, silabas: false },
    estado: 'aprovado',
    criadoEm: '2026-11-06T10:00:00.000Z',
    aprovadoEm: '2026-11-06T10:04:00.000Z'
  }),
  recursoDemo({
    id: 'rec-clara-chave',
    criancaId: 'clara',
    palavraId: 'chave',
    tipo: 'silabas',
    fase: 4,
    opcoes: ['ca', 'sa', 'me'],
    apoios: { imagem: false, audio: true, silabas: false },
    estado: 'aprovado',
    criadoEm: '2026-11-06T10:08:00.000Z',
    aprovadoEm: '2026-11-06T10:10:00.000Z'
  }),
  recursoDemo({
    id: 'rec-duarte-menina',
    criancaId: 'duarte',
    palavraId: 'menina',
    tipo: 'cartao',
    fase: 1,
    opcoes: [],
    apoios: { imagem: true, audio: true, silabas: true },
    estado: 'aprovado',
    criadoEm: '2026-11-07T14:00:00.000Z',
    aprovadoEm: '2026-11-07T14:03:00.000Z'
  }),
  recursoDemo({
    id: 'rec-duarte-menino',
    criancaId: 'duarte',
    palavraId: 'menino',
    tipo: 'reconhecimento',
    fase: 1,
    opcoes: ['menino', 'mamã'],
    apoios: { imagem: true, audio: true, silabas: false },
    estado: 'aprovado',
    criadoEm: '2026-11-07T14:05:00.000Z',
    aprovadoEm: '2026-11-07T14:07:00.000Z'
  })
];

export const SESSOES_DEMO: Sessao[] = [
  {
    id: 'ses-alice-1',
    criancaId: 'alice',
    inicio: '2026-11-06T14:00:00.000Z',
    fim: '2026-11-06T14:04:00.000Z',
    respostas: [
      {
        recursoId: 'rec-alice-menina',
        palavra: 'menina',
        tipo: 'reconhecimento',
        tentativas: 1,
        ajudas: 0,
        acertouPrimeira: true,
        tempoMs: 8200,
        usouAudio: false,
        usouDica: false,
        revelou: false
      },
      {
        recursoId: 'rec-alice-sapato',
        palavra: 'sapato',
        tipo: 'silabas',
        tentativas: 2,
        ajudas: 1,
        acertouPrimeira: false,
        tempoMs: 24600,
        usouAudio: true,
        usouDica: false,
        revelou: false
      }
    ]
  },
  {
    id: 'ses-clara-1',
    criancaId: 'clara',
    inicio: '2026-11-07T09:30:00.000Z',
    fim: '2026-11-07T09:36:00.000Z',
    respostas: [
      {
        recursoId: 'rec-clara-casa',
        palavra: 'casa',
        tipo: 'frase',
        tentativas: 1,
        ajudas: 0,
        acertouPrimeira: true,
        tempoMs: 11300,
        usouAudio: false,
        usouDica: false,
        revelou: false
      },
      {
        recursoId: 'rec-clara-chave',
        palavra: 'chave',
        tipo: 'silabas',
        tentativas: 1,
        ajudas: 2,
        acertouPrimeira: false,
        tempoMs: 18700,
        usouAudio: true,
        usouDica: true,
        revelou: false
      }
    ]
  },
  {
    id: 'ses-benjamim-1',
    criancaId: 'benjamim',
    inicio: '2026-11-07T10:15:00.000Z',
    fim: '2026-11-07T10:19:00.000Z',
    respostas: [
      {
        recursoId: 'rec-benjamim-menino',
        palavra: 'menino',
        tipo: 'reconhecimento',
        tentativas: 2,
        ajudas: 1,
        acertouPrimeira: false,
        tempoMs: 19000,
        usouAudio: true,
        usouDica: false,
        revelou: false
      }
    ]
  },
  {
    id: 'ses-duarte-1',
    criancaId: 'duarte',
    inicio: '2026-11-08T08:45:00.000Z',
    fim: '2026-11-08T08:49:00.000Z',
    respostas: [
      {
        recursoId: 'rec-duarte-menino',
        palavra: 'menino',
        tipo: 'reconhecimento',
        tentativas: 1,
        ajudas: 0,
        acertouPrimeira: true,
        tempoMs: 15800,
        usouAudio: false,
        usouDica: false,
        revelou: false
      }
    ]
  }
];

export const RECURSOS_POR_CRIANCA = (criancaId: string) =>
  RECURSOS_DEMO.filter((r) => r.criancaId === criancaId);

export const ESCRITAS_DEMO: RegistoEscrita[] = [
  {
    id: 'esc-alice-sapato',
    criancaId: 'alice',
    palavraId: 'sapato',
    data: '2026-11-06T14:16:00.000Z',
    nota: 'Copiou com modelo. Precisa de mais espaço entre as letras.'
  },
  {
    id: 'esc-clara-casa',
    criancaId: 'clara',
    palavraId: 'casa',
    data: '2026-11-07T09:42:00.000Z',
    nota: 'Copiou sem modelo depois de duas leituras.'
  }
];
