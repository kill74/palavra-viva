import { ESCRITAS_DEMO, RECURSOS_DEMO, SESSOES_DEMO, TURMA } from '#lib/data/demo';
import type { Crianca, Recurso, RegistoEscrita, Sessao } from '#lib/data/tipos';
import { comValidacao } from '#lib/utils/validacao';

const CHAVE = 'palavra-viva:dados:v1';

type EstadoGuardado = {
  versao: 1;
  criancas: Crianca[];
  recursos: Recurso[];
  sessoes: Sessao[];
  escritas?: RegistoEscrita[];
};

class Dados {
  criancas = $state<Crianca[]>(structuredClone(TURMA));
  recursos = $state<Recurso[]>(structuredClone(RECURSOS_DEMO));
  sessoes = $state<Sessao[]>(structuredClone(SESSOES_DEMO));
  escritas = $state<RegistoEscrita[]>(structuredClone(ESCRITAS_DEMO));
  pronto = $state(false);
  persistencia = $state<'ok' | 'indisponivel'>('ok');

  carregar(): void {
    if (typeof localStorage === 'undefined') return;
    try {
      const bruto = localStorage.getItem(CHAVE);
      if (!bruto) {
        this.pronto = true;
        return;
      }
      const dados = JSON.parse(bruto) as Partial<EstadoGuardado>;
      if (Array.isArray(dados.criancas) && dados.criancas.length > 0) {
        this.criancas = dados.criancas;
      }
      if (Array.isArray(dados.recursos)) {
        this.recursos = dados.recursos.map((r) => comValidacao(r));
      }
      if (Array.isArray(dados.sessoes)) {
        this.sessoes = dados.sessoes;
      }
      if (Array.isArray(dados.escritas)) {
        this.escritas = dados.escritas;
      }
      this.pronto = true;
    } catch {
      this.persistencia = 'indisponivel';
      this.pronto = true;
    }
  }

  guardar(): void {
    if (typeof localStorage === 'undefined') return;
    try {
      const estado: EstadoGuardado = {
        versao: 1,
        criancas: this.criancas,
        recursos: this.recursos,
        sessoes: this.sessoes,
        escritas: this.escritas
      };
      localStorage.setItem(CHAVE, JSON.stringify(estado));
      this.persistencia = 'ok';
    } catch {
      this.persistencia = 'indisponivel';
    }
  }

  repor(): void {
    this.criancas = structuredClone(TURMA);
    this.recursos = structuredClone(RECURSOS_DEMO);
    this.sessoes = structuredClone(SESSOES_DEMO);
    this.escritas = structuredClone(ESCRITAS_DEMO);
    this.guardar();
  }

  crianca(id: string): Crianca | undefined {
    return this.criancas.find((c) => c.id === id);
  }

  recurso(id: string): Recurso | undefined {
    return this.recursos.find((r) => r.id === id);
  }

  recursosDaCrianca(criancaId: string, apenasAprovados = true): Recurso[] {
    return this.recursos.filter(
      (r) => r.criancaId === criancaId && (!apenasAprovados || r.estado === 'aprovado')
    );
  }

  recursosPorAprovar(): Recurso[] {
    return this.recursos.filter((r) => r.estado === 'rascunho');
  }

  sessoesDaCrianca(criancaId: string): Sessao[] {
    return this.sessoes
      .filter((s) => s.criancaId === criancaId)
      .sort((a, b) => b.fim.localeCompare(a.fim));
  }

  adicionarRecurso(recurso: Recurso): void {
    this.recursos = [comValidacao(recurso), ...this.recursos];
    this.guardar();
  }

  atualizarRecurso(recurso: Recurso): void {
    this.recursos = this.recursos.map((r) =>
      r.id === recurso.id ? comValidacao(recurso) : r
    );
    this.guardar();
  }

  aprovarRecurso(id: string): Recurso | undefined {
    const atual = this.recurso(id);
    if (!atual) return undefined;
    const atualizado = comValidacao({
      ...atual,
      estado: 'aprovado',
      aprovadoEm: new Date().toISOString()
    });
    this.atualizarRecurso(atualizado);
    return atualizado;
  }

  devolverARascunho(id: string): Recurso | undefined {
    const atual = this.recurso(id);
    if (!atual) return undefined;
    const atualizado = comValidacao({
      ...atual,
      estado: 'rascunho',
      aprovadoEm: undefined
    });
    this.atualizarRecurso(atualizado);
    return atualizado;
  }

  eliminarRecurso(id: string): void {
    this.recursos = this.recursos.filter((r) => r.id !== id);
    this.guardar();
  }

  registarSessao(sessao: Sessao): void {
    this.sessoes = [sessao, ...this.sessoes];
    this.guardar();
  }

  registarEscrita(registo: RegistoEscrita): void {
    this.escritas = [registo, ...this.escritas];
    this.guardar();
  }

  escritasDaCrianca(criancaId: string): RegistoEscrita[] {
    return this.escritas
      .filter((e) => e.criancaId === criancaId)
      .sort((a, b) => b.data.localeCompare(a.data));
  }

  estatisticas() {
    const respostas = this.sessoes.flatMap((s) => s.respostas);
    const total = respostas.length;
    const autonomas = respostas.filter((r) => r.acertouPrimeira).length;
    const apoiadas = total - autonomas;
    const ajudas = respostas.reduce((soma, r) => soma + r.ajudas, 0);
    const audio = respostas.filter((r) => r.usouAudio).length;
    return {
      sessoes: this.sessoes.length,
      respostas: total,
      autonomas,
      apoiadas,
      ajudas,
      audio,
      percentagemAutonoma: total ? Math.round((autonomas / total) * 100) : 0
    };
  }
}

export const dados = new Dados();
