<script lang="ts">
  import { tocarAudio } from '#lib/utils/audio';
  import Icone from './Icone.svelte';

  let {
    src,
    rotulo = 'Ouvir',
    rotuloAria,
    tamanho = 'normal',
    variante = 'ficha',
    mostrarTexto = true,
    desativado = false,
    motivo,
    aoTocar
  }: {
    src: string;
    rotulo?: string;
    rotuloAria?: string;
    tamanho?: 'pequeno' | 'normal' | 'grande';
    variante?: 'ficha' | 'fantasma' | 'solido';
    mostrarTexto?: boolean;
    desativado?: boolean;
    motivo?: string;
    aoTocar?: () => void;
  } = $props();

  let tocando = $state(false);
  let erro = $state(false);
  let temporizador: ReturnType<typeof setTimeout> | undefined;

  async function reproduzir() {
    if (desativado) return;
    erro = false;
    tocando = true;
    const ok = await tocarAudio(src);
    if (!ok) {
      tocando = false;
      erro = true;
      return;
    }
    aoTocar?.();
    clearTimeout(temporizador);
    temporizador = setTimeout(() => {
      tocando = false;
    }, 900);
  }
</script>

<span class="audio" class:com-texto={mostrarTexto}>
  <button
    type="button"
    class="audio__botao"
    class:pequeno={tamanho === 'pequeno'}
    class:grande={tamanho === 'grande'}
    class:fantasma={variante === 'fantasma'}
    class:solido={variante === 'solido'}
    class:tocando={tocando}
    aria-label={rotuloAria ?? (mostrarTexto ? undefined : rotulo)}
    aria-disabled={desativado}
    title={desativado ? motivo : rotulo}
    onclick={reproduzir}
  >
    <Icone nome="som" tamanho={tamanho === 'grande' ? 26 : 20} />
    {#if mostrarTexto}
      <span>{tocando ? 'A tocar…' : rotulo}</span>
    {/if}
  </button>
  {#if erro}
    <span class="audio__erro" role="status">O áudio não abriu. Tenta outra vez.</span>
  {/if}
</span>

<style>
  .audio {
    display: inline-flex;
    flex-direction: column;
    gap: 0.2rem;
    align-items: flex-start;
  }

  .audio__botao {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 0.45rem;
    min-height: 44px;
    padding: 0.5rem 0.85rem;
    border: 2px solid var(--tinta-ficha);
    border-radius: var(--raio-pill);
    background: var(--papel-ficha);
    color: var(--tinta-ficha);
    box-shadow: 2px 2px 0 var(--tinta-ficha);
    font-size: var(--texto-s);
    font-weight: 700;
    line-height: 1;
    cursor: pointer;
    transition:
      transform var(--transicao),
      box-shadow var(--transicao),
      background-color var(--transicao);
  }

  .audio__botao:hover:not([aria-disabled='true']) {
    background: var(--sol);
    transform: translate(-1px, -1px);
    box-shadow: 3px 3px 0 var(--tinta-ficha);
  }

  .audio__botao:active:not([aria-disabled='true']) {
    transform: translate(1px, 1px);
    box-shadow: 1px 1px 0 var(--tinta-ficha);
  }

  .audio__botao[aria-disabled='true'] {
    cursor: not-allowed;
    opacity: 0.45;
    box-shadow: none;
  }

  .audio__botao.pequeno {
    min-height: 36px;
    padding: 0.35rem 0.55rem;
    border-width: 1.5px;
    font-size: var(--texto-xs);
    box-shadow: none;
  }

  .audio__botao.grande {
    min-height: 56px;
    padding: 0.8rem 1.15rem;
    font-size: 1.12rem;
  }

  .audio__botao.fantasma {
    border-color: currentColor;
    background: transparent;
    color: var(--tinta);
    box-shadow: none;
  }

  .audio__botao.fantasma:hover:not([aria-disabled='true']) {
    background: var(--sol);
    color: var(--tinta-ficha);
    border-color: var(--tinta-ficha);
  }

  .audio__botao.solido {
    border-color: var(--tinta-ficha);
    background: var(--cobalto);
    color: #fff;
  }

  .audio__botao.tocando :global(svg) {
    animation: pulsar-som 700ms ease-in-out infinite alternate;
  }

  .audio__erro {
    max-width: 22ch;
    color: var(--erro);
    font-size: var(--texto-xs);
    font-weight: 700;
    line-height: 1.3;
  }

  @keyframes pulsar-som {
    from { transform: scale(1); opacity: 1; }
    to { transform: scale(1.16); opacity: 0.65; }
  }
</style>
