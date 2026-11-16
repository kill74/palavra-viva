import { PALAVRAS, obterPalavra } from '#lib/data/palavras';

type PalavraCatalogo = (typeof PALAVRAS)[number];

/** Compara palavras ignorando maiúsculas e espaços. */
export function mesmoTexto(a: string, b: string): boolean {
  return a.trim().toLocaleLowerCase('pt-PT') === b.trim().toLocaleLowerCase('pt-PT');
}

export function ultimaSilaba(p: PalavraCatalogo): string {
  return p.silabas[p.silabas.length - 1].toLocaleLowerCase('pt-PT');
}

export function ultimaVogal(p: PalavraCatalogo): string {
  const vogais = p.palavra.toLocaleLowerCase('pt-PT').match(/[aeiouáéíóúãõâêôà]/g);
  return vogais ? vogais[vogais.length - 1] : '';
}

/**
 * Proximidade pedagógica entre duas palavras do catálogo.
 * Prioriza parónimos — mesma sílaba inicial ou final — para que os distratores
 * exijam leitura atenta em vez de apenas memória visual.
 */
export function proximidade(a: PalavraCatalogo, b: PalavraCatalogo): number {
  let pontos = 0;
  if (a.silabas[0] === b.silabas[0]) pontos += 5;
  if (ultimaSilaba(a) === ultimaSilaba(b)) pontos += 4;
  if (a.palavra.length === b.palavra.length) pontos += 2;
  if (Math.abs(a.palavra.length - b.palavra.length) <= 1) pontos += 1;
  if (a.palavra[0] === b.palavra[0]) pontos += 2;
  if (ultimaVogal(a) === ultimaVogal(b) && ultimaVogal(a)) pontos += 1;
  return pontos;
}

/** Duas palavras rimam quando partilham a sílaba final ou, em falta dela, a última vogal. */
export function rimam(a: PalavraCatalogo, b: PalavraCatalogo): boolean {
  if (ultimaSilaba(a) === ultimaSilaba(b)) return true;
  const vogal = ultimaVogal(a);
  return vogal !== '' && vogal === ultimaVogal(b);
}

/** Palavras do léxico que rimam com o alvo, ordenadas por proximidade. */
export function rimasDe(palavraId: string): PalavraCatalogo[] {
  const alvo = obterPalavra(palavraId);
  const exatas = PALAVRAS.filter((p) => p.id !== alvo.id && ultimaSilaba(p) === ultimaSilaba(alvo));
  if (exatas.length >= 2) return exatas;

  const aproximadas = PALAVRAS.filter(
    (p) => p.id !== alvo.id && !exatas.includes(p) && rimam(p, alvo)
  );
  return [...exatas, ...aproximadas];
}
