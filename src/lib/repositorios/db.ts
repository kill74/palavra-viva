import type { Crianca, Recurso, RegistoEscrita, Sessao } from '#lib/data/tipos';
import { base } from '../../../db/cliente.ts';
import type { EstadoDados, Repositorio } from './tipo';

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

/** Repositório servidor, apoiado em SQLite. */
export class RepositorioDb implements Repositorio {
  async carregar(professoraId?: string, criancaId?: string): Promise<EstadoDados> {
    const db = base();
    const vazio = { versao: 1 as const, criancas: [], recursos: [], sessoes: [], escritas: [] };

    // Sem uma conta autenticada identificada não devolvemos dados: uma falha
    // aqui não pode resultar na lista completa de crianças de todas as turmas.
    if (!professoraId && !criancaId) return vazio;

    const criancas = professoraId
      ? (db.prepare(`SELECT c.* FROM criancas c
          JOIN turmas t ON t.id = c.turma_id
          WHERE t.professora_id = ? ORDER BY c.nome`)
          .all(professoraId) as LinhaCrianca[]).map(paraCrianca)
      : (db.prepare('SELECT * FROM criancas WHERE id = ?')
          .all(criancaId ?? '') as LinhaCrianca[]).map(paraCrianca);
    if (criancas.length === 0) return vazio;
    const ids = criancas.map((c) => c.id);
    const marcadores = ids.map(() => '?').join(',');

    return {
      versao: 1,
      criancas,
      recursos: (db.prepare(`SELECT * FROM recursos WHERE crianca_id IN (${marcadores})
        ORDER BY criado_em DESC`).all(...ids) as LinhaRecurso[]).map(paraRecurso),
      sessoes: (db.prepare(`SELECT * FROM sessoes WHERE crianca_id IN (${marcadores})
        ORDER BY fim DESC`).all(...ids) as LinhaSessao[]).map(paraSessao),
      escritas: (db.prepare(`SELECT * FROM escritas WHERE crianca_id IN (${marcadores})
        ORDER BY data DESC`).all(...ids) as LinhaEscrita[]).map(paraEscrita)
    };
  }

  async guardar(estado: EstadoDados): Promise<void> {
    const db = base();
    db.exec('BEGIN');
    try {
      for (const c of estado.criancas) {
        db.prepare(`INSERT INTO criancas
          (id, utilizador_id, nome, idade, fase, cor, nota, palavras_trabalhadas)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)
          ON CONFLICT(id) DO UPDATE SET nome=excluded.nome, idade=excluded.idade,
            fase=excluded.fase, cor=excluded.cor, nota=excluded.nota,
            palavras_trabalhadas=excluded.palavras_trabalhadas`)
          .run(c.id, `util-${c.id}`, c.nome, c.idade, c.fase, c.cor, c.nota,
            JSON.stringify(c.palavrasTrabalhadas));
      }
      db.exec('COMMIT');
    } catch (erro) {
      db.exec('ROLLBACK');
      throw erro;
    }
  }

  async repor(estado: EstadoDados): Promise<void> {
    const db = base();
    db.exec('BEGIN');
    try {
      db.prepare('DELETE FROM sessoes_login').run();
      db.prepare('DELETE FROM escritas').run();
      db.prepare('DELETE FROM sessoes').run();
      db.prepare('DELETE FROM recursos').run();
      db.prepare('DELETE FROM criancas').run();
      db.exec('COMMIT');
    } catch (erro) {
      db.exec('ROLLBACK');
      throw erro;
    }
    await this.guardar(estado);
    for (const r of estado.recursos) this.inserirRecurso(r);
    for (const s of estado.sessoes) this.inserirSessao(s);
    for (const e of estado.escritas) this.inserirEscrita(e);
  }

  private inserirRecurso(r: Recurso): void {
    base().prepare(`INSERT OR REPLACE INTO recursos
      (id, crianca_id, palavra_id, palavra, silabas, frase, tipo, fase, opcoes,
       resposta_correta, apoios, estado, origem, prompt, modelo, criado_em,
       aprovado_em, feedback_certo, feedback_errado, validacao)
      VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`)
      .run(r.id, r.criancaId, r.palavraId, r.palavra, JSON.stringify(r.silabas), r.frase,
        r.tipo, r.fase, JSON.stringify(r.opcoes), r.respostaCorreta ?? null,
        JSON.stringify(r.apoios), r.estado, r.origem, r.prompt, r.modelo, r.criadoEm,
        r.aprovadoEm ?? null, r.feedbackCerto, r.feedbackErrado, JSON.stringify(r.validacao));
  }

  private inserirSessao(s: Sessao): void {
    base().prepare(`INSERT OR REPLACE INTO sessoes (id, crianca_id, inicio, fim, respostas)
      VALUES (?,?,?,?,?)`).run(s.id, s.criancaId, s.inicio, s.fim, JSON.stringify(s.respostas));
  }

  private inserirEscrita(e: RegistoEscrita): void {
    base().prepare(`INSERT OR REPLACE INTO escritas (id, crianca_id, palavra_id, data, nota)
      VALUES (?,?,?,?,?)`).run(e.id, e.criancaId, e.palavraId, e.data, e.nota);
  }
}
