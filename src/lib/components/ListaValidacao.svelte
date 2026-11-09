<script lang="ts">
  import type { ValidacaoId, ValidacaoItem } from '#lib/data/tipos';
  import Icone from './Icone.svelte';

  let { itens, titulo = 'Verificação do recurso' }: { itens: ValidacaoItem[]; titulo?: string } =
    $props();

  const nomes: Record<ValidacaoId, string> = {
    ortografia: 'Ortografia',
    silabica: 'Divisão silábica',
    imagem: 'Palavra e imagem',
    pronuncia: 'Pronúncia',
    opcoes: 'Opções',
    frase: 'Frase'
  };

  const falhas = $derived(itens.filter((i) => !i.ok).length);
</script>

<section class="validacao" aria-label={titulo}>
  <div class="validacao__topo">
    <h4>{titulo}</h4>
    <span class="etiqueta" class:etiqueta--ok={falhas === 0} class:etiqueta--aviso={falhas > 0}>
      {falhas === 0 ? 'Tudo confirmado' : `${falhas} ${falhas === 1 ? 'ponto a corrigir' : 'pontos a corrigir'}`}
    </span>
  </div>
  <ul>
    {#each itens as item}
      <li class:falha={!item.ok}>
        <span class="icone" aria-hidden="true">
          <Icone nome={item.ok ? 'check' : 'x'} tamanho={17} traco={2.5} />
        </span>
        <span><strong>{nomes[item.id]}.</strong> {item.detalhe}</span>
      </li>
    {/each}
  </ul>
</section>

<style>
  .validacao {
    display: flex;
    flex-direction: column;
    gap: 0.6rem;
    padding: 0.9rem;
    border: 1.5px solid var(--linha);
    border-radius: var(--raio-ficha);
    background: var(--papel-alto);
  }

  .validacao__topo {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.75rem;
  }

  .validacao h4 {
    margin: 0;
    font-size: 1rem;
    letter-spacing: -0.01em;
  }

  ul {
    display: flex;
    flex-direction: column;
    gap: 0.35rem;
    margin: 0;
  }

  li {
    display: flex;
    gap: 0.5rem;
    align-items: flex-start;
    color: var(--tinta-suave);
    font-size: var(--texto-s);
    line-height: 1.4;
  }

  li strong {
    color: var(--tinta);
  }

  li.falha {
    color: var(--erro);
  }

  li.falha strong {
    color: var(--erro);
  }

  .icone {
    display: grid;
    place-items: center;
    width: 1.25rem;
    height: 1.25rem;
    flex: none;
    border-radius: 50%;
    background: var(--verde-fundo);
    color: var(--sucesso);
  }

  li.falha .icone {
    background: var(--coral-fundo);
    color: var(--erro);
  }
</style>
