import type { Tema } from '#lib/data/tipos';

const CHAVE = 'palavra-viva:tema';

class TemaStore {
  valor = $state<Tema>('claro');
  iniciado = $state(false);

  iniciar(): void {
    if (typeof document === 'undefined' || this.iniciado) return;
    const atual = document.documentElement.dataset.tema;
    this.valor = atual === 'escuro' ? 'escuro' : 'claro';
    this.iniciado = true;

    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const aoMudar = (evento: MediaQueryListEvent) => {
      try {
        if (localStorage.getItem(CHAVE)) return;
      } catch {
        // Sem persistência: segue o sistema.
      }
      this.aplicar(evento.matches ? 'escuro' : 'claro', false);
    };
    media.addEventListener?.('change', aoMudar);
  }

  aplicar(valor: Tema, persistir = true): void {
    this.valor = valor;
    document.documentElement.dataset.tema = valor;
    document.documentElement.style.colorScheme = valor === 'escuro' ? 'dark' : 'light';
    if (persistir) {
      try {
        localStorage.setItem(CHAVE, valor);
      } catch {
        // A preferência fica apenas para esta sessão.
      }
    }
  }

  alternar(): void {
    this.aplicar(this.valor === 'claro' ? 'escuro' : 'claro');
  }
}

export const tema = new TemaStore();
