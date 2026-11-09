export type Fase = 1 | 2 | 3 | 4 | 5 | 6;

export type TipoAtividade =
  | 'cartao'
  | 'reconhecimento'
  | 'associacao'
  | 'silabas'
  | 'frase';

export type EstadoRecurso = 'rascunho' | 'aprovado';

export type Apoios = {
  imagem: boolean;
  audio: boolean;
  silabas: boolean;
};

export type ValidacaoId =
  | 'ortografia'
  | 'silabica'
  | 'imagem'
  | 'pronuncia'
  | 'opcoes'
  | 'frase';

export type ValidacaoItem = {
  id: ValidacaoId;
  ok: boolean;
  detalhe: string;
};

export type Recurso = {
  id: string;
  criancaId: string;
  palavraId: string;
  palavra: string;
  silabas: string[];
  frase: string;
  tipo: TipoAtividade;
  fase: Fase;
  opcoes: string[];
  apoios: Apoios;
  estado: EstadoRecurso;
  origem: 'ia-previa' | 'manual';
  prompt: string;
  modelo: string;
  criadoEm: string;
  aprovadoEm?: string;
  feedbackCerto: string;
  feedbackErrado: string;
  validacao: ValidacaoItem[];
};

export type Crianca = {
  id: string;
  nome: string;
  idade: number;
  fase: Fase;
  palavrasTrabalhadas: string[];
  cor: 'coral' | 'cobalto' | 'verde' | 'sol';
  nota: string;
};

export type Resposta = {
  recursoId: string;
  palavra: string;
  tipo: TipoAtividade;
  tentativas: number;
  ajudas: number;
  acertouPrimeira: boolean;
  tempoMs: number;
  usouAudio: boolean;
  usouDica: boolean;
  revelou: boolean;
};

export type Sessao = {
  id: string;
  criancaId: string;
  inicio: string;
  fim: string;
  respostas: Resposta[];
};

export type RegistoEscrita = {
  id: string;
  criancaId: string;
  palavraId: string;
  data: string;
  nota: string;
};

export type Tema = 'claro' | 'escuro';

export const FASES: Array<{
  numero: Fase;
  nome: string;
  descricao: string;
  exemplo: string;
}> = [
  {
    numero: 1,
    nome: 'Palavra inteira',
    descricao: 'Reconhecer a palavra com a imagem e o som por perto.',
    exemplo: 'vê a menina, ouve «menina», encontra «menina»'
  },
  {
    numero: 2,
    nome: 'Sem apoio',
    descricao: 'Reconhecer a forma escrita sem depender da imagem.',
    exemplo: 'escolhe «menina» entre «menino» e «uva»'
  },
  {
    numero: 3,
    nome: 'Sílabas',
    descricao: 'Ouvir, marcar e reconstruir as partes da palavra.',
    exemplo: 'me · ni · na; junta as partes por ordem'
  },
  {
    numero: 4,
    nome: 'Novas palavras',
    descricao: 'Combinar sílabas conhecidas e ler o resultado.',
    exemplo: 'pa + to = pato; sa + pa + to = sapato'
  },
  {
    numero: 5,
    nome: 'Frases',
    descricao: 'Ler uma frase curta e compreender o que diz.',
    exemplo: '«O menino usa o sapato.» e escolher a imagem'
  },
  {
    numero: 6,
    nome: 'Escrita',
    descricao: 'Copiar com modelo, no papel, e registar a conclusão.',
    exemplo: 'ficha impressa com a palavra para copiar'
  }
];

export const NOMES_TIPO: Record<TipoAtividade, string> = {
  cartao: 'Cartão de palavra',
  reconhecimento: 'Reconhecer a palavra',
  associacao: 'Associar som e imagem',
  silabas: 'Construir com sílabas',
  frase: 'Ler uma frase'
};

export const DESCRICAO_TIPO: Record<TipoAtividade, string> = {
  cartao: 'Palavra, imagem e áudio para explorar sem pressa.',
  reconhecimento: 'Escolher a palavra escrita certa entre várias opções.',
  associacao: 'Ouvir a palavra e encontrar a imagem correspondente.',
  silabas: 'Recompor a palavra a partir das sílabas conhecidas.',
  frase: 'Ler uma frase curta e escolher a imagem que combina.'
};

export const NOMES_FASE = Object.fromEntries(
  FASES.map((f) => [f.numero, f.nome])
) as Record<Fase, string>;

export const NOMES_COR: Record<Crianca['cor'], string> = {
  coral: 'coral',
  cobalto: 'azul',
  verde: 'verde',
  sol: 'amarelo'
};
