import { PALAVRAS, obterPalavra } from '#lib/data/palavras';
import { MODELO_IA, construirPrompt } from '#lib/data/prompts';
import type { Apoios, Crianca, Fase, Recurso, TipoAtividade } from '#lib/data/tipos';
import { comValidacao } from './validacao';

export type PedidoCriacao = {
  crianca: Crianca;
  palavraId: string;
  fase: Fase;
  tipo: TipoAtividade;
  numeroOpcoes: number;
  apoios: Apoios;
};

function hash(texto: string): number {
  let h = 2166136261;
  for (let i = 0; i < texto.length; i += 1) {
    h ^= texto.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function aleatorio(seed: number): () => number {
  let a = seed;
  return () => {
    a += 0x6d2b79f5;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function baralhar<T>(itens: T[], seed: string): T[] {
  const rnd = aleatorio(hash(seed));
  const copia = [...itens];
  for (let i = copia.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rnd() * (i + 1));
    [copia[i], copia[j]] = [copia[j], copia[i]];
  }
  return copia;
}

function proximidade(a: (typeof PALAVRAS)[number], b: (typeof PALAVRAS)[number]): number {
  let pontos = 0;
  if (a.silabas[0] === b.silabas[0]) pontos += 5;
  if (a.silabas[a.silabas.length - 1] === b.silabas[b.silabas.length - 1]) pontos += 3;
  if (a.palavra.length === b.palavra.length) pontos += 2;
  if (Math.abs(a.palavra.length - b.palavra.length) <= 1) pontos += 1;
  if (a.palavra[0] === b.palavra[0]) pontos += 2;
  return pontos;
}

function distratoresDePalavra(palavraId: string, quantidade: number, seed: string) {
  const alvo = obterPalavra(palavraId);
  const candidatos = PALAVRAS.filter((p) => p.id !== alvo.id)
    .map((p) => ({ p, pontos: proximidade(alvo, p) }))
    .sort((a, b) => b.pontos - a.pontos || hash(`${seed}-${a.p.id}`) - hash(`${seed}-${b.p.id}`))
    .slice(0, Math.max(quantidade + 2, 4))
    .map((item) => item.p);

  return baralhar(candidatos, seed).slice(0, quantidade);
}

function distratoresDeImagem(palavraId: string, quantidade: number, seed: string) {
  const alvo = obterPalavra(palavraId);
  const indice = PALAVRAS.findIndex((p) => p.id === alvo.id);
  const vizinhas = PALAVRAS.filter((p) => p.id !== alvo.id)
    .map((p, i) => ({ p, distancia: Math.abs(i - indice) + hash(`${seed}-${p.id}`) / 1e12 }))
    .sort((a, b) => a.distancia - b.distancia)
    .map((item) => item.p);

  return baralhar(vizinhas.slice(0, Math.max(quantidade + 3, 5)), seed).slice(0, quantidade);
}

function distratoresDeSilaba(silabas: string[], quantidade: number, seed: string): string[] {
  const usadas = new Set(silabas.map((s) => s.toLocaleLowerCase('pt-PT')));
  const pool = PALAVRAS.flatMap((p) => p.silabas).filter(
    (s) => !usadas.has(s.toLocaleLowerCase('pt-PT'))
  );
  return baralhar([...new Set(pool)], seed).slice(0, quantidade);
}

export function numeroOpcoesSugerido(fase: Fase): number {
  if (fase <= 2) return 2;
  if (fase <= 4) return 3;
  return 4;
}

export function apoiosSugeridos(fase: Fase): Apoios {
  return {
    imagem: fase <= 3 || fase === 5,
    audio: true,
    silabas: fase >= 3
  };
}

export function criarRecurso(pedido: PedidoCriacao): Recurso {
  const palavra = obterPalavra(pedido.palavraId);
  const seed = `${pedido.palavraId}-${pedido.crianca.id}-${pedido.fase}-${pedido.tipo}-${Date.now()}`;
  const quantidade = Math.min(4, Math.max(2, pedido.numeroOpcoes));

  let opcoes: string[] = [];
  if (pedido.tipo === 'reconhecimento') {
    const extras = distratoresDePalavra(pedido.palavraId, quantidade - 1, seed);
    opcoes = baralhar([palavra.palavra, ...extras.map((p) => p.palavra)], seed);
  } else if (pedido.tipo === 'associacao' || pedido.tipo === 'frase') {
    const extras = distratoresDeImagem(pedido.palavraId, quantidade - 1, seed);
    opcoes = baralhar([palavra.id, ...extras.map((p) => p.id)], seed);
  } else if (pedido.tipo === 'silabas') {
    opcoes = distratoresDeSilaba(palavra.silabas, Math.max(1, quantidade - 1), seed);
  }

  const prompt = construirPrompt({
    palavra: palavra.palavra,
    silabas: palavra.silabas,
    frase: palavra.frase,
    fase: pedido.fase,
    tipo: pedido.tipo,
    numeroOpcoes: quantidade,
    apoios: pedido.apoios,
    crianca: pedido.crianca
  });

  const agora = new Date().toISOString();
  const base: Recurso = {
    id: `rec-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    criancaId: pedido.crianca.id,
    palavraId: palavra.id,
    palavra: palavra.palavra,
    silabas: [...palavra.silabas],
    frase: palavra.frase,
    tipo: pedido.tipo,
    fase: pedido.fase,
    opcoes,
    apoios: { ...pedido.apoios },
    estado: 'rascunho',
    origem: 'ia-previa',
    prompt,
    modelo: MODELO_IA,
    criadoEm: agora,
    feedbackCerto: feedbackCerto(pedido.tipo, palavra.palavra, palavra.silabas),
    feedbackErrado: feedbackErrado(pedido.tipo, palavra.palavra, palavra.silabas),
    validacao: []
  };

  return comValidacao(base);
}

export function feedbackCerto(tipo: TipoAtividade, palavra: string, silabas: string[]): string {
  switch (tipo) {
    case 'reconhecimento':
      return `Certo. Leste «${palavra}».`;
    case 'associacao':
      return `Certo. «${palavra}» é esta imagem.`;
    case 'silabas':
      return `Certo. ${silabas.join(' + ')} = ${palavra}.`;
    case 'frase':
      return `Certo. A frase fala de «${palavra}».`;
    default:
      return `Muito bem. Já conheces «${palavra}».`;
  }
}

export function feedbackErrado(tipo: TipoAtividade, palavra: string, silabas: string[]): string {
  switch (tipo) {
    case 'reconhecimento':
      return `Ainda não é essa. A palavra começa por «${silabas[0]}». Procura a mesma forma e tenta outra vez.`;
    case 'associacao':
      return 'Ainda não é essa. Ouve outra vez e pensa no que a palavra nomeia.';
    case 'silabas':
      return `Ainda não. A palavra começa por «${silabas[0]}». Tenta outra ordem.`;
    case 'frase':
      return `Ainda não. Procura «${palavra}» na frase e escolhe a imagem que lhe corresponde.`;
    default:
      return 'Explora a palavra com calma. Podes ouvir outra vez.';
  }
}
