import type { DatabaseSync } from 'node:sqlite';
import type { Crianca, Recurso, RegistoEscrita, Sessao } from '#lib/data/tipos';
import { base } from '../../../db/cliente.ts';
import { exigirIds, idsPermitidos, type ContextoDados } from '../../../db/escopo.ts';
import type { EstadoDados, Repositorio } from './tipo.ts';

function json<T>(texto: string, fallback: T): T {
  try {
    return JSON.parse(texto) as T;
  } catch {
    return fallback;
  }
}

type LinhaCrianca = {
  id: string; nome: string; idade: number; fase: number; cor: string;
  nota: string; palavras_trabalhadas: string;
};

type LinhaRecurso = Record<string, unknown> & {
  id: string; crianca_id: string; palavra_id: string; palavra: string;
  silabas: string; frase: string; tipo: string; fase: number; opcoes: string;
  resposta_correta: string | null; apoios: string; estado: string; origem: string;
  prompt: string; modelo: string; criado_em: string; aprovado_em: string | null;
  feedback_certo: string; feedback_errado: string; validacao: string;
};

type LinhaSessao = {
  id: string; crianca_id: string; inicio: string; fim: string; respostas: string;
};

type LinhaEscrita = {
  id: string; crianca_id: string; palavra_id: string; data: string; nota: string;
};

function paraCrianca(l: LinhaCrianca): Crianca {
  return {
    id: l.id, nome: l.nome, idade: l.idade, fase: l.fase as Crianca['fase'],
    cor: l.cor as Crianca['cor'],
    palavrasTrabalhadas: json(l.palavras_trabalhadas, [] as string[]),
    nota: l.nota
  };
}

function paraRecurso(l: LinhaRecurso): Recurso {
  return {
    id: l.id, criancaId: l.crianca_id, palavraId: l.palavra_id,
    palavra: l.palavra, silabas: json(l.silabas, [] as string[]), frase: l.frase,
    tipo: l.tipo as Recurso['tipo'], fase: l.fase as Recurso['fase'],
    opcoes: json(l.opcoes, [] as string[]),
    respostaCorreta: l.resposta_correta ?? undefined,
    apoios: json(l.apoios, { imagem: false, audio: false, silabas: false }),
    estado: l.estado as Recurso['estado'], origem: l.origem as Recurso['origem'],
    prompt: l.prompt, modelo: l.modelo, criadoEm: l.criado_em,
    aprovadoEm: l.aprovado_em ?? undefined,
    feedbackCerto: l.feedback_certo, feedbackErrado: l.feedback_errado,
    validacao: json(l.validacao, [])
  };
}

function paraSessao(l: LinhaSessao): Sessao {
  return {
    id: l.id, criancaId: l.crianca_id, inicio: l.inicio, fim: l.fim,
    respostas: json(l.respostas, [] as Sessao['respostas'])
  };
}

function paraEscrita(l: LinhaEscrita): RegistoEscrita {
  return {
    id: l.id, criancaId: l.crianca_id, palavraId: l.palavra_id,
    data: l.data, nota: l.nota
  };
}

/**
 * Repositório servidor, apoiado em SQLite.
 *
 * Todas as operações são limitadas ao contexto da sessão. Escritas são
 * diferenciais e transacionais: apenas as crianças, recursos, sessões e
 * escritas do próprio utilizador podem ser alterados. Contas e turmas nunca
 * são apagadas por uma importação.
 */
export class RepositorioDb implements Repositorio {
  async carregar(contexto: ContextoDados = {}): Promise<EstadoDados> {
    const db = base();
    const vazio = { versao: 1 as const, criancas: [], recursos: [], sessoes: [], escritas: [] };
    const ids = idsPermitidos(contexto);
    if (ids.length === 0) return vazio;
    const marcadores = ids.map(() => '?').join(',');

    return {
      versao: 1,
      criancas: (db.prepare(`SELECT c.* FROM criancas c
        WHERE c.id IN (${marcadores}) ORDER BY c.nome`).all(...ids) as LinhaCrianca[])
        .map(paraCrianca),
      recursos: (db.prepare(`SELECT * FROM recursos WHERE crianca_id IN (${marcadores})
        ORDER BY criado_em DESC`).all(...ids) as LinhaRecurso[]).map(paraRecurso),
      sessoes: (db.prepare(`SELECT * FROM sessoes WHERE crianca_id IN (${marcadores})
        ORDER BY fim DESC`).all(...ids) as LinhaSessao[]).map(paraSessao),
      escritas: (db.prepare(`SELECT * FROM escritas WHERE crianca_id IN (${marcadores})
        ORDER BY data DESC`).all(...ids) as LinhaEscrita[]).map(paraEscrita)
    };
  }

  async guardar(estado: EstadoDados, contexto: ContextoDados = {}): Promise<void> {
    const permitidos = new Set(idsPermitidos(contexto));
    if (permitidos.size === 0 && estado.criancas.length === 0) return;
    this.exigirEstado(estado, permitidos);

    const db = base();
    db.exec('BEGIN');
    try {
      this.sincronizar(estado, permitidos, db);
      db.exec('COMMIT');
    } catch (erro) {
      db.exec('ROLLBACK');
      throw erro;
    }
  }

  async repor(estado: EstadoDados, contexto: ContextoDados = {}): Promise<void> {
    const permitidos = new Set(idsPermitidos(contexto));
    if (permitidos.size === 0) throw new Error('Não há crianças autorizadas para repor.');
    this.exigirEstado(estado, permitidos);

    const db = base();
    db.exec('BEGIN');
    try {
      this.apagarRegistos(permitidos, db);
      this.sincronizar(estado, permitidos, db);
      db.exec('COMMIT');
    } catch (erro) {
      db.exec('ROLLBACK');
      throw erro;
    }
  }

  /** A cópia tem de descrever exatamente as crianças da turma autorizada. */
  private exigirEstado(estado: EstadoDados, permitidos: Set<string>): void {
    if (estado.criancas.length !== permitidos.size) {
      throw new Error('A cópia não inclui exatamente as crianças da turma autorizada.');
    }
    exigirIds(estado.criancas.map((c) => c.id), permitidos, 'Crianças');
    exigirIds(estado.recursos.map((r) => r.criancaId), permitidos, 'Recursos');
    exigirIds(estado.sessoes.map((s) => s.criancaId), permitidos, 'Sessões');
    exigirIds(estado.escritas.map((e) => e.criancaId), permitidos, 'Escritas');
  }

  /** Apaga apenas registos pedagógicos; nunca utilizadores, turmas ou sessões de login. */
  private apagarRegistos(permitidos: Set<string>, db: DatabaseSync): void {
    const donos = [...permitidos];
    const marcadores = donos.map(() => '?').join(',');
    for (const tabela of ['sessoes', 'escritas', 'recursos']) {
      db.prepare(`DELETE FROM ${tabela} WHERE crianca_id IN (${marcadores})`).run(...donos);
    }
  }

  /** Aplica o estado recebido e remove o que deixou de existir, dentro do escopo. */
  private sincronizar(
    estado: EstadoDados,
    permitidos: Set<string>,
    db: DatabaseSync
  ): void {
    for (const c of estado.criancas) {
      // `utilizador_id` e `turma_id` pertencem à conta e não são enviados pelo
      // browser: atualizamos só os campos pedagógicos.
      db.prepare(`UPDATE criancas SET nome=?, idade=?, fase=?, cor=?, nota=?,
        palavras_trabalhadas=? WHERE id=?`)
        .run(c.nome, c.idade, c.fase, c.cor, c.nota,
          JSON.stringify(c.palavrasTrabalhadas), c.id);
    }

    this.apagarForaDoEstado('recursos', estado.recursos.map((r) => r.id), permitidos, db);
    this.apagarForaDoEstado('sessoes', estado.sessoes.map((s) => s.id), permitidos, db);
    this.apagarForaDoEstado('escritas', estado.escritas.map((e) => e.id), permitidos, db);

    for (const r of estado.recursos) this.inserirRecurso(r, db);
    for (const s of estado.sessoes) this.inserirSessao(s, db);
    for (const e of estado.escritas) this.inserirEscrita(e, db);
  }

  private apagarForaDoEstado(
    tabela: string,
    ids: string[],
    permitidos: Set<string>,
    db: DatabaseSync
  ): void {
    const donos = [...permitidos];
    if (donos.length === 0) return;
    const donosSql = donos.map(() => '?').join(',');
    const manterSql = ids.length > 0
      ? ` AND id NOT IN (${ids.map(() => '?').join(',')})`
      : '';
    db.prepare(`DELETE FROM ${tabela} WHERE crianca_id IN (${donosSql})${manterSql}`)
      .run(...donos, ...ids);
  }

  private inserirRecurso(r: Recurso, db: DatabaseSync = base()): void {
    db.prepare(`INSERT OR REPLACE INTO recursos
      (id, crianca_id, palavra_id, palavra, silabas, frase, tipo, fase, opcoes,
       resposta_correta, apoios, estado, origem, prompt, modelo, criado_em,
       aprovado_em, feedback_certo, feedback_errado, validacao)
      VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`)
      .run(r.id, r.criancaId, r.palavraId, r.palavra, JSON.stringify(r.silabas), r.frase,
        r.tipo, r.fase, JSON.stringify(r.opcoes), r.respostaCorreta ?? null,
        JSON.stringify(r.apoios), r.estado, r.origem, r.prompt, r.modelo, r.criadoEm,
        r.aprovadoEm ?? null, r.feedbackCerto, r.feedbackErrado, JSON.stringify(r.validacao));
  }

  private inserirSessao(s: Sessao, db: DatabaseSync = base()): void {
    db.prepare(`INSERT OR REPLACE INTO sessoes (id, crianca_id, inicio, fim, respostas)
      VALUES (?,?,?,?,?)`).run(s.id, s.criancaId, s.inicio, s.fim, JSON.stringify(s.respostas));
  }

  private inserirEscrita(e: RegistoEscrita, db: DatabaseSync = base()): void {
    db.prepare(`INSERT OR REPLACE INTO escritas (id, crianca_id, palavra_id, data, nota)
      VALUES (?,?,?,?,?)`).run(e.id, e.criancaId, e.palavraId, e.data, e.nota);
  }
}
