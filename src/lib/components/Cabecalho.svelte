<script lang="ts">
  import { resolve } from '$app/paths';
  import { afterNavigate } from '$app/navigation';
  import { page } from '$app/state';
  import { tema } from '#lib/stores/tema.svelte';
  import { onMount } from 'svelte';
  import Icone from './Icone.svelte';
  import Marca from './Marca.svelte';

  let menuAberto = $state(false);
  let botaoMenu = $state<HTMLButtonElement>();

  const ligacoes = [
    { href: resolve('/'), caminho: '/', texto: 'Início' },
    { href: resolve('/metodo'), caminho: '/metodo', texto: 'Método' },
    { href: resolve('/professor'), caminho: '/professor', texto: 'Professor' },
    { href: resolve('/crianca'), caminho: '/crianca', texto: 'Criança' }
  ];

  onMount(() => tema.iniciar());
  afterNavigate(() => {
    menuAberto = false;
  });

  function ativo(caminho: string): boolean {
    const rota = page.route.id;
    if (!rota) return false;
    if (caminho === '/') return rota === '/';
    return rota === caminho || rota.startsWith(`${caminho}/`);
  }

  function fecharMenu() {
    menuAberto = false;
    botaoMenu?.focus();
  }
</script>

<svelte:window
  onkeydown={(e) => {
    if (e.key === 'Escape' && menuAberto) fecharMenu();
  }}
/>

<header class="cabecalho">
  <div class="container cabecalho__interior">
    <a class="marca-ligacao" href={resolve('/')} aria-label="Palavra Viva, página inicial">
      <Marca />
    </a>

    <nav class="navegacao" class:aberta={menuAberto} aria-label="Navegação principal">
      <ul>
        {#each ligacoes as ligacao}
          <li>
            <a
              href={ligacao.href}
              aria-current={ativo(ligacao.caminho) ? 'page' : undefined}
              onclick={() => (menuAberto = false)}
            >
              {ligacao.texto}
            </a>
          </li>
        {/each}
      </ul>
    </nav>

    <div class="acoes">
      <button
        type="button"
        class="tema"
        aria-label={tema.valor === 'escuro' ? 'Ativar modo claro' : 'Ativar modo escuro'}
        aria-pressed={tema.valor === 'escuro'}
        title={tema.valor === 'escuro' ? 'Modo claro' : 'Modo escuro'}
        onclick={() => tema.alternar()}
      >
        <Icone nome={tema.valor === 'escuro' ? 'sol' : 'lua'} tamanho={20} />
      </button>

      <button
        type="button"
        class="menu-botao"
        bind:this={botaoMenu}
        aria-expanded={menuAberto}
        aria-controls="menu-principal"
        aria-label={menuAberto ? 'Fechar menu' : 'Abrir menu'}
        onclick={() => (menuAberto = !menuAberto)}
      >
        <Icone nome={menuAberto ? 'fechar' : 'menu'} tamanho={22} />
      </button>
    </div>
  </div>

  {#if menuAberto}
    <div class="menu-mobile" id="menu-principal">
      <nav aria-label="Navegação principal no telemóvel">
        <ul>
          {#each ligacoes as ligacao}
            <li>
              <a
                href={ligacao.href}
                aria-current={ativo(ligacao.caminho) ? 'page' : undefined}
                onclick={() => (menuAberto = false)}
              >
                {ligacao.texto}
              </a>
            </li>
          {/each}
        </ul>
      </nav>
    </div>
  {/if}
</header>

<style>
  .cabecalho {
    position: sticky;
    top: 0;
    z-index: 30;
    border-bottom: 1.5px solid var(--linha);
    background: color-mix(in srgb, var(--papel) 94%, transparent);
    backdrop-filter: blur(12px);
  }

  .cabecalho__interior {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
    min-height: 4.6rem;
  }

  .marca-ligacao {
    display: inline-flex;
    align-items: center;
    text-decoration: none;
    border-radius: 4px;
  }

  .navegacao ul {
    display: flex;
    align-items: center;
    gap: 0.2rem;
    margin: 0;
  }

  .navegacao a {
    display: inline-flex;
    align-items: center;
    min-height: 44px;
    padding: 0.35rem 0.6rem;
    border-radius: 4px;
    color: var(--tinta);
    font-size: var(--texto-s);
    font-weight: 700;
    text-decoration: none;
    text-underline-offset: 4px;
    transition: background-color var(--transicao);
  }

  .navegacao a:hover {
    background: var(--sol-fundo);
    text-decoration: underline;
    text-decoration-thickness: 2px;
  }

  .navegacao a[aria-current='page'] {
    text-decoration: underline;
    text-decoration-color: var(--coral);
    text-decoration-thickness: 3px;
  }

  .acoes {
    display: flex;
    align-items: center;
    gap: 0.35rem;
  }

  .tema,
  .menu-botao {
    display: inline-grid;
    place-items: center;
    width: 44px;
    height: 44px;
    border: 1.5px solid var(--linha-forte);
    border-radius: 50%;
    background: transparent;
    color: var(--tinta);
    cursor: pointer;
    transition: background-color var(--transicao), color var(--transicao);
  }

  .tema:hover,
  .menu-botao:hover {
    background: var(--sol);
    color: var(--tinta-ficha);
    border-color: var(--tinta-ficha);
  }

  .menu-botao {
    display: none;
  }

  .menu-mobile {
    display: none;
    border-top: 1.5px solid var(--linha);
    background: var(--papel-alto);
    padding: 0.65rem 1rem 0.85rem;
  }

  .menu-mobile ul {
    display: flex;
    flex-direction: column;
    gap: 0.2rem;
    margin: 0;
  }

  .menu-mobile a {
    display: flex;
    align-items: center;
    min-height: 48px;
    padding: 0.4rem 0.6rem;
    border-radius: 4px;
    color: var(--tinta);
    font-weight: 700;
    text-decoration: none;
  }

  .menu-mobile a[aria-current='page'] {
    background: var(--sol-fundo);
    text-decoration: underline;
    text-decoration-thickness: 2px;
  }

  @media (max-width: 760px) {
    .navegacao {
      display: none;
    }

    .menu-botao {
      display: inline-grid;
    }

    .menu-mobile {
      display: block;
    }

    .cabecalho__interior {
      min-height: 4.1rem;
    }
  }

  @media (max-width: 380px) {
    .cabecalho :global(.marca__texto) {
      font-size: 1.15rem;
    }
  }
</style>
