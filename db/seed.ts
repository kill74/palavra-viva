/**
 * Semeadura da base de dados com a turma de demonstração.
 *
 * Uso: deno task db:seed
 * Seguro de executar várias vezes: usa INSERT OR IGNORE.
 */
import { base, transacao } from './cliente.ts';
import { hashPassword } from './seguranca.ts';

const PROFESSORA = {
  id: 'prof-demo',
  email: 'professora@palavraviva.pt',
  nome: 'Ana Ribeiro',
  password: 'professora2026'
};

const TURMA = { id: 'turma-1a', nome: '1.º A' };

const CRIANCAS = [
  {
    id: 'alice',
    nome: 'Alice',
    idade: 6,
    fase: 3,
    cor: 'coral',
    nota: 'Reconhece as cinco primeiras palavras e já junta sílabas.',
    palavras: ['menina', 'menino', 'uva', 'sapato', 'bota'],
    email: 'alice@palavraviva.pt',
    password: 'alice2026'
  },
  {
    id: 'benjamim',
    nome: 'Benjamim',
    idade: 7,
    fase: 2,
    cor: 'cobalto',
    nota: 'Está a reconhecer a palavra sem depender da imagem.',
    palavras: ['menina', 'menino', 'uva'],
    email: 'benjamim@palavraviva.pt',
    password: 'benjamim2026'
  },
  {
    id: 'clara',
    nome: 'Clara',
    idade: 6,
    fase: 4,
    cor: 'verde',
    nota: 'Constrói palavras novas com sílabas que já conhece.',
    palavras: [
      'menina', 'menino', 'uva', 'sapato', 'bota', 'mama', 'leque', 'casa',
      'janela', 'telhado', 'escada', 'chave'
    ],
    email: 'clara@palavraviva.pt',
    password: 'clara2026'
  },
  {
    id: 'duarte',
    nome: 'Duarte',
    idade: 6,
    fase: 1,
    cor: 'sol',
    nota: 'Começou esta semana; apoia-se muito no som e na imagem.',
    palavras: ['menina', 'menino'],
    email: 'duarte@palavraviva.pt',
    password: 'duarte2026'
  }
] as const;

/** Metadados mínimos das palavras usadas pelos recursos demo. */
const PALAVRAS: Record<string, { silabas: string[]; frase: string }> = {
  menina: { silabas: ['me', 'ni', 'na'], frase: 'A menina sorri.' },
  menino: { silabas: ['me', 'ni', 'no'], frase: 'O menino corre.' },
  uva: { silabas: ['u', 'va'], frase: 'A uva é doce.' },
  sapato: { silabas: ['sa', 'pa', 'to'], frase: 'O sapato é azul.' },
  gato: { silabas: ['ga', 'to'], frase: 'O gato dorme.' },
  galinha: { silabas: ['ga', 'li', 'nha'], frase: 'A galinha canta.' },
  chave: { silabas: ['cha', 've'], frase: 'A chave abre a porta.' },
  casa: { silabas: ['ca', 'sa'], frase: 'A casa é grande.' }
};

type RecursoSeed = {
  id: string;
  criancaId: string;
  palavraId: string;
  tipo: string;
  fase: number;
  opcoes: string[];
  apoios: { imagem: boolean; audio: boolean; silabas: boolean };
  estado: string;
  criadoEm: string;
  aprovadoEm?: string;
  respostaCorreta?: string;
};

const RECURSOS: RecursoSeed[] = [
  { id: 'rec-alice-menina', criancaId: 'alice', palavraId: 'menina', tipo: 'reconhecimento', fase: 2, opcoes: ['menina', 'menino', 'uva'], apoios: { imagem: true, audio: true, silabas: false }, estado: 'aprovado', criadoEm: '2026-11-04T16:10:00.000Z', aprovadoEm: '2026-11-04T16:14:00.000Z' },
  { id: 'rec-alice-sapato', criancaId: 'alice', palavraId: 'sapato', tipo: 'silabas', fase: 3, opcoes: ['me', 'ni'], apoios: { imagem: true, audio: true, silabas: true }, estado: 'aprovado', criadoEm: '2026-11-05T17:20:00.000Z', aprovadoEm: '2026-11-05T17:24:00.000Z' },
  { id: 'rec-alice-ditado', criancaId: 'alice', palavraId: 'sapato', tipo: 'ditado', fase: 3, opcoes: ['sapato', 'pato', 'rato', 'gato'], respostaCorreta: 'sapato', apoios: { imagem: false, audio: true, silabas: false }, estado: 'aprovado', criadoEm: '2026-11-09T10:00:00.000Z', aprovadoEm: '2026-11-09T10:03:00.000Z' },
  { id: 'rec-alice-rima', criancaId: 'alice', palavraId: 'gato', tipo: 'rima', fase: 4, opcoes: ['rato', 'pato', 'bola'], respostaCorreta: 'rato', apoios: { imagem: false, audio: true, silabas: false }, estado: 'aprovado', criadoEm: '2026-11-09T10:05:00.000Z', aprovadoEm: '2026-11-09T10:08:00.000Z' },
  { id: 'rec-alice-ordem', criancaId: 'alice', palavraId: 'sapato', tipo: 'ordem', fase: 3, opcoes: ['me', 'ni'], respostaCorreta: 'sapato', apoios: { imagem: false, audio: true, silabas: false }, estado: 'aprovado', criadoEm: '2026-11-09T10:10:00.000Z', aprovadoEm: '2026-11-09T10:12:00.000Z' },
  { id: 'rec-alice-galinha', criancaId: 'alice', palavraId: 'galinha', tipo: 'associacao', fase: 3, opcoes: ['galinha', 'girafa', 'cenoura'], apoios: { imagem: false, audio: true, silabas: false }, estado: 'rascunho', criadoEm: '2026-11-08T08:40:00.000Z' },
  { id: 'rec-benjamim-uva', criancaId: 'benjamim', palavraId: 'uva', tipo: 'cartao', fase: 1, opcoes: [], apoios: { imagem: true, audio: true, silabas: true }, estado: 'aprovado', criadoEm: '2026-11-03T15:00:00.000Z', aprovadoEm: '2026-11-03T15:05:00.000Z' },
  { id: 'rec-benjamim-menino', criancaId: 'benjamim', palavraId: 'menino', tipo: 'reconhecimento', fase: 1, opcoes: ['menino', 'menina'], apoios: { imagem: true, audio: true, silabas: false }, estado: 'aprovado', criadoEm: '2026-11-05T09:10:00.000Z', aprovadoEm: '2026-11-05T09:12:00.000Z' },
  { id: 'rec-clara-casa', criancaId: 'clara', palavraId: 'casa', tipo: 'frase', fase: 5, opcoes: ['casa', 'janela', 'mesa', 'escada'], apoios: { imagem: false, audio: true, silabas: false }, estado: 'aprovado', criadoEm: '2026-11-06T10:00:00.000Z', aprovadoEm: '2026-11-06T10:04:00.000Z' },
  { id: 'rec-clara-chave', criancaId: 'clara', palavraId: 'chave', tipo: 'silabas', fase: 4, opcoes: ['ca', 'sa', 'me'], apoios: { imagem: false, audio: true, silabas: false }, estado: 'aprovado', criadoEm: '2026-11-06T10:08:00.000Z', aprovadoEm: '2026-11-06T10:10:00.000Z' },
  { id: 'rec-duarte-menina', criancaId: 'duarte', palavraId: 'menina', tipo: 'cartao', fase: 1, opcoes: [], apoios: { imagem: true, audio: true, silabas: true }, estado: 'aprovado', criadoEm: '2026-11-07T14:00:00.000Z', aprovadoEm: '2026-11-07T14:03:00.000Z' },
  { id: 'rec-duarte-menino', criancaId: 'duarte', palavraId: 'menino', tipo: 'reconhecimento', fase: 1, opcoes: ['menino', 'mamã'], apoios: { imagem: true, audio: true, silabas: false }, estado: 'aprovado', criadoEm: '2026-11-07T14:05:00.000Z', aprovadoEm: '2026-11-07T14:07:00.000Z' }
];

const SESSOES = [
  { id: 'ses-alice-1', criancaId: 'alice', inicio: '2026-11-06T14:00:00.000Z', fim: '2026-11-06T14:04:00.000Z', respostas: [
    { recursoId: 'rec-alice-menina', palavra: 'menina', tipo: 'reconhecimento', tentativas: 1, ajudas: 0, acertouPrimeira: true, tempoMs: 8200, usouAudio: false, usouDica: false, revelou: false },
    { recursoId: 'rec-alice-sapato', palavra: 'sapato', tipo: 'silabas', tentativas: 2, ajudas: 1, acertouPrimeira: false, tempoMs: 24600, usouAudio: true, usouDica: false, revelou: false }
  ] },
  { id: 'ses-alice-2', criancaId: 'alice', inicio: '2026-11-09T10:30:00.000Z', fim: '2026-11-09T10:36:00.000Z', respostas: [
    { recursoId: 'rec-alice-ditado', palavra: 'sapato', tipo: 'ditado', tentativas: 1, ajudas: 0, acertouPrimeira: true, tempoMs: 12400, usouAudio: true, usouDica: false, revelou: false },
    { recursoId: 'rec-alice-rima', palavra: 'gato', tipo: 'rima', tentativas: 2, ajudas: 1, acertouPrimeira: false, tempoMs: 19800, usouAudio: true, usouDica: true, revelou: false },
    { recursoId: 'rec-alice-ordem', palavra: 'sapato', tipo: 'ordem', tentativas: 1, ajudas: 0, acertouPrimeira: true, tempoMs: 14300, usouAudio: true, usouDica: false, revelou: false }
  ] },
  { id: 'ses-clara-1', criancaId: 'clara', inicio: '2026-11-07T09:30:00.000Z', fim: '2026-11-07T09:36:00.000Z', respostas: [
    { recursoId: 'rec-clara-casa', palavra: 'casa', tipo: 'frase', tentativas: 1, ajudas: 0, acertouPrimeira: true, tempoMs: 11300, usouAudio: false, usouDica: false, revelou: false },
    { recursoId: 'rec-clara-chave', palavra: 'chave', tipo: 'silabas', tentativas: 1, ajudas: 2, acertouPrimeira: false, tempoMs: 18700, usouAudio: true, usouDica: true, revelou: false }
  ] },
  { id: 'ses-benjamim-1', criancaId: 'benjamim', inicio: '2026-11-07T10:15:00.000Z', fim: '2026-11-07T10:19:00.000Z', respostas: [
    { recursoId: 'rec-benjamim-menino', palavra: 'menino', tipo: 'reconhecimento', tentativas: 2, ajudas: 1, acertouPrimeira: false, tempoMs: 19000, usouAudio: true, usouDica: false, revelou: false }
  ] },
  { id: 'ses-duarte-1', criancaId: 'duarte', inicio: '2026-11-08T08:45:00.000Z', fim: '2026-11-08T08:49:00.000Z', respostas: [
    { recursoId: 'rec-duarte-menino', palavra: 'menino', tipo: 'reconhecimento', tentativas: 1, ajudas: 0, acertouPrimeira: true, tempoMs: 15800, usouAudio: false, usouDica: false, revelou: false }
  ] }
];

const ESCRITAS = [
  { id: 'esc-alice-sapato', criancaId: 'alice', palavraId: 'sapato', data: '2026-11-06T14:16:00.000Z', nota: 'Copiou com modelo. Precisa de mais espaço entre as letras.' },
  { id: 'esc-clara-casa', criancaId: 'clara', palavraId: 'casa', data: '2026-11-07T09:42:00.000Z', nota: 'Copiou sem modelo depois de duas leituras.' }
];

const agora = new Date().toISOString();

function validacaoFalsa(): string {
  return JSON.stringify([
    { id: 'ortografia', ok: true, detalhe: 'Palavra verificada.' },
    { id: 'silabica', ok: true, detalhe: 'Sílabas verificadas.' },
    { id: 'imagem', ok: true, detalhe: 'Imagem disponível.' },
    { id: 'pronuncia', ok: true, detalhe: 'Áudio disponível.' },
    { id: 'opcoes', ok: true, detalhe: 'Opções distintas.' },
    { id: 'frase', ok: true, detalhe: 'Frase verificada.' }
  ]);
}

transacao(async () => {
  const db = base();
  const hashProf = await hashPassword(PROFESSORA.password);

  db.prepare(`INSERT OR IGNORE INTO utilizadores
    (id, email, nome, papel, password_hash, criado_em)
    VALUES (?, ?, ?, 'professora', ?, ?)`).run(PROFESSORA.id, PROFESSORA.email, PROFESSORA.nome, hashProf, agora);
  db.prepare(`INSERT OR IGNORE INTO turmas (id, nome, professora_id, criado_em) VALUES (?, ?, ?, ?)`)
    .run(TURMA.id, TURMA.nome, PROFESSORA.id, agora);

  for (const c of CRIANCAS) {
    const hash = await hashPassword(c.password);
    db.prepare(`INSERT OR IGNORE INTO utilizadores
      (id, email, nome, papel, password_hash, criado_em) VALUES (?, ?, ?, 'crianca', ?, ?)`)
      .run(`util-${c.id}`, c.email, c.nome, hash, agora);
    db.prepare(`INSERT OR IGNORE INTO criancas
      (id, utilizador_id, turma_id, nome, idade, fase, cor, nota, palavras_trabalhadas)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`)
      .run(c.id, `util-${c.id}`, TURMA.id, c.nome, c.idade, c.fase, c.cor, c.nota, JSON.stringify(c.palavras));
  }

  for (const r of RECURSOS) {
    const meta = PALAVRAS[r.palavraId];
    if (!meta) throw new Error(`Palavra sem metadados no seed: ${r.palavraId}`);
    db.prepare(`INSERT OR IGNORE INTO recursos
      (id, crianca_id, palavra_id, palavra, silabas, frase, tipo, fase, opcoes,
       resposta_correta, apoios, estado, origem, prompt, modelo, criado_em,
       aprovado_em, feedback_certo, feedback_errado, validacao)
      VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`)
      .run(
        r.id, r.criancaId, r.palavraId, r.palavraId, JSON.stringify(meta.silabas), meta.frase,
        r.tipo, r.fase, JSON.stringify(r.opcoes), r.respostaCorreta ?? null,
        JSON.stringify(r.apoios), r.estado, 'ia-previa', '', '', r.criadoEm,
        r.aprovadoEm ?? null, 'Muito bem!', 'Quase! Tenta outra vez.', validacaoFalsa()
      );
  }

  for (const s of SESSOES) {
    db.prepare(`INSERT OR IGNORE INTO sessoes (id, crianca_id, inicio, fim, respostas) VALUES (?,?,?,?,?)`)
      .run(s.id, s.criancaId, s.inicio, s.fim, JSON.stringify(s.respostas));
  }

  for (const e of ESCRITAS) {
    db.prepare(`INSERT OR IGNORE INTO escritas (id, crianca_id, palavra_id, data, nota) VALUES (?,?,?,?,?)`)
      .run(e.id, e.criancaId, e.palavraId, e.data, e.nota);
  }
});

console.log('Dados de demonstração inseridos.');
console.log(`Professora: ${PROFESSORA.email} / ${PROFESSORA.password}`);
console.log(`Alunos: ${CRIANCAS.map((c) => `${c.email} / ${c.password}`).join(', ')}`);
