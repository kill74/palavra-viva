<script lang="ts">
  import type { Palavra } from '#lib/data/palavras';
  import BotaoAudio from './BotaoAudio.svelte';
  import Ilustracao from './Ilustracao.svelte';

  let {
    palavra,
    etiqueta,
    mostrarSilabas = true,
    mostrarFrase = false,
    comAudio = true,
    compacta = false,
    prioridade = false,
    aoOuvir
  }: {
    palavra: Palavra;
    etiqueta?: string;
    mostrarSilabas?: boolean;
    mostrarFrase?: boolean;
    comAudio?: boolean;
    compacta?: boolean;
    prioridade?: boolean;
    aoOuvir?: () => void;
  } = $props();
</script>

<article class="ficha palavra-ficha" class:compacta>
  <div class="ficha__topo">
    <span>{etiqueta ?? (palavra.nuclear ? `Sequência ${palavra.ordem} de 28` : 'Palavra derivada')}</span>
    {#if mostrarSilabas}
      <span class="etiqueta etiqueta--neutra">{palavra.silabas.length} {palavra.silabas.length === 1 ? 'sílaba' : 'sílabas'}</span>
    {/if}
  </div>
  <div class="corpo">
    <div class="imagem">
      <Ilustracao {palavra} {prioridade} />
    </div>
    <p class="palavra" lang="pt-PT">{palavra.palavra}</p>
    {#if mostrarSilabas}
      <p class="silabas" aria-label="Sílabas: {palavra.silabas.join(', ')}">
        {#each palavra.silabas as silaba, indice}
          <span class="silaba">{silaba}</span>{#if indice < palavra.silabas.length - 1}<span class="mais" aria-hidden="true">+</span>{/if}
        {/each}
      </p>
    {/if}
    {#if comAudio}
      <BotaoAudio
        src={palavra.audio}
        rotulo="Ouvir a palavra"
        rotuloAria="Ouvir a palavra {palavra.palavra}"
        tamanho={compacta ? 'pequeno' : 'normal'}
        aoTocar={aoOuvir}
      />
    {/if}
    {#if mostrarFrase}
      <p class="frase">«{palavra.frase}»</p>
    {/if}
  </div>
</article>

<style>
  .palavra-ficha {
    overflow: hidden;
  }

  .corpo {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.7rem;
    padding: 1rem 1rem 1.2rem;
    text-align: center;
  }

  .imagem {
    width: min(100%, 15rem);
    padding: 0.4rem;
    border-radius: 50%;
    background: color-mix(in srgb, var(--sol) 24%, var(--papel-ficha));
  }

  .palavra {
    margin: 0;
    color: var(--tinta-ficha);
    font-family: var(--fonte-titulo);
    font-size: clamp(2.2rem, 1.4rem + 3vw, 3.6rem);
    font-weight: 700;
    letter-spacing: -0.05em;
    line-height: 1;
  }

  .silabas {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    align-items: center;
    gap: 0.35rem;
    margin: 0;
  }

  .silaba {
    padding: 0.18rem 0.55rem;
    border: 1.5px solid var(--cobalto);
    border-radius: var(--raio-pill);
    background: var(--cobalto-fundo);
    color: var(--link-ficha);
    font-size: var(--texto-s);
    font-weight: 700;
    line-height: 1.3;
  }

  .mais {
    color: var(--tinta-fraca);
    font-size: var(--texto-xs);
    font-weight: 700;
  }

  .frase {
    margin: 0;
    max-width: 30ch;
    color: var(--tinta-suave);
    font-size: var(--texto-s);
    line-height: 1.5;
  }

  .compacta .corpo {
    padding: 0.75rem;
    gap: 0.5rem;
  }

  .compacta .imagem {
    width: min(100%, 9rem);
  }

  .compacta .palavra {
    font-size: clamp(1.7rem, 1.2rem + 2vw, 2.5rem);
  }

  .compacta .frase {
    display: none;
  }
</style>
