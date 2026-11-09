<script lang="ts">
  import { afterNavigate, onNavigate } from '$app/navigation';
  import { navigating, page } from '$app/state';
  import Cabecalho from '#lib/components/Cabecalho.svelte';
  import Rodape from '#lib/components/Rodape.svelte';
  import { dados } from '#lib/stores/dados.svelte';
  import { onMount } from 'svelte';
  import '../app.css';

  let { children } = $props();

  onMount(() => dados.carregar());
  let principal = $state<HTMLElement>();

  const imersivo = $derived(page.url.pathname.startsWith('/crianca/sessao'));
  const carregando = $derived(Boolean(navigating.to));

  onNavigate((navigation) => {
    if (typeof document === 'undefined' || !document.startViewTransition) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    return new Promise<void>((resolve) => {
      document.startViewTransition(async () => {
        resolve();
        await navigation.complete;
      });
    });
  });

  afterNavigate(({ from }) => {
    if (!from) return;
    principal?.focus({ preventScroll: true });
  });
</script>

<a class="salto" href="#conteudo">Saltar para o conteúdo</a>

{#if carregando}
  <div class="progresso-navegacao" aria-hidden="true"><span></span></div>
{/if}

{#if !imersivo}
  <Cabecalho />
{/if}

<main id="conteudo" bind:this={principal} tabindex="-1" class:imersivo aria-busy={carregando}>
  {@render children()}
</main>

{#if !imersivo}
  <Rodape />
{/if}

<style>
  .progresso-navegacao {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    z-index: 60;
    height: 3px;
    overflow: hidden;
    background: var(--cobalto-fundo);
  }

  .progresso-navegacao span {
    display: block;
    width: 40%;
    height: 100%;
    background: var(--coral);
    animation: avancar 900ms ease-in-out infinite;
  }

  @keyframes avancar {
    from { transform: translateX(-100%); }
    to { transform: translateX(350%); }
  }

  @media (prefers-reduced-motion: reduce) {
    .progresso-navegacao span {
      animation: none;
      width: 100%;
      opacity: 0.5;
    }
  }
</style>

