import type { Crianca, Sessao } from '#lib/data/tipos';

const CHAVE = 'palavra-viva:reler:v1';

type Estado = Record<string, string[]>;

function ler(): Estado {
  if (typeof localStorage === 'undefined') return {};
  try {
    const bruto = localStorage.getItem(CHAVE);
    if (!bruto) return {};
    const dados: unknown = JSON.parse(bruto);
    if (!dados || typeof dados !== 'object' || Array.isArray(dados)) return {};
    const resultado: Estado = {};
    for (const [id, valores] of Object.entries(dados as Record<string, unknown>)) {
      if (Array.isArray(valores)) resultado[id] = valores.filter((v): v is string => typeof v === 'string');
    }
    return resultado;
  } catch {
    return {};
  }
}

function guardar(estado: Estado): void {
  if (typeof localStorage === 'undefined') return;
  try {
    localStorage.setItem(CHAVE, JSON.stringify(estado));
  } catch {
    // Sem persistência: a lista continua apenas em memória.
  }
}

/** Palavras que a criança marcou para rever. */
export function palavrasParaReler(criancaId: string): string[] {
  return ler()[criancaId] ?? [];
}

/** Alterna uma palavra na lista de "quero reler". */
export function alternarParaReler(criancaId: string, palavraId: string): string[] {
  const estado = ler();
  const atuais = new Set(estado[criancaId] ?? []);
  if (atuais.has(palavraId)) atuais.delete(palavraId);
  else atuais.add(palavraId);
  const lista = [...atuais];
  estado[criancaId] = lista;
  guardar(estado);
  return lista;
}

/** Palavras que a criança já acertou numa sessão, por ordem de ocorrência. */
export function palavrasLidas(sessoes: Sessao[], crianca: Crianca): string[] {
  const vistas = new Set<string>();
  const resultado: string[] = [];
  for (const s of [...sessoes].sort((a, b) => a.fim.localeCompare(b.fim))) {
    if (s.criancaId !== crianca.id) continue;
    for (const r of s.respostas) {
      if (r.acertouPrimeira && !vistas.has(r.palavra)) {
        vistas.add(r.palavra);
        resultado.push(r.palavra);
      }
    }
  }
  return resultado;
}
