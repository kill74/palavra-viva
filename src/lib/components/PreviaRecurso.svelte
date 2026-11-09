<script lang="ts">
  import { obterPalavra } from '#lib/data/palavras';
  import type { Recurso } from '#lib/data/tipos';
  import { NOMES_FASE, NOMES_TIPO } from '#lib/data/tipos';
  import BotaoAudio from './BotaoAudio.svelte';
  import FichaPalavra from './FichaPalavra.svelte';
  import Icone from './Icone.svelte';
  import Ilustracao from './Ilustracao.svelte';

  let { recurso }: { recurso: Recurso } = $props();

  const palavra = $derived(obterPalavra(recurso.palavraId));
  const imagens = $derived(recurso.opcoes.map((id) => obterPalavra(id)));
</script>

<section class="previa ficha" aria-label="Pré-visualização do recurso">
  <div class="ficha__topo">
    <span>Como a criança vai ver</span>
    <span class="etiqueta etiqueta--neutra">{NOMES_TIPO[recurso.tipo]}</span>
  </div>

  <div class="corpo">
    <p class="contexto">{NOMES_FASE[recurso.fase]} · {recurso.palavra}</p>

    {#if recurso.tipo === 'cartao'}
      <FichaPalavra palavra={palavra} mostrarFrase comAudio />
    {:else if recurso.tipo === 'reconhecimento'}
      <div class="prompt">
        {#if recurso.apoios.imagem}
          <div class="imagem"><Ilustracao {palavra} /></div>
        {/if}
        <p class="pergunta">Qual é a palavra escrita?</p>
        <div class="opcoes-letras">
          {#each recurso.opcoes as opcao}
            <span class="opcao-letra" class:certa={opcao === recurso.palavra}>{opcao}</span>
          {/each}
        </div>
        {#if recurso.apoios.silabas}
          <p class="silabas">{recurso.silabas.join(' · ')}</p>
        {/if}
        <p class="nota-audio"><Icone nome="som" tamanho={16} /> O áudio fica disponível depois da resposta.</p>
      </div>
    {:else if recurso.tipo === 'associacao'}
      <div class="prompt">
        <p class="palavra-alvo">{recurso.palavra}</p>
        {#if recurso.apoios.audio}
          <BotaoAudio src={palavra.audio} rotulo="Ouvir a palavra" rotuloAria="Ouvir a palavra {recurso.palavra}" />
        {/if}
        <p class="pergunta">Qual é a imagem?</p>
        <div class="opcoes-imagens">
          {#each imagens as opcao}
            <span class="opcao-imagem" class:certa={opcao.id === recurso.palavraId}>
              <Ilustracao palavra={opcao} />
            </span>
          {/each}
        </div>
      </div>
    {:else if recurso.tipo === 'silabas'}
      <div class="prompt">
        <div class="imagem"><Ilustracao {palavra} /></div>
        <p class="pergunta">Constrói a palavra com as sílabas.</p>
        <div class="slots">
          {#each recurso.silabas as _}<span>?</span>{/each}
        </div>
        <div class="chips">
          {#each [...recurso.silabas, ...recurso.opcoes] as silaba}
            <span>{silaba}</span>
          {/each}
        </div>
      </div>
    {:else if recurso.tipo === 'frase'}
      <div class="prompt">
        <p class="frase">«{recurso.frase}»</p>
        {#if recurso.apoios.audio}
          <BotaoAudio src={palavra.fraseAudio} rotulo="Ouvir a frase" rotuloAria="Ouvir a frase: {recurso.frase}" />
        {/if}
        <div class="opcoes-imagens">
          {#each imagens as opcao}
            <span class="opcao-imagem" class:certa={opcao.id === recurso.palavraId}>
              <Ilustracao palavra={opcao} />
            </span>
          {/each}
        </div>
      </div>
    {/if}
  </div>
</section>

<style>
  .previa {
    overflow: hidden;
  }

  .corpo {
    display: flex;
    flex-direction: column;
    gap: 0.65rem;
    padding: 0.9rem;
  }

  .contexto {
    margin: 0;
    color: var(--tinta-suave);
    font-size: var(--texto-s);
    font-weight: 700;
  }

  .prompt {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.6rem;
    text-align: center;
  }

  .imagem {
    width: min(100%, 11rem);
    padding: 0.35rem;
    border-radius: 50%;
    background: color-mix(in srgb, var(--sol) 24%, var(--papel-ficha));
  }

  .pergunta,
  .frase,
  .palavra-alvo {
    margin: 0;
    color: var(--tinta-ficha);
    font-family: var(--fonte-titulo);
    font-size: var(--texto-l);
    font-weight: 650;
    letter-spacing: -0.02em;
    line-height: 1.15;
  }

  .palavra-alvo {
    font-size: clamp(2rem, 1.3rem + 2vw, 2.8rem);
    letter-spacing: -0.04em;
  }

  .frase {
    max-width: 26ch;
    font-size: clamp(1.3rem, 1rem + 1vw, 1.7rem);
    line-height: 1.25;
  }

  .opcoes-letras {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 0.45rem;
    width: 100%;
  }

  .opcao-letra {
    padding: 0.55rem 0.9rem;
    border: 2px solid var(--linha-ficha);
    border-radius: 5px;
    background: var(--papel-ficha);
    color: var(--tinta-ficha);
    font-family: var(--fonte-titulo);
    font-size: 1.3rem;
    font-weight: 700;
  }

  .opcao-letra.certa {
    border-color: var(--verde);
    background: var(--verde-fundo);
  }

  .opcoes-imagens {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 0.45rem;
    width: 100%;
  }

  .opcao-imagem {
    display: grid;
    place-items: center;
    width: 5.5rem;
    height: 4.5rem;
    padding: 0.2rem;
    border: 2px solid var(--linha-ficha);
    border-radius: 5px;
    background: var(--papel-ficha);
  }

  .opcao-imagem.certa {
    border-color: var(--verde);
    background: var(--verde-fundo);
  }

  .silabas {
    margin: 0;
    color: var(--tinta-suave);
    font-size: var(--texto-s);
    font-weight: 700;
  }

  .nota-audio {
    display: flex;
    align-items: center;
    gap: 0.35rem;
    margin: 0;
    color: var(--tinta-fraca);
    font-size: var(--texto-xs);
  }

  .slots {
    display: flex;
    gap: 0.35rem;
  }

  .slots span {
    display: grid;
    place-items: center;
    width: 3rem;
    height: 3rem;
    border: 2px dashed var(--linha-ficha);
    border-radius: 5px;
    color: var(--tinta-fraca);
    font-weight: 700;
  }

  .chips {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 0.35rem;
  }

  .chips span {
    padding: 0.2rem 0.55rem;
    border: 1.5px solid var(--cobalto);
    border-radius: var(--raio-pill);
    background: var(--cobalto-fundo);
    color: var(--link-ficha);
    font-size: var(--texto-s);
    font-weight: 700;
  }
</style>
