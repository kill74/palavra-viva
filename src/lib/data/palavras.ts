export type Palavra = {
  id: string;
  palavra: string;
  silabas: string[];
  ordem: number;
  imagem: string;
  audio: string;
  alt: string;
  frase: string;
  fraseAudio: string;
  nuclear: boolean;
  nota?: string;
};

const base = '/palavras';
const audio = '/audio/palavras';
const audioFrases = '/audio/frases';

function entrada(
  id: string,
  palavra: string,
  silabas: string[],
  ordem: number,
  alt: string,
  frase: string,
  nuclear = true
): Palavra {
  return {
    id,
    palavra,
    silabas,
    ordem,
    imagem: `${base}/${id}.svg`,
    audio: `${audio}/${id}.mp3`,
    alt,
    frase,
    fraseAudio: `${audioFrases}/${id}.mp3`,
    nuclear
  };
}

/**
 * Sequência adotada: a indicada no enunciado, com «mamã» e «gema»
 * (e não a variante «dedo»/«ovo»). A referência é Duarte (2018).
 */
export const PALAVRAS: Palavra[] = [
  entrada('menina', 'menina', ['me', 'ni', 'na'], 1, 'Menina de vestido, com dois apanhados no cabelo.', 'A menina lê o livro.'),
  entrada('menino', 'menino', ['me', 'ni', 'no'], 2, 'Menino de camisola, com o cabelo curto.', 'O menino joga a bola.'),
  entrada('uva', 'uva', ['u', 'va'], 3, 'Cacho de uvas roxas com uma folha verde.', 'A uva está na mesa.'),
  entrada('sapato', 'sapato', ['sa', 'pa', 'to'], 4, 'Sapato desportivo visto de lado, com atacadores.', 'O menino usa o sapato.'),
  entrada('bota', 'bota', ['bo', 'ta'], 5, 'Bota alta de cano, com fivela.', 'A bota é da menina.'),
  entrada('mama', 'mamã', ['ma', 'mã'], 6, 'Mulher adulta com o cabelo apanhado e um lenço ao pescoço.', 'A mamã lê com a menina.'),
  entrada('leque', 'leque', ['le', 'que'], 7, 'Leque aberto em semicírculo, com hastes vincadas.', 'A menina abre o leque.'),
  entrada('casa', 'casa', ['ca', 'sa'], 8, 'Casa pequena com telhado, porta e janela.', 'A casa tem uma janela.'),
  entrada('janela', 'janela', ['ja', 'ne', 'la'], 9, 'Janela de quatro vidros com cortinas.', 'A janela é da casa.'),
  entrada('telhado', 'telhado', ['te', 'lha', 'do'], 10, 'Telhado de duas águas, com telhas e chaminé.', 'O telhado é vermelho.'),
  entrada('escada', 'escada', ['es', 'ca', 'da'], 11, 'Escada de cinco degraus com corrimão.', 'A menina sobe a escada.'),
  entrada('chave', 'chave', ['cha', 've'], 12, 'Chave antiga com argola e dois dentes.', 'A chave abre a casa.'),
  entrada('galinha', 'galinha', ['ga', 'li', 'nha'], 13, 'Galinha branca com crista vermelha e bico amarelo.', 'A galinha põe um ovo.'),
  entrada('gema', 'gema', ['ge', 'ma'], 14, 'Ovo aberto numa frigideira, com a gema amarela.', 'A gema é amarela.'),
  entrada('rato', 'rato', ['ra', 'to'], 15, 'Rato cinzento com orelhas redondas e cauda comprida.', 'O rato corre na casa.'),
  entrada('cenoura', 'cenoura', ['ce', 'nou', 'ra'], 16, 'Cenoura laranja com folhas verdes.', 'A cenoura está na mesa.'),
  entrada('girafa', 'girafa', ['gi', 'ra', 'fa'], 17, 'Girafa de pescoço comprido com manchas.', 'A girafa come a flor.'),
  entrada('palhaco', 'palhaço', ['pa', 'lha', 'ço'], 18, 'Palhaço com chapéu, nariz redondo e laço.', 'O palhaço é engraçado.'),
  entrada('zebra', 'zebra', ['ze', 'bra'], 19, 'Zebra com riscas pretas e brancas.', 'A zebra corre.'),
  entrada('peixe', 'peixe', ['pei', 'xe'], 20, 'Peixe azul com escamas e bolhas de ar.', 'O peixe nada na água.'),
  entrada('bandeira', 'bandeira', ['ban', 'dei', 'ra'], 21, 'Bandeira portuguesa numa haste.', 'A bandeira é verde e vermelha.'),
  entrada('funil', 'funil', ['fu', 'nil'], 22, 'Funil de cozinha com uma gota a cair.', 'A menina usa o funil.'),
  entrada('arvore', 'árvore', ['ár', 'vo', 're'], 23, 'Árvore com copa verde e tronco castanho.', 'A árvore tem flores.'),
  entrada('quadro', 'quadro', ['qua', 'dro'], 24, 'Quadro verde de sala de aula, num cavalete.', 'O quadro é da sala.'),
  entrada('passarinho', 'passarinho', ['pas', 'sa', 'ri', 'nho'], 25, 'Passarinho pequeno pousado num ramo.', 'O passarinho canta.'),
  entrada('cigarra', 'cigarra', ['ci', 'gar', 'ra'], 26, 'Cigarra verde com asas transparentes.', 'A cigarra canta na árvore.'),
  entrada('fogueira', 'fogueira', ['fo', 'guei', 'ra'], 27, 'Fogueira com três troncos e chamas.', 'A fogueira é quente.'),
  entrada('flor', 'flor', ['flor'], 28, 'Flor amarela com cinco pétalas e caule verde.', 'A flor é amarela.'),
  // Palavras derivadas usadas na recombinação e nas frases.
  entrada('mesa', 'mesa', ['me', 'sa'], 0, 'Mesa de madeira com quatro pernas.', 'A uva está na mesa.', false),
  entrada('pato', 'pato', ['pa', 'to'], 0, 'Pato amarelo com bico laranja, a nadar.', 'O pato nada na água.', false),
  entrada('nave', 'nave', ['na', 've'], 0, 'Nave espacial com três janelas e uma chama.', 'A nave vai para o espaço.', false),
  entrada('bola', 'bola', ['bo', 'la'], 0, 'Bola de futebol branca e azul.', 'O menino joga a bola.', false),
  entrada('gato', 'gato', ['ga', 'to'], 0, 'Gato laranja sentado, com bigodes.', 'O gato dorme na cadeira.', false),
  entrada('mala', 'mala', ['ma', 'la'], 0, 'Mala de viagem com uma etiqueta.', 'A mala está na escada.', false)
];

export const PALAVRAS_NUCLEARES = PALAVRAS.filter((p) => p.nuclear);

export const porId = new Map(PALAVRAS.map((p) => [p.id, p]));

export function obterPalavra(id: string): Palavra {
  return porId.get(id) ?? PALAVRAS[0];
}

export function porTexto(texto: string): Palavra | undefined {
  const limpo = texto.trim().toLowerCase();
  return PALAVRAS.find((p) => p.palavra.toLowerCase() === limpo);
}

export const INDICE_ORDEM = new Map(PALAVRAS_NUCLEARES.map((p) => [p.id, p.ordem]));

export const SILABAS = PALAVRAS.flatMap((p) =>
  p.silabas.map((silaba, indice) => ({
    silaba,
    palavraId: p.id,
    indice,
    audio: `/audio/silabas/${p.id}-${indice}.mp3`
  }))
);

export function audioDaSilaba(palavraId: string, indice: number): string {
  return `/audio/silabas/${palavraId}-${indice}.mp3`;
}

export function fonteDaSilaba(silaba: string): { audio: string; palavraId: string; indice: number } {
  const achada = SILABAS.find(
    (s) => s.silaba.toLocaleLowerCase('pt-PT') === silaba.toLocaleLowerCase('pt-PT')
  );
  return achada ?? SILABAS[0];
}

export function palavraSegueSequencia(id: string, trabalhadas: string[]): boolean {
  const palavra = porId.get(id);
  if (!palavra) return false;
  if (!palavra.nuclear) return true;
  const anteriores = PALAVRAS_NUCLEARES.filter((p) => p.ordem < palavra.ordem);
  return anteriores.every((p) => trabalhadas.includes(p.id));
}

export const LIGACOES = [
  'o', 'a', 'os', 'as', 'um', 'uma', 'de', 'do', 'da', 'em', 'na', 'no',
  'com', 'e', 'é', 'tem', 'está', 'usa', 'lê', 'joga', 'abre', 'sobe',
  'põe', 'corre', 'come', 'nada', 'canta', 'vai', 'para'
];

/** Vocabulário de leitura já revisto, usado nas frases e nas atividades. */
export const VOCABULARIO_EXTRA = [
  'livro', 'vermelho', 'vermelha', 'ovo', 'amarela', 'engraçado', 'água',
  'verde', 'flores', 'sala', 'quente', 'espaço', 'dorme', 'cadeira',
  'papel', 'lápis', 'desenho', 'grande', 'pequeno', 'redondo'
];
