<script lang="ts">
  import { conquistas } from '#lib/utils/recomendacao';
  import Icone from './Icone.svelte';

  let { sessoes, criancaId }: { sessoes: import('#lib/data/tipos').Sessao[]; criancaId: string } = $props();

  const lista = $derived(conquistas(sessoes, criancaId));
  const desbloqueadas = $derived(lista.filter((c) => c.desbloqueada).length);
  const comecou = $derived(sessoes.some((s) => s.criancaId === criancaId));
</script>

<section class="cantinho" aria-labelledby="conquistas-titulo">
  <div class="cabeca">
    <div>
      <p class="etiqueta"><Icone nome="escudo" tamanho={15} /> O meu cantinho</p>
      <h2 id="conquistas-titulo">
        {comecou ? 'Olha o que já consegues.' : 'A primeira conquista está à tua espera.'}
      </h2>
    </div>
    <p class="contador">{desbloqueadas} de {lista.length} conquistas</p>
  </div>

  {#if !comecou}
    <p class="incentivo">
      Ainda não fizeste uma sessão. Quando terminares a primeira atividade, as medalhas
      começam a aparecer aqui. Podes começar quando quiseres.
    </p>
  {/if}

  <ul class="medalhas">
    {#each lista as conquista (conquista.id)}
      <li class:desbloqueada={conquista.desbloqueada}>
        <span class="medalha" aria-hidden="true">
          <Icone nome={conquista.icon} tamanho={24} />
        </span>
        <span class="texto">
          <strong>{conquista.titulo}</strong>
          <small>{conquista.descricao}</small>
        </span>
        <span class="estado" aria-hidden="true">
          {#if conquista.desbloqueada}<Icone nome="check" tamanho={17} traco={3} />{/if}
        </span>
      </li>
    {/each}
  </ul>
</section>

<style>
  .cantinho {
    padding: clamp(1.1rem, 2.5vw, 1.7rem);
    border: 2px solid var(--linha-forte);
    border-radius: var(--raio-ficha);
    background: var(--papel-alto);
  }

  .cabeca {
    display: flex;
    flex-wrap: wrap;
    align-items: end;
    justify-content: space-between;
    gap: 0.6rem 1.5rem;
    margin-bottom: 1.2rem;
  }

  .etiqueta {
    display: inline-flex;
    align-items: center;
    gap: 0.35rem;
    margin: 0 0 0.35rem;
    color: var(--coral-texto);
    font-size: var(--texto-mini);
    font-weight: 700;
    letter-spacing: 0.04em;
    text-transform: uppercase;
  }

  h2 {
    margin: 0;
    font-size: var(--texto-xl);
    line-height: 1.15;
  }

  .contador {
    margin: 0;
    color: var(--tinta-fraca);
    font-size: var(--texto-s);
    font-weight: 700;
  }

  .incentivo {
    max-width: 60ch;
    margin: 0 0 1rem;
    color: var(--tinta-suave);
    font-size: var(--texto-s);
    line-height: 1.5;
  }

  .medalhas {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 0.6rem;
    margin: 0;
    padding: 0;
    list-style: none;
  }

  .medalhas li {
    display: grid;
    grid-template-columns: auto minmax(0, 1fr) auto;
    align-items: center;
    gap: 0.55rem;
    padding: 0.7rem;
    border: 1.5px dashed var(--linha);
    border-radius: var(--raio-ficha);
    background: var(--papel);
    opacity: 0.7;
  }

  .medalhas li.desbloqueada {
    border-style: solid;
    border-color: var(--sol);
    background: var(--sol-fundo);
    opacity: 1;
  }

  .medalha {
    display: grid;
    place-items: center;
    width: 2.6rem;
    height: 2.6rem;
    border: 1.5px solid var(--linha-forte);
    border-radius: var(--raio-circulo);
    background: var(--papel-alto);
    color: var(--tinta-suave);
  }

  .desbloqueada .medalha {
    border-color: var(--sol);
    background: var(--sol);
    color: var(--tinta-ficha);
  }

  .texto {
    display: grid;
    gap: 0.1rem;
    min-width: 0;
  }

  .texto strong {
    font-size: var(--texto-s);
    line-height: 1.25;
  }

  .texto small {
    color: var(--tinta-fraca);
    font-size: var(--texto-mini);
    line-height: 1.3;
  }

  .estado {
    color: var(--sucesso);
  }

  @media (max-width: 900px) {
    .medalhas {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
  }

  @media (max-width: 520px) {
    .medalhas {
      grid-template-columns: minmax(0, 1fr);
    }
  }
</style>
