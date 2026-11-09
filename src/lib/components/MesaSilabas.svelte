<script lang="ts">
  import { audioDaSilaba, fonteDaSilaba, obterPalavra } from '#lib/data/palavras';
  import { tocarAudio } from '#lib/utils/audio';
  import BotaoAudio from './BotaoAudio.svelte';
  import Icone from './Icone.svelte';
  import Ilustracao from './Ilustracao.svelte';

  type Alvo = {
    id: string;
    distratores: string[];
  };

  type Chip = {
    id: string;
    texto: string;
    audio: string;
    origemId: string;
    indice: number;
  };

  const alvos: Alvo[] = [
    { id: 'menina', distratores: ['sa', 'to'] },
    { id: 'mesa', distratores: ['pa', 'to'] },
    { id: 'pato', distratores: ['me', 'na'] }
  ];

  function baralhar<T>(itens: T[], seed: string): T[] {
    let h = 2166136261;
    for (let i = 0; i < seed.length; i += 1) {
      h ^= seed.charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
    const rnd = () => {
      h += 0x6d2b79f5;
      let t = h;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
    const copia = [...itens];
    for (let i = copia.length - 1; i > 0; i -= 1) {
      const j = Math.floor(rnd() * (i + 1));
      [copia[i], copia[j]] = [copia[j], copia[i]];
    }
    return copia;
  }

  function criarChips(alvoId: string): Chip[] {
    const alvo = alvos.find((a) => a.id === alvoId) ?? alvos[0];
    const palavra = obterPalavra(alvo.id);
    const corretas: Chip[] = palavra.silabas.map((silaba, indice) => ({
      id: `${alvo.id}-${indice}`,
      texto: silaba,
      audio: audioDaSilaba(alvo.id, indice),
      origemId: alvo.id,
      indice
    }));
    const extras: Chip[] = alvo.distratores.map((silaba, indice) => {
      const fonte = fonteDaSilaba(silaba);
      return {
        id: `extra-${alvo.id}-${indice}`,
        texto: silaba,
        audio: fonte.audio,
        origemId: fonte.palavraId,
        indice: fonte.indice
      };
    });
    return baralhar([...corretas, ...extras], `mesa-${alvo.id}`);
  }

  let alvoId = $state('menina');
  let chips = $state(criarChips('menina'));
  let escolhidas = $state<string[]>([]);
  let erro = $state(false);
  let sucesso = $state(false);

  const palavra = $derived(obterPalavra(alvoId));
  const completo = $derived(escolhidas.length === palavra.silabas.length);

  function textoDoChip(id: string): string {
    return chips.find((c) => c.id === id)?.texto ?? '';
  }

  function usada(id: string): boolean {
    return escolhidas.includes(id);
  }

  function escolherAlvo(id: string) {
    if (id === alvoId) return;
    alvoId = id;
    chips = criarChips(id);
    escolhidas = [];
    erro = false;
    sucesso = false;
  }

  function adicionar(chip: Chip) {
    if (sucesso || completo || usada(chip.id)) return;
    erro = false;
    const novas = [...escolhidas, chip.id];
    escolhidas = novas;
    void tocarAudio(chip.audio);
    if (novas.length === palavra.silabas.length) {
      const construida = novas.map((id) => textoDoChip(id)).join('');
      if (construida === palavra.silabas.join('')) {
        sucesso = true;
        erro = false;
        void tocarAudio(palavra.audio);
      } else {
        erro = true;
      }
    }
  }

  function remover(indice: number) {
    if (sucesso) return;
    escolhidas = escolhidas.filter((_, i) => i !== indice);
    erro = false;
  }

  function limpar() {
    escolhidas = [];
    erro = false;
    sucesso = false;
  }
</script>

<section class="mesa ficha ficha--sombra" aria-labelledby="mesa-titulo">
  <div class="ficha__topo">
    <span id="mesa-titulo">Oficina de sílabas</span>
    <span class="etiqueta etiqueta--neutra">experimenta</span>
  </div>

  <div class="mesa__corpo">
    <div class="palco">
      <div class="alvos" role="group" aria-label="Escolhe a imagem da palavra que queres construir">
        {#each alvos as alvo}
          {@const p = obterPalavra(alvo.id)}
          <button
            type="button"
            class="alvo"
            class:ativo={alvo.id === alvoId}
            aria-pressed={alvo.id === alvoId}
            aria-label="Construir a palavra da imagem: {p.alt}"
            onclick={() => escolherAlvo(alvo.id)}
          >
            <Ilustracao palavra={p} />
          </button>
        {/each}
      </div>

      <div class="imagem-grande" class:sucesso>
        <Ilustracao palavra={palavra} prioridade />
      </div>

      <p class="alvo-texto">Constrói a palavra desta imagem.</p>
    </div>

    <div class="jogo">
      <p class="instrucao">Toca nas sílabas por ordem. Cada toque deixa ouvir a parte.</p>

      <div class="slots" role="group" aria-label="Sílabas escolhidas">
        {#each palavra.silabas as _, indice}
          {#if escolhidas[indice]}
            <button
              type="button"
              class="slot preenchido"
              class:sucesso
              aria-label="Remover a sílaba {textoDoChip(escolhidas[indice])}"
              onclick={() => remover(indice)}
            >
              {textoDoChip(escolhidas[indice])}
            </button>
          {:else}
            <span class="slot" aria-hidden="true">?</span>
          {/if}
        {/each}
      </div>

      <div class="chips">
        {#each chips as chip}
          <button
            type="button"
            class="chip"
            disabled={usada(chip.id) || completo || sucesso}
            aria-label="Sílaba {chip.texto}"
            onclick={() => adicionar(chip)}
          >
            {chip.texto}
          </button>
        {/each}
      </div>

      <div class="feedback" aria-live="polite">
        {#if sucesso}
          <p class="certo"><Icone nome="check-circulo" tamanho={20} /> Conseguiste: <strong>{palavra.palavra}</strong>.</p>
          <div class="linha">
            <BotaoAudio src={palavra.audio} rotulo="Ouvir a palavra" tamanho="pequeno" />
            <button type="button" class="botao botao--fantasma botao--pequeno" onclick={limpar}>Construir outra vez</button>
          </div>
        {:else if erro}
          <p class="errado"><Icone nome="alerta" tamanho={19} /> Ainda não. A palavra começa por «{palavra.silabas[0]}». Remove uma sílaba e tenta outra ordem.</p>
        {:else}
          <p class="dica">Podes ouvir cada sílaba antes de a colocar.</p>
        {/if}
      </div>

      {#if escolhidas.length > 0 && !sucesso}
        <button type="button" class="limpar" onclick={limpar}>Limpar as sílabas</button>
      {/if}
    </div>
  </div>
</section>

<style>
  .mesa {
    overflow: hidden;
    rotate: 1.1deg;
  }

  .mesa__corpo {
    display: grid;
    grid-template-columns: minmax(0, 0.9fr) minmax(0, 1.1fr);
    gap: 0;
  }

  .palco {
    display: flex;
    flex-direction: column;
    gap: 0.7rem;
    padding: 0.9rem;
    border-right: 2px solid var(--linha-ficha);
    background: color-mix(in srgb, var(--sol) 15%, var(--papel-ficha));
  }

  .alvos {
    display: flex;
    gap: 0.4rem;
  }

  .alvo {
    flex: 1;
    min-width: 0;
    padding: 0.2rem;
    border: 2px solid transparent;
    border-radius: 5px;
    background: var(--papel-ficha);
    cursor: pointer;
    transition: border-color var(--transicao), background-color var(--transicao);
  }

  .alvo :global(img) {
    width: 100%;
    height: 3.1rem;
    object-fit: contain;
  }

  .alvo:hover {
    border-color: var(--cobalto);
  }

  .alvo.ativo {
    border-color: var(--tinta-ficha);
    background: var(--sol);
  }

  .imagem-grande {
    display: grid;
    place-items: center;
    min-height: 12.5rem;
    padding: 0.8rem;
    border: 2px solid var(--linha-ficha);
    border-radius: 6px;
    background: var(--papel-ficha);
    transition: background-color var(--transicao), border-color var(--transicao);
  }

  .imagem-grande.sucesso {
    border-color: var(--sucesso);
    background: var(--verde-fundo);
  }

  .imagem-grande :global(img) {
    width: min(100%, 13rem);
    height: auto;
  }

  .alvo-texto {
    margin: 0;
    color: var(--tinta-ficha);
    font-size: var(--texto-s);
    font-weight: 700;
    text-align: center;
  }

  .jogo {
    display: flex;
    flex-direction: column;
    gap: 0.8rem;
    padding: 1rem;
  }

  .instrucao {
    margin: 0;
    color: var(--tinta-suave);
    font-size: var(--texto-s);
    line-height: 1.4;
  }

  .slots {
    display: flex;
    flex-wrap: wrap;
    gap: 0.45rem;
    min-height: 3.6rem;
  }

  .slot {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 3.5rem;
    min-height: 3.5rem;
    padding: 0.2rem 0.55rem;
    border: 2px dashed var(--linha-ficha);
    border-radius: 6px;
    background: transparent;
    color: var(--tinta-ficha);
    font-family: var(--fonte-titulo);
    font-size: 1.65rem;
    font-weight: 700;
    line-height: 1;
  }

  .slot.preenchido {
    border-style: solid;
    border-color: var(--cobalto);
    background: var(--cobalto-fundo);
    color: var(--link-ficha);
    cursor: pointer;
    animation: encaixar 220ms ease both;
  }

  .slot.preenchido.sucesso {
    border-color: var(--sucesso);
    background: var(--verde-fundo);
    color: var(--sucesso);
  }

  .chips {
    display: flex;
    flex-wrap: wrap;
    gap: 0.45rem;
  }

  .chip {
    min-width: 3.3rem;
    min-height: 2.8rem;
    padding: 0.35rem 0.7rem;
    border: 2px solid var(--tinta-ficha);
    border-radius: var(--raio-pill);
    background: var(--papel-ficha);
    color: var(--tinta-ficha);
    box-shadow: 2px 2px 0 var(--tinta-ficha);
    font-family: var(--fonte-titulo);
    font-size: 1.25rem;
    font-weight: 700;
    line-height: 1;
    cursor: pointer;
    transition: background-color var(--transicao), transform var(--transicao), box-shadow var(--transicao);
  }

  .chip:hover:not(:disabled) {
    background: var(--sol);
    transform: translate(-1px, -1px);
    box-shadow: 3px 3px 0 var(--tinta-ficha);
  }

  .chip:disabled {
    cursor: default;
    opacity: 0.28;
    box-shadow: none;
  }

  .feedback {
    min-height: 2.5rem;
    font-size: var(--texto-s);
    line-height: 1.4;
  }

  .feedback p {
    margin: 0 0 0.4rem;
  }

  .certo {
    color: var(--sucesso);
    font-weight: 700;
  }

  .errado {
    color: var(--erro);
    font-weight: 700;
  }

  .dica {
    color: var(--tinta-fraca);
  }

  .certo :global(svg),
  .errado :global(svg) {
    display: inline-block;
    vertical-align: -0.2em;
    margin-right: 0.25rem;
  }

  .limpar {
    align-self: flex-start;
    padding: 0;
    border: 0;
    background: transparent;
    color: var(--link-ficha);
    font-size: var(--texto-s);
    font-weight: 700;
    text-decoration: underline;
    text-underline-offset: 3px;
    cursor: pointer;
  }

  @media (max-width: 620px) {
    .mesa {
      rotate: 0deg;
    }

    .mesa__corpo {
      grid-template-columns: 1fr;
    }

    .palco {
      border-right: 0;
      border-bottom: 2px solid var(--linha-ficha);
    }

    .imagem-grande {
      min-height: 9rem;
    }

    .imagem-grande :global(img) {
      width: min(100%, 9rem);
    }
  }
</style>
