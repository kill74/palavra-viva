<script lang="ts">
  import { afterNavigate, goto, onNavigate } from '$app/navigation';
  import { resolve } from '$app/paths';
  import { navigating, page } from '$app/state';
  import Cabecalho from '#lib/components/Cabecalho.svelte';
  import Rodape from '#lib/components/Rodape.svelte';
  import { dados } from '#lib/stores/dados.svelte';
  import { sessao } from '#lib/stores/sessao.svelte';
  import { onMount, untrack } from 'svelte';
  import '../app.css';

  let { children } = $props();

  onMount(() => {
    void dados.carregar().then(() => sessao.carregar());
  });
  let principal = $state<HTMLElement>();

  const imersivo = $derived(page.route.id?.startsWith('/crianca/sessao') ?? false);
  const carregando = $derived(Boolean(navigating.to));

  // Se a turma for reposta ou uma criança deixar de existir, a sessão não
  // pode ficar presa a um id órfão.
  $effect(() => {
    const ids = dados.criancas.map((c) => c.id).join('|');
    const atual = sessao.criancaId;
    if (atual && !ids.split('|').includes(atual)) {
      untrack(() => sessao.validarCrianca());
    }
  });

  /**
   * Guarda das áreas reservadas. Feita no cliente porque o site é
   * pré-renderizado: um redirect no servidor não teria a sessão do browser.
   * As páginas públicas ('/' e '/metodo') e '/entrar' ficam sempre abertas.
   */
  $effect(() => {
    if (!sessao.carregada || !page.route.id || carregando) return;

    const rota = page.route.id;
    const caminho = page.url.pathname + page.url.search;
    if (rota.startsWith('/entrar')) {
      if (sessao.saindo) sessao.fimDaSaida();
      return;
    }
    if (sessao.saindo) return;

    if (rota.startsWith('/perfil')) {
      if (sessao.perfil !== 'professor') {
        void goto(`${resolve('/entrar')}?perfil=professor&destino=${encodeURIComponent(caminho)}`, {
          replaceState: true
        });
      }
      return;
    }

    if (rota.startsWith('/professor')) {
      if (sessao.perfil !== 'professor') {
        void goto(`${resolve('/entrar')}?perfil=professor&destino=${encodeURIComponent(caminho)}`, {
          replaceState: true
        });
      }
      return;
    }

    if (rota.startsWith('/crianca')) {
      if (sessao.perfil !== 'crianca' || !sessao.criancaId) {
        void goto(`${resolve('/entrar')}?perfil=crianca&destino=${encodeURIComponent(caminho)}`, {
          replaceState: true
        });
      }
    }
  });

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

