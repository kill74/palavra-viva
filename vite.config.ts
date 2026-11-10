import adapter from '@sveltejs/adapter-static';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

// GitHub Pages serve os project sites em /<repositório>/. O build de produção
// define BASE_PATH; em desenvolvimento e no preview local fica vazio.
const ambiente = (globalThis as { process?: { env?: Record<string, string | undefined> } }).process?.env;
const base = (ambiente?.BASE_PATH ?? '') as '' | `/${string}`;

export default defineConfig({
  plugins: [
    sveltekit({
      paths: { base },
      adapter: adapter({
        pages: 'build',
        assets: 'build',
        fallback: '404.html',
        precompress: false,
        strict: true
      }),
      prerender: {
        entries: ['*'],
        handleHttpError: 'fail'
      }
    })
  ],
  build: {
    target: 'es2022'
  }
});
