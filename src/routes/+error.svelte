<script lang="ts">
  import { resolve } from '$app/paths';
  import { page } from '$app/state';
  import Icone from '#lib/components/Icone.svelte';

  const titulo = $derived(page.status === 404 ? 'Esta página não está no caderno.' : 'Alguma coisa saiu do lugar.');
</script>

<svelte:head>
  <title>{page.status} — Palavra Viva</title>
  <meta name="robots" content="noindex" />
</svelte:head>

<section class="erro">
  <div class="container erro__interior">
    <div class="erro__texto">
      <p class="erro__codigo">{page.status}</p>
      <h1>{titulo}</h1>
      <p>
        {#if page.status === 404}
          O endereço pode estar incompleto ou a página pode ter mudado de sítio. Volta ao início
          ou abre uma das áreas do protótipo.
        {:else}
          O pedido não pôde ser concluído. {page.error?.message ?? 'Tenta outra vez dentro de momentos.'}
        {/if}
      </p>
      <div class="erro__acoes">
        <a class="botao botao--primario" href={resolve('/')}><Icone nome="livro" tamanho={18} /> Voltar ao início</a>
        <a class="botao botao--secundario" href={resolve('/professor')}>Área do professor</a>
        <a class="botao botao--fantasma" href={resolve('/crianca')}>Área da criança</a>
      </div>
    </div>
    <div class="erro__ficha ficha" aria-hidden="true">
      <div class="ficha__topo">
        <span>Ficha perdida</span>
        <span class="etiqueta etiqueta--aviso">fora do caderno</span>
      </div>
      <div class="erro__corpo">
        <p class="erro__palavra">?</p>
        <p class="erro__silabas">?</p>
        <p class="erro__nota">Esta palavra ainda não foi encontrada.</p>
      </div>
    </div>
  </div>
</section>

<style>
  .erro {
    display: flex;
    align-items: center;
    min-height: 70vh;
    padding-block: clamp(2.5rem, 7vw, 6rem);
  }

  .erro__interior {
    display: grid;
    grid-template-columns: minmax(0, 1.05fr) minmax(0, 0.95fr);
    gap: clamp(1.5rem, 5vw, 5rem);
    align-items: center;
  }

  .erro__texto {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 0.8rem;
  }

  .erro__codigo {
    margin: 0;
    color: var(--coral-texto);
    font-family: var(--fonte-titulo);
    font-size: var(--display-s);
    font-weight: 700;
    line-height: 0.9;
  }

  .erro h1 {
    max-width: 16ch;
    margin: 0;
  }

  .erro__texto > p:not(.erro__codigo) {
    max-width: 48ch;
    margin: 0;
    color: var(--tinta-suave);
    font-size: var(--texto-l);
    line-height: 1.5;
  }

  .erro__acoes {
    display: flex;
    flex-wrap: wrap;
    gap: 0.6rem;
    margin-top: 0.4rem;
  }

  .erro__ficha {
    overflow: hidden;
    transform: rotate(-1.5deg);
    box-shadow: 8px 8px 0 var(--sombra-ficha);
  }

  .erro__corpo {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.3rem;
    padding: 2rem 1rem;
    text-align: center;
  }

  .erro__palavra {
    margin: 0;
    color: var(--tinta-ficha);
    font-family: var(--fonte-titulo);
    font-size: clamp(4rem, 3rem + 6vw, 8rem);
    font-weight: 700;
    line-height: 0.8;
  }

  .erro__silabas {
    margin: 0;
    color: var(--link-ficha);
    font-size: var(--texto-l);
    font-weight: 700;
  }

  .erro__nota {
    margin: 0.4rem 0 0;
    color: var(--tinta-fraca);
    font-size: var(--texto-s);
  }

  @media (max-width: 760px) {
    .erro__interior {
      grid-template-columns: 1fr;
    }

    .erro__ficha {
      max-width: 22rem;
      transform: none;
    }
  }
</style>
