/** Declarações mínimas para os módulos Deno usados apenas no servidor. */
declare namespace Deno {
  const env: {
    get(nome: string): string | undefined;
  };
}

interface ImportMeta {
  readonly dirname?: string;
}
