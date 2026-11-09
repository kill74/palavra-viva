<script lang="ts">
  import { PALAVRAS_NUCLEARES, type Palavra } from '#lib/data/palavras';
  import { dados } from '#lib/stores/dados.svelte';
  import BotaoAudio from './BotaoAudio.svelte';
  import FichaPalavra from './FichaPalavra.svelte';
  import Ilustracao from './Ilustracao.svelte';

  let dialogo = $state<HTMLDialogElement>();
  let selecionada = $state<Palavra>(PALAVRAS_NUCLEARES[0]);

  function trabalhada(palavra: Palavra): number {
    return dados.criancas.filter((c) => c.palavrasTrabalhadas.includes(palavra.id)).length;
  }

  function abrir(palavra: Palavra) {
    selecionada = palavra;
    if (!dialogo?.open) dialogo?.showModal();
  }

  function fechar() {
    dialogo?.close();
  }
</script>

<div class="mural">
  <p class="legenda">
    <span class="ponto" aria-hidden="true"></span>
    As palavras com ponto já foram trabalhadas por alguém desta turma fictícia. Toca para ver e ouvir.
  </p>

  <ul class="grelha">
    {#each PALAVRAS_NUCLEARES as palavra}
      <li>
        <button
          type="button"
          class="palavra superficie-ficha"
          class:trabalhada={trabalhada(palavra) > 0}
          aria-label="Abrir detalhes de {palavra.palavra}{trabalhada(palavra) > 0 ? ', já trabalhada' : ''}"
          onclick={() => abrir(palavra)}
        >
          <span class="ordem" aria-hidden="true">{String(palavra.ordem).padStart(2, '0')}</span>
          {#if trabalhada(palavra) > 0}
            <span class="marca-trabalhada" aria-hidden="true"></span>
          {/if}
          <span class="imagem"><Ilustracao palavra={palavra} /></span>
          <span class="texto">{palavra.palavra}</span>
        </button>
      </li>
    {/each}
  </ul>
</div>

<dialog
  bind:this={dialogo}
  class="detalhe superficie-ficha"
  aria-labelledby="detalhe-titulo"
  onclose={() => (selecionada = PALAVRAS_NUCLEARES[0])}
>
  <div class="detalhe__topo">
    <h3 id="detalhe-titulo">Uma palavra por dentro</h3>
    <form method="dialog">
      <button class="fechar" aria-label="Fechar os detalhes" type="submit">Fechar</button>
    </form>
  </div>

  <div class="detalhe__corpo">
    <FichaPalavra palavra={selecionada} mostrarFrase prioridade />
    <div class="detalhe__info">
      <p class="contagem">
        {#if trabalhada(selecionada) > 0}
          {trabalhada(selecionada)} {trabalhada(selecionada) === 1 ? 'criança já trabalhou' : 'crianças já trabalharam'} esta palavra.
        {:else}
          Ainda não foi trabalhada nesta turma.
        {/if}
      </p>
      <p class="nota">A ordem faz parte da sequência adotada; não é uma classificação.</p>
      <BotaoAudio
        src={selecionada.fraseAudio}
        rotulo="Ouvir a frase"
        rotuloAria="Ouvir a frase: {selecionada.frase}"
        variante="fantasma"
      />
      <button type="button" class="botao botao--secundario" onclick={fechar}>Voltar às 28 palavras</button>
    </div>
  </div>
</dialog>

<style>
  .mural {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .legenda {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin: 0;
    color: var(--tinta-suave);
    font-size: var(--texto-s);
  }

  .ponto {
    display: inline-block;
    width: 0.65rem;
    height: 0.65rem;
    flex: none;
    border-radius: 50%;
    background: var(--verde);
  }

  .grelha {
    display: grid;
    grid-template-columns: repeat(7, minmax(0, 1fr));
    gap: 0.55rem;
    margin: 0;
  }

  .grelha li {
    min-width: 0;
  }

  .palavra {
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.15rem;
    width: 100%;
    height: 100%;
    min-height: 8.2rem;
    padding: 1.25rem 0.35rem 0.55rem;
    border: 2px solid var(--linha-ficha);
    border-radius: var(--raio-ficha);
    background: var(--papel-ficha);
    color: var(--tinta-ficha);
    cursor: pointer;
    text-align: center;
    transition: transform var(--transicao), box-shadow var(--transicao), background-color var(--transicao);
  }

  .palavra:hover {
    z-index: 1;
    background: var(--sol-fundo);
    transform: translateY(-2px) rotate(-0.6deg);
    box-shadow: 4px 4px 0 var(--tinta-ficha);
  }

  .palavra.trabalhada {
    border-color: var(--verde);
  }

  .ordem {
    position: absolute;
    top: 0.3rem;
    left: 0.45rem;
    color: var(--tinta-fraca);
    font-size: 0.68rem;
    font-weight: 700;
    line-height: 1;
    font-variant-numeric: tabular-nums;
  }

  .marca-trabalhada {
    position: absolute;
    top: 0.38rem;
    right: 0.42rem;
    width: 0.55rem;
    height: 0.55rem;
    border-radius: 50%;
    background: var(--verde);
  }

  .imagem {
    position: relative;
    display: block;
    width: 100%;
    height: 4.5rem;
  }

  .imagem :global(img) {
    position: absolute;
    inset: 0;
    width: 100%;
    max-width: 100%;
    height: 100%;
    object-fit: contain;
  }

  .texto {
    font-family: var(--fonte-titulo);
    font-size: clamp(0.92rem, 0.7rem + 0.45vw, 1.18rem);
    font-weight: 700;
    letter-spacing: -0.02em;
    line-height: 1.05;
  }

  .detalhe {
    width: min(92vw, 44rem);
    max-height: 90vh;
    padding: 0;
    border: 2px solid var(--tinta-ficha);
    border-radius: 8px;
    background: var(--papel-ficha);
    color: var(--tinta-ficha);
    box-shadow: 12px 12px 0 rgba(0, 0, 0, 0.35);
  }

  .detalhe::backdrop {
    background: rgba(10, 18, 34, 0.62);
    backdrop-filter: blur(3px);
  }

  .detalhe__topo {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
    padding: 0.8rem 1rem;
    border-bottom: 2px solid var(--linha-ficha);
    background: var(--sol);
  }

  .detalhe__topo h3 {
    margin: 0;
    color: var(--tinta-ficha);
    font-size: 1.15rem;
    letter-spacing: -0.02em;
  }

  .fechar {
    min-height: 38px;
    padding: 0.35rem 0.7rem;
    border: 1.5px solid var(--tinta-ficha);
    border-radius: var(--raio-pill);
    background: var(--papel-ficha);
    color: var(--tinta-ficha);
    font-weight: 700;
    cursor: pointer;
  }

  .detalhe__corpo {
    display: grid;
    grid-template-columns: minmax(0, 1fr) minmax(0, 0.9fr);
    gap: 1.2rem;
    padding: 1rem;
    overflow-y: auto;
    max-height: calc(90vh - 4rem);
  }

  .detalhe__info {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 0.75rem;
    padding-top: 0.35rem;
  }

  .contagem {
    margin: 0;
    color: var(--tinta-ficha);
    font-weight: 700;
    line-height: 1.35;
  }

  .nota {
    margin: 0;
    color: var(--tinta-suave);
    font-size: var(--texto-s);
    line-height: 1.45;
  }

  @media (max-width: 900px) {
    .grelha {
      grid-template-columns: repeat(5, minmax(0, 1fr));
    }
  }

  @media (max-width: 680px) {
    .grelha {
      grid-template-columns: repeat(4, minmax(0, 1fr));
    }

    .detalhe__corpo {
      grid-template-columns: 1fr;
    }

    .palavra {
      min-height: 7.4rem;
    }

    .imagem {
      height: 3.8rem;
    }
  }

  @media (max-width: 460px) {
    .grelha {
      grid-template-columns: repeat(3, minmax(0, 1fr));
    }

    .palavra {
      min-height: 7rem;
      padding-inline: 0.25rem;
    }
  }

  @media (prefers-reduced-motion: no-preference) {
    .detalhe[open] {
      animation: abrir-dialogo 180ms ease both;
    }

    @keyframes abrir-dialogo {
      from { opacity: 0; transform: translateY(10px) scale(0.985); }
      to { opacity: 1; transform: translateY(0) scale(1); }
    }
  }
</style>
