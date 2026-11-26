<script lang="ts">
  import { resolve } from '$app/paths';
  import { afterNavigate, goto } from '$app/navigation';
  import { page } from '$app/state';
  import { tema } from '#lib/stores/tema.svelte';
  import { sessao } from '#lib/stores/sessao.svelte';
  import { MODO_SERVIDOR } from '#lib/ambiente';
  import { dados } from '#lib/stores/dados.svelte';
  import { onMount } from 'svelte';
  import Icone from './Icone.svelte';
  import Marca from './Marca.svelte';

  let menuAberto = $state(false);
  let botaoMenu = $state<HTMLButtonElement>();

  const ligacoes = [
    { href: resolve('/'), caminho: '/', texto: 'Início' },
    { href: resolve('/metodo'), caminho: '/metodo', texto: 'Método' }
  ];

  const criancaAtiva = $derived(
    sessao.criancaId ? dados.crianca(sessao.criancaId) : undefined
  );

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

  function sair() {
    sessao.sair();
    void goto(resolve('/entrar'));
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
      {#if sessao.perfil === 'professor'}
        <div class="identidade">
          <span class="identidade__selo identidade__selo--professor">
            <Icone nome="professor" tamanho={17} /> <span>Professora</span>
          </span>
          <a class="sair" href={resolve('/professor')} title="Abrir o painel da turma">
            A minha área
          </a>
          {#if MODO_SERVIDOR}
            <form method="POST" action="/sair"><button type="submit" class="sair">Sair</button></form>
          {:else}
            <button type="button" class="sair" title="Terminar a sessão" onclick={sair}>Sair</button>
          {/if}
        </div>
      {:else if sessao.perfil === 'crianca' && criancaAtiva}
        <div class="identidade">
          <span class="identidade__selo identidade__selo--crianca">
            <Icone nome="crianca" tamanho={17} /> <span>{criancaAtiva.nome}</span>
          </span>
          <a class="sair" href={resolve('/crianca') + '?escolher=1'} title="Escolher outra criança">
            Mudar
          </a>
          <button type="button" class="sair" title="Terminar a sessão" onclick={sair}>
            Sair
          </button>
        </div>
      {:else}
        <a class="entrar-link" href={resolve('/entrar')}>
          <Icone nome="seta" tamanho={16} /> Entrar
        </a>
      {/if}

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
    background: var(--papel);
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
    border-radius: var(--raio-ficha);
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
    border-radius: var(--raio-ficha);
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

  .identidade {
    display: flex;
    align-items: center;
    gap: 0.3rem;
    margin-right: 0.25rem;
    padding-right: 0.55rem;
    border-right: 1.5px solid var(--linha);
  }

  .identidade__selo {
    display: inline-flex;
    align-items: center;
    gap: 0.35rem;
    min-height: 34px;
    padding: 0.2rem 0.55rem;
    border: 1.5px solid var(--linha-forte);
    border-radius: var(--raio-pill);
    font-size: var(--texto-s);
    font-weight: 700;
    white-space: nowrap;
  }

  .identidade__selo--professor {
    color: var(--cobalto);
    background: var(--cobalto-fundo);
  }

  .identidade__selo--crianca {
    /* --coral-texto-ficha tem 4,33:1 sobre o fundo coral; o erro dá >5:1. */
    color: var(--erro-ficha);
    background: var(--coral-fundo-ficha);
  }

  :global(html[data-tema='escuro']) .identidade__selo--professor {
    color: var(--tinta);
  }

  .sair {
    display: inline-flex;
    align-items: center;
    min-height: 44px;
    padding: 0.3rem 0.45rem;
    border: 0;
    border-radius: var(--raio-ficha);
    background: transparent;
    color: var(--tinta-suave);
    font-family: var(--fonte-texto);
    font-size: var(--texto-s);
    font-weight: 700;
    text-decoration: none;
    cursor: pointer;
    transition: background-color var(--transicao), color var(--transicao);
  }

  .sair:hover {
    background: var(--sol-fundo);
    color: var(--tinta);
    text-decoration: underline;
    text-underline-offset: 3px;
  }

  .entrar-link {
    display: inline-flex;
    align-items: center;
    gap: 0.4rem;
    min-height: 44px;
    padding: 0.35rem 0.9rem;
    border: 2px solid var(--cobalto);
    border-radius: var(--raio-pill);
    background: var(--cobalto);
    color: var(--sobre-acento);
    font-size: var(--texto-s);
    font-weight: 700;
    text-decoration: none;
    transition: background-color var(--transicao);
  }

  .entrar-link:hover {
    background: var(--cobalto-hover);
  }

  .tema,
  .menu-botao {
    display: inline-grid;
    place-items: center;
    width: 44px;
    height: 44px;
    border: 1.5px solid var(--linha-forte);
    border-radius: var(--raio-circulo);
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
    border-radius: var(--raio-ficha);
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

    .identidade {
      margin-right: 0;
      padding-right: 0.35rem;
    }

    .identidade__selo span {
      display: none;
    }

    .identidade__selo {
      padding: 0.2rem;
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
      font-size: var(--texto-destaque);
    }
  }
</style>
