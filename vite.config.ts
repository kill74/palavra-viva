import adapterEstatico from '@sveltejs/adapter-static';
import adaptadorNode from '@sveltejs/adapter-node';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

// GitHub Pages serve os project sites em /<repositório>/. O build de produção
// define BASE_PATH; em desenvolvimento e no preview local fica vazio.
const globais = globalThis as {
  process?: { env?: Record<string, string | undefined> };
  Deno?: { env?: { get(nome: string): string | undefined } };
};
const ambiente = globais.process?.env;
const valor = (nome: string) => ambiente?.[nome] ?? globais.Deno?.env?.get?.(nome);
const base = (valor('BASE_PATH') ?? '') as '' | `/${string}`;
const servidor = valor('MODO_SERVIDOR') === '1';

export default defineConfig({
  plugins: [
    sveltekit({
      paths: { base },
      // O SvelteKit gera nonces por pedido (e hashes no prerender) para os
      // scripts/estilos que ele próprio emite. Assim não precisamos de
      // 'unsafe-inline' na CSP.
      csp: {
        mode: 'auto',
        directives: {
          'default-src': ['self'],
          'script-src': ['self'],
          // 'unsafe-inline' apenas em style-src: vários componentes usam
          // estilos dinâmicos (larguras de barras, cores por criança) e o
          // svelte-announcer tem estilo inline. O Svelte escapa estes valores
          // e o risco de XSS via CSS é muito inferior ao de scripts, que
          // continuam protegidos por nonce.
          'style-src': ['self', 'unsafe-inline'],
          'img-src': ['self', 'data:'],
          'media-src': ['self'],
          'font-src': ['self'],
          'connect-src': ['self'],
          'frame-ancestors': ['none'],
          'base-uri': ['self'],
          'form-action': ['self']
        }
      },
      // `adapter-static` continua a gerar o site do GitHub Pages. Com
      // MODO_SERVIDOR=1 usamos `adapter-node` para a versão com base de dados.
      adapter: servidor
        ? adaptadorNode({ out: 'servidor' })
        : adapterEstatico({
            pages: 'build',
            assets: 'build',
            fallback: '404.html',
            precompress: false,
            strict: true
          }),
      prerender: servidor ? { entries: [] } : { entries: ['*'], handleHttpError: 'fail' }
    })
  ],
  define: {
    'import.meta.env.VITE_MODO_SERVIDOR': JSON.stringify(servidor ? '1' : '0')
  },
  build: {
    target: 'es2022'
  }
});
