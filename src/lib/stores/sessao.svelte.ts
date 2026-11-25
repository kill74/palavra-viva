import { dados } from '#lib/stores/dados.svelte';

const CHAVE = 'palavra-viva:sessao:v1';

/** Código de demonstração para a área do professor. Não é segurança real. */
export const CODIGO_DEMONSTRACAO = '1234';

export type Perfil = 'professor' | 'crianca';

type EstadoGuardado = {
  versao: 1;
  perfil: Perfil | null;
  criancaId: string | null;
};

/**
 * Sessão simulada, guardada apenas no browser.
 *
 * O objetivo é separar os dois percursos (professor / criança) e dar um
 * contexto claro ao cabeçalho. Não há autenticação nem dados pessoais reais:
 * o código do professor está visível na própria página de entrada.
 */
class Sessao {
  perfil = $state<Perfil | null>(null);
  criancaId = $state<string | null>(null);
  carregada = $state(false);
  /** Evita que a guarda de rotas reenvie para o login durante um logout. */
  saindo = $state(false);

  carregar(): void {
    if (typeof localStorage === 'undefined') {
      this.carregada = true;
      return;
    }
    try {
      const bruto = localStorage.getItem(CHAVE);
      if (bruto) {
        const estado = JSON.parse(bruto) as Partial<EstadoGuardado>;
        if (estado.perfil === 'professor' || estado.perfil === 'crianca') {
          this.perfil = estado.perfil;
        }
        this.criancaId = typeof estado.criancaId === 'string' ? estado.criancaId : null;
      }
    } catch {
      // Estado inválido: entra-se como convidado, sem perfil ativo.
      this.perfil = null;
      this.criancaId = null;
    }
    this.validarCrianca();
    this.carregada = true;
  }

  private guardar(): void {
    if (typeof localStorage === 'undefined') return;
    try {
      const estado: EstadoGuardado = {
        versao: 1,
        perfil: this.perfil,
        criancaId: this.criancaId
      };
      localStorage.setItem(CHAVE, JSON.stringify(estado));
    } catch {
      // localStorage indisponível: a sessão continua apenas em memória.
    }
  }

  /** Remove uma criança que já não exista na turma (pode ser chamado a qualquer momento). */
  validarCrianca(): void {
    if (this.criancaId && !dados.crianca(this.criancaId)) {
      this.criancaId = null;
      if (this.perfil === 'crianca') this.perfil = null;
    }
  }

  entrarComoProfessor(): void {
    this.perfil = 'professor';
    this.criancaId = null;
    this.guardar();
  }

  entrarComoCrianca(criancaId: string): boolean {
    if (!dados.crianca(criancaId)) return false;
    this.perfil = 'crianca';
    this.criancaId = criancaId;
    this.guardar();
    return true;
  }

  trocarCrianca(criancaId: string): boolean {
    if (!dados.crianca(criancaId)) return false;
    this.criancaId = criancaId;
    this.guardar();
    return true;
  }

  sair(): void {
    this.perfil = null;
    this.criancaId = null;
    this.saindo = true;
    this.guardar();
  }

  /** Chamado depois de a navegação para a página de entrada terminar. */
  fimDaSaida(): void {
    this.saindo = false;
  }

  /** Verdadeiro quando o estado guardado no browser já foi lido. */
  get pronta(): boolean {
    return this.carregada;
  }
}

export const sessao = new Sessao();
