const dataCurtaFmt = new Intl.DateTimeFormat('pt-PT', {
  day: '2-digit',
  month: 'short'
});

const dataLongaFmt = new Intl.DateTimeFormat('pt-PT', {
  day: 'numeric',
  month: 'long',
  year: 'numeric'
});

const horaFmt = new Intl.DateTimeFormat('pt-PT', {
  hour: '2-digit',
  minute: '2-digit'
});

export function dataCurta(iso: string): string {
  return dataCurtaFmt.format(new Date(iso));
}

export function dataLonga(iso: string): string {
  return dataLongaFmt.format(new Date(iso));
}

export function hora(iso: string): string {
  return horaFmt.format(new Date(iso));
}

export function duracao(ms: number): string {
  const segundos = Math.round(ms / 1000);
  if (segundos < 60) return `${segundos} s`;
  const minutos = Math.floor(segundos / 60);
  const resto = segundos % 60;
  return resto ? `${minutos} min ${resto} s` : `${minutos} min`;
}

export function plural(n: number, singular: string, pluralForma: string): string {
  return n === 1 ? singular : pluralForma;
}

export function percentagem(parte: number, total: number): number {
  if (!total) return 0;
  return Math.round((parte / total) * 100);
}

export function idCurto(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID().slice(0, 8);
  }
  return Math.random().toString(36).slice(2, 10);
}

export function ordenarPorData<T extends { fim?: string; criadoEm?: string }>(itens: T[]): T[] {
  return [...itens].sort((a, b) =>
    (b.fim ?? b.criadoEm ?? '').localeCompare(a.fim ?? a.criadoEm ?? '')
  );
}

export function csv(linhas: Array<Array<string | number>>): string {
  return linhas
    .map((linha) =>
      linha
        .map((campo) => {
          const texto = String(campo).replace(/"/g, '""');
          return /[",\n;]/.test(texto) ? `"${texto}"` : texto;
        })
        .join(';')
    )
    .join('\n');
}

export function descarregar(nome: string, conteudo: string, tipo = 'text/csv;charset=utf-8'): void {
  const blob = new Blob([`\uFEFF${conteudo}`], { type: tipo });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = nome;
  a.click();
  URL.revokeObjectURL(url);
}
