import { ESCRITAS_DEMO, RECURSOS_DEMO, SESSOES_DEMO, TURMA } from '#lib/data/demo';
import { comValidacao } from '#lib/utils/validacao';
import type { EstadoDados, Repositorio } from './tipo';

const CHAVE = 'palavra-viva:dados:v1';

function estadoInicial(): EstadoDados {
  return {
    versao: 1,
    criancas: structuredClone(TURMA),
    recursos: structuredClone(RECURSOS_DEMO),
    sessoes: structuredClone(SESSOES_DEMO),
    escritas: structuredClone(ESCRITAS_DEMO)
  };
}

export class RepositorioLocal implements Repositorio {
  async carregar(): Promise<EstadoDados> {
    if (typeof localStorage === 'undefined') return estadoInicial();
    try {
      const bruto = localStorage.getItem(CHAVE);
      if (!bruto) return estadoInicial();
      const dados = JSON.parse(bruto) as Partial<EstadoDados>;
      return {
        versao: 1,
        criancas: Array.isArray(dados.criancas) && dados.criancas.length > 0
          ? dados.criancas
          : estadoInicial().criancas,
        recursos: Array.isArray(dados.recursos)
          ? dados.recursos.map((r) => comValidacao(r))
          : [],
        sessoes: Array.isArray(dados.sessoes) ? dados.sessoes : [],
        escritas: Array.isArray(dados.escritas) ? dados.escritas : []
      };
    } catch {
      return estadoInicial();
    }
  }

  async guardar(estado: EstadoDados): Promise<void> {
    if (typeof localStorage === 'undefined') return;
    try {
      localStorage.setItem(CHAVE, JSON.stringify(estado));
    } catch {
      // Sem persistência: a aplicação continua em memória.
    }
  }

  async repor(estado: EstadoDados): Promise<void> {
    await this.guardar(estado);
  }
}
