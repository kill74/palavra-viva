<script lang="ts">
  import type { Snippet } from 'svelte';
  import Icone from './Icone.svelte';

  let {
    titulo,
    texto,
    icone = 'livro',
    children
  }: {
    titulo: string;
    texto: string;
    icone?: 'livro' | 'lupa' | 'crianca' | 'professor';
    children?: Snippet;
  } = $props();
</script>

<div class="vazio">
  <span class="vazio__icone" aria-hidden="true"><Icone nome={icone} tamanho={30} /></span>
  <h3>{titulo}</h3>
  <p>{texto}</p>
  {#if children}
    <div class="vazio__acao">{@render children()}</div>
  {/if}
</div>

<style>
  .vazio {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
    padding: clamp(1.2rem, 3vw, 2rem);
    border: 2px dashed var(--linha-forte);
    border-radius: var(--raio-ficha);
    background: var(--papel-alto);
  }

  .vazio__icone {
    display: grid;
    place-items: center;
    width: 3rem;
    height: 3rem;
    border: 1.5px solid var(--linha);
    border-radius: 50%;
    color: var(--cobalto);
    background: var(--cobalto-fundo);
  }

  h3 {
    margin: 0;
    font-size: var(--texto-l);
  }

  p {
    max-width: 52ch;
    margin: 0;
    color: var(--tinta-suave);
    font-size: var(--texto-s);
    line-height: 1.5;
  }

  .vazio__acao {
    margin-top: 0.5rem;
  }
</style>
