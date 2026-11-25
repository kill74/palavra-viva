import type { Crianca, Recurso, RegistoEscrita, Sessao } from '#lib/data/tipos';

export type Copia = {
  versao: 1;
  criancas: Crianca[];
  recursos: Recurso[];
  sessoes: Sessao[];
  escritas: RegistoEscrita[];
};

/**
 * Valida uma cópia importada antes de substituir os dados locais.
 *
 * Não confiamos no ficheiro: verificamos a forma de cada registo, a unicidade
 * dos ids e que todas as referências apontam para crianças existentes.
 * Devolvemos uma lista de problemas em português, pronta a mostrar.
 */
export function validarCopia(texto: string): { dados?: Copia; erros: string[] } {
  let bruto: unknown;
  try {
    // Aceita BOM inicial, comum em ficheiros guardados por editores Windows.
    bruto = JSON.parse(texto.replace(/^\uFEFF/, '').trim());
  } catch {
    return { erros: ['O ficheiro não contém JSON válido.'] };
  }

  if (!objeto(bruto)) return { erros: ['O ficheiro não contém um objeto.'] };
  const dados = bruto as Record<string, unknown>;

  if (dados.versao !== 1) return { erros: ['Versão desconhecida. Só é aceite a versão 1.'] };

  const erros: string[] = [];
  const criancas = lista(dados.criancas, 'criancas', erros) as Crianca[];
  const recursos = lista(dados.recursos, 'recursos', erros) as Recurso[];
  const sessoes = lista(dados.sessoes, 'sessoes', erros) as Sessao[];
  const escritas = lista(dados.escritas ?? [], 'escritas', erros) as RegistoEscrita[];

  const idsCriancas = new Set<string>();
  for (const c of criancas) {
    if (!textoCurto(c?.id)) erros.push('Uma criança não tem identificador válido.');
    else if (idsCriancas.has(c.id)) erros.push(`Identificador de criança repetido: ${c.id}.`);
    else idsCriancas.add(c.id);
    if (!textoCurto(c?.nome)) erros.push('Uma criança não tem nome válido.');
    if (![1, 2, 3, 4, 5, 6].includes(c?.fase)) erros.push(`A criança ${c?.nome ?? '?'} tem uma fase inválida.`);
  }

  const idsRecursos = new Set<string>();
  for (const r of recursos) {
    if (!textoCurto(r?.id)) erros.push('Um recurso não tem identificador válido.');
    else if (idsRecursos.has(r.id)) erros.push(`Identificador de recurso repetido: ${r.id}.`);
    else idsRecursos.add(r.id);
    if (!idsCriancas.has(r?.criancaId)) erros.push(`O recurso ${r?.id ?? '?'} aponta para uma criança inexistente.`);
    if (!textoCurto(r?.palavra)) erros.push(`O recurso ${r?.id ?? '?'} não tem palavra.`);
    if (r?.estado !== 'rascunho' && r?.estado !== 'aprovado') {
      erros.push(`O recurso ${r?.id ?? '?'} tem um estado inválido.`);
    }
  }

  const idsSessoes = new Set<string>();
  for (const s of sessoes) {
    if (!textoCurto(s?.id)) erros.push('Uma sessão não tem identificador válido.');
    else if (idsSessoes.has(s.id)) erros.push(`Identificador de sessão repetido: ${s.id}.`);
    else idsSessoes.add(s.id);
    if (!idsCriancas.has(s?.criancaId)) erros.push(`A sessão ${s?.id ?? '?'} aponta para uma criança inexistente.`);
    if (!Array.isArray(s?.respostas)) erros.push(`A sessão ${s?.id ?? '?'} não tem respostas válidas.`);
  }

  const idsEscritas = new Set<string>();
  for (const e of escritas) {
    if (!textoCurto(e?.id)) erros.push('Um registo de escrita não tem identificador válido.');
    else if (idsEscritas.has(e.id)) erros.push(`Identificador de escrita repetido: ${e.id}.`);
    else idsEscritas.add(e.id);
    if (!idsCriancas.has(e?.criancaId)) erros.push(`A escrita ${e?.id ?? '?'} aponta para uma criança inexistente.`);
  }

  if (erros.length > 0) return { erros };
  return { dados: { versao: 1, criancas, recursos, sessoes, escritas }, erros: [] };
}

function objeto(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null && !Array.isArray(v);
}

function lista(v: unknown, nome: string, erros: string[]): unknown[] {
  if (!Array.isArray(v)) {
    erros.push(`O campo «${nome}» deve ser uma lista.`);
    return [];
  }
  return v;
}

function textoCurto(v: unknown): v is string {
  return typeof v === 'string' && v.trim().length > 0;
}

/** Serializa o estado atual para download. */
export function criarCopia(dados: {
  criancas: Crianca[];
  recursos: Recurso[];
  sessoes: Sessao[];
  escritas: RegistoEscrita[];
}): string {
  // JSON é usado de propósito: funciona mesmo quando os arrays vieram de
  // $state (proxies do Svelte), que o structuredClone não consegue clonar.
  const copia: Copia = {
    versao: 1,
    criancas: JSON.parse(JSON.stringify(dados.criancas)) as Crianca[],
    recursos: JSON.parse(JSON.stringify(dados.recursos)) as Recurso[],
    sessoes: JSON.parse(JSON.stringify(dados.sessoes)) as Sessao[],
    escritas: JSON.parse(JSON.stringify(dados.escritas)) as RegistoEscrita[]
  };
  return JSON.stringify(copia, null, 2);
}
