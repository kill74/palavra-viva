import adapterEstatico from '@sveltejs/adapter-static';
import adaptadorNode from '@sveltejs/adapter-node';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

// GitHub Pages serve os project sites em /<repositório>/. O build de produção
// define BASE_PATH; em desenvolvimento e no preview local fica vazio.
const ambiente = (globalThis as { process?: { env?: Record<string, string | undefined> } }).process?.env;
const base = (ambiente?.BASE_PATH ?? '') as '' | `/${string}`;
const servidor = ambiente?.MODO_SERVIDOR === '1';

export default defineConfig({
  plugins: [
    sveltekit({
      paths: { base },
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
