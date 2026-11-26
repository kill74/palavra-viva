// See https://svelte.dev/docs/kit/types#app.d.ts
declare global {
  namespace App {
    // interface Error {}
    interface Locals {
      utilizador: {
        id: string;
        email: string;
        nome: string;
        papel: 'professora' | 'crianca';
        criadoEm: string;
      } | null;
    }
    // interface PageData {}
    // interface PageState {}
    // interface Platform {}
  }
}

export {};
