<script lang="ts">
  import { FASES, NOMES_FASE, type Fase } from '#lib/data/tipos';
  import Icone from './Icone.svelte';

  let {
    faseAtual,
    compacta = false
  }: { faseAtual: Fase; compacta?: boolean } = $props();

  const estado = (numero: Fase): 'feita' | 'atual' | 'por-fazer' =>
    numero < faseAtual ? 'feita' : numero === faseAtual ? 'atual' : 'por-fazer';
</script>

<ol class="linha" class:compacta aria-label="Percurso pelas seis fases">
  {#each FASES as fase (fase.numero)}
    <li class="ponto" class:feita={estado(fase.numero) === 'feita'} class:atual={estado(fase.numero) === 'atual'}>
      <span class="marcador" aria-hidden="true">
        {#if estado(fase.numero) === 'feita'}
          <Icone nome="check" tamanho={compacta ? 13 : 16} traco={3} />
        {:else}
          {fase.numero}
        {/if}
      </span>
      <span class="rotulo">
        <strong>Fase {fase.numero}</strong>
        <span>{NOMES_FASE[fase.numero]}</span>
      </span>
    </li>
  {/each}
</ol>

<style>
  .linha {
    display: grid;
    grid-template-columns: repeat(6, minmax(0, 1fr));
    gap: 0.3rem;
    margin: 0;
    padding: 0;
    list-style: none;
  }

  .ponto {
    position: relative;
    display: grid;
    justify-items: center;
    gap: 0.45rem;
    padding-top: 0.2rem;
    text-align: center;
  }

  /* A linha liga os marcadores e fica por baixo deles. */
  .ponto::before {
    content: '';
    position: absolute;
    top: 1.4rem;
    left: -50%;
    width: 100%;
    height: 3px;
    background: var(--linha);
  }

  .ponto:first-child::before {
    display: none;
  }

  .ponto.feita::before,
  .ponto.atual::before {
    background: var(--cobalto);
  }

  .marcador {
    position: relative;
    z-index: 1;
    display: grid;
    place-items: center;
    width: 2.4rem;
    height: 2.4rem;
    border: 2px solid var(--linha-forte);
    border-radius: var(--raio-circulo);
    background: var(--papel-alto);
    color: var(--tinta-suave);
    font-family: var(--fonte-titulo);
    font-size: var(--texto-s);
    font-weight: 800;
  }

  .feita .marcador {
    border-color: var(--cobalto);
    background: var(--cobalto);
    color: var(--sobre-acento);
  }

  .atual .marcador {
    border-color: var(--coral);
    background: var(--coral-fundo);
    color: var(--coral-texto);
    box-shadow: 0 0 0 4px var(--papel-alto), 0 0 0 6px var(--coral);
  }

  .rotulo {
    display: grid;
    gap: 0.05rem;
    font-size: var(--texto-mini);
    line-height: 1.3;
  }

  .rotulo strong {
    color: var(--tinta);
  }

  .rotulo span {
    color: var(--tinta-fraca);
  }

  .atual .rotulo strong {
    color: var(--coral-texto);
  }

  .compacta .marcador {
    width: 1.9rem;
    height: 1.9rem;
  }

  .compacta .rotulo span {
    display: none;
  }

  .compacta .ponto::before {
    top: 1.15rem;
  }

  @media (max-width: 620px) {
    .rotulo span {
      display: none;
    }

    .marcador {
      width: 2rem;
      height: 2rem;
    }

    .ponto::before {
      top: 1.2rem;
    }
  }
</style>
