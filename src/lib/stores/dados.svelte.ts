import { ESCRITAS_DEMO, RECURSOS_DEMO, SESSOES_DEMO, TURMA } from '#lib/data/demo';
import type { Crianca, Recurso, RegistoEscrita, Sessao } from '#lib/data/tipos';
import { RepositorioLocal } from '#lib/repositorios/local';
import type { EstadoDados, Repositorio } from '#lib/repositorios/tipo';
import { comValidacao, recursoValido } from '#lib/utils/validacao';

class Dados {
  criancas = $state<Crianca[]>(structuredClone(TURMA));
  recursos = $state<Recurso[]>(structuredClone(RECURSOS_DEMO));
  sessoes = $state<Sessao[]>(structuredClone(SESSOES_DEMO));
  escritas = $state<RegistoEscrita[]>(structuredClone(ESCRITAS_DEMO));
  pronto = $state(false);
  persistencia = $state<'ok' | 'indisponivel'>('ok');

  private repositorio: Repositorio = new RepositorioLocal();

  /** Permite ao servidor injetar o repositório de base de dados. */
  usarRepositorio(repositorio: Repositorio): void {
    this.repositorio = repositorio;
  }

  private estado(): EstadoDados {
    return {
      versao: 1,
      criancas: $state.snapshot(this.criancas) as Crianca[],
      recursos: $state.snapshot(this.recursos) as Recurso[],
      sessoes: $state.snapshot(this.sessoes) as Sessao[],
      escritas: $state.snapshot(this.escritas) as RegistoEscrita[]
    };
  }

  /** Aplica um estado já carregado pelo servidor (build com base de dados). */
  aplicarEstado(estado: EstadoDados): void {
    this.criancas = estado.criancas;
    this.recursos = estado.recursos.map((r) => comValidacao(r));
    this.sessoes = estado.sessoes;
    this.escritas = estado.escritas;
    this.pronto = true;
  }

  async carregar(): Promise<void> {
    try {
      const dados = await this.repositorio.carregar();
      this.criancas = dados.criancas;
      this.recursos = dados.recursos.map((r) => comValidacao(r));
      this.sessoes = dados.sessoes;
      this.escritas = dados.escritas;
      this.persistencia = 'ok';
    } catch {
      this.persistencia = 'indisponivel';
    }
    this.pronto = true;
  }

  guardar(): void {
    void this.guardarAwait();
  }

  /** Versão aguardável, para fluxos que dependem da persistência. */
  guardarAwait(): Promise<void> {
    return this.repositorio.guardar(this.estado()).then(
      () => { this.persistencia = 'ok'; },
      () => { this.persistencia = 'indisponivel'; }
    );
  }

  repor(): void {
    const estado: EstadoDados = {
      versao: 1,
      criancas: structuredClone(TURMA),
      recursos: structuredClone(RECURSOS_DEMO),
      sessoes: structuredClone(SESSOES_DEMO),
      escritas: structuredClone(ESCRITAS_DEMO)
    };
    this.criancas = estado.criancas;
    this.recursos = estado.recursos;
    this.sessoes = estado.sessoes;
    this.escritas = estado.escritas;
    void this.repositorio.repor(estado);
  }

  /** Aplica uma cópia já validada por `validarCopia`. */
  substituirTudo(copia: {
    criancas: Crianca[];
    recursos: Recurso[];
    sessoes: Sessao[];
    escritas: RegistoEscrita[];
  }): void {
    this.criancas = copia.criancas.map((c) => structuredClone(c));
    this.recursos = copia.recursos.map((r) => comValidacao(structuredClone(r)));
    this.sessoes = copia.sessoes.map((s) => structuredClone(s));
    this.escritas = copia.escritas.map((e) => structuredClone(e));
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

  adicionarCrianca(crianca: Crianca): void {
    this.criancas = [...this.criancas, crianca];
    this.guardar();
  }

  atualizarCrianca(crianca: Crianca): void {
    this.criancas = this.criancas.map((c) => (c.id === crianca.id ? crianca : c));
    this.guardar();
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
    const revalidado = comValidacao(atual);
    // A store é a guarda final: nenhum recurso com verificações em falta pode ser aprovado.
    if (!recursoValido(revalidado)) return undefined;
    const atualizado = comValidacao({
      ...revalidado,
      estado: 'aprovado',
      aprovadoEm: new Date().toISOString()
    });
    this.atualizarRecurso(atualizado);
    return this.recurso(id);
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
    return this.recurso(id);
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
