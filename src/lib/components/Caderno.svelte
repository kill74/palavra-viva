<!-- Histórico pessoal da criança: palavras já lidas, botão para reler e linha do tempo das sessões. -->
<script lang="ts">
  import type { Crianca, Sessao } from '#lib/data/tipos';
  import { obterPalavra } from '#lib/data/palavras';
  import { dataCurta, plural } from '#lib/utils/formato';
  import { alternarParaReler, palavrasLidas, palavrasParaReler } from '#lib/utils/caderno';
  import BotaoAudio from './BotaoAudio.svelte';
  import Icone from './Icone.svelte';
  import Ilustracao from './Ilustracao.svelte';

  let { crianca, sessoes }: { crianca: Crianca; sessoes: Sessao[] } = $props();

  let reler = $state<string[]>([]);
  let versao = $state(0);

  $effect(() => {
    versao;
    reler = palavrasParaReler(crianca.id);
  });

  const lidas = $derived(palavrasLidas(sessoes, crianca));
  const historico = $derived(
    [...sessoes]
      .filter((s) => s.criancaId === crianca.id)
      .sort((a, b) => b.fim.localeCompare(a.fim))
  );

  function alternar(id: string) {
    reler = alternarParaReler(crianca.id, id);
    versao += 1;
  }
</script>

<section class="caderno" aria-labelledby="caderno-titulo">
  <div class="cabeca">
    <div>
      <p class="etiqueta"><Icone nome="livro" tamanho={15} /> O meu caderno</p>
      <h2 id="caderno-titulo">Tudo o que já leste.</h2>
    </div>
    <p class="contador">{lidas.length} {plural(lidas.length, 'palavra lida', 'palavras lidas')}</p>
  </div>

  {#if lidas.length === 0}
    <p class="vazio">
      Ainda não leste nenhuma palavra sozinha. Quando acertares à primeira, aparece aqui.
    </p>
  {:else}
    <ul class="palavras" aria-label="Palavras que já leste">
      {#each lidas as id (id)}
        {@const palavra = obterPalavra(id)}
        {#if palavra}
          <li>
            <div class="imagem"><Ilustracao {palavra} /></div>
            <div class="info">
              <strong>{palavra.palavra}</strong>
              <small>{palavra.silabas.join(' · ')}</small>
              <BotaoAudio src={palavra.audio} rotulo="Ouvir" tamanho="pequeno" variante="fantasma" />
            </div>
            <button
              type="button"
              class="marcar"
              class:ativo={reler.includes(id)}
              aria-pressed={reler.includes(id)}
              aria-label={reler.includes(id)
                ? `Tirar «${palavra.palavra}» das palavras para reler`
                : `Marcar «${palavra.palavra}» para reler`}
              onclick={() => alternar(id)}
            >
              <Icone nome={reler.includes(id) ? 'check-circulo' : 'mais'} tamanho={18} />
              <span>{reler.includes(id) ? 'A reler' : 'Rever'}</span>
            </button>
          </li>
        {/if}
      {/each}
    </ul>
  {/if}

  {#if historico.length > 0}
    <div class="historico">
      <h3>As tuas sessões</h3>
      <ol>
        {#each historico as sessao (sessao.id)}
          <li>
            <span class="ponto" aria-hidden="true"></span>
            <span class="data">{dataCurta(sessao.fim)}</span>
            <span class="detalhe">
              {sessao.respostas.length} {plural(sessao.respostas.length, 'exercício', 'exercícios')}
              · {sessao.respostas.filter((r) => r.acertouPrimeira).length} sozinha
            </span>
          </li>
        {/each}
      </ol>
    </div>
  {/if}

  {#if reler.length > 0}
    <p class="reler-nota">
      <Icone nome="refresh" tamanho={16} />
      Marcaste {reler.length} {plural(reler.length, 'palavra', 'palavras')} para voltar a ler.
    </p>
  {/if}
</section>

<style>
  .caderno {
    padding: clamp(1.1rem, 2.5vw, 1.7rem);
    border: 1.5px solid var(--linha);
    border-radius: var(--raio-ficha);
    background: var(--papel-alto);
  }

  .cabeca {
    display: flex;
    flex-wrap: wrap;
    align-items: end;
    justify-content: space-between;
    gap: 0.6rem 1.5rem;
    margin-bottom: 1.1rem;
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
  }

  h3 {
    margin: 0 0 0.6rem;
    font-size: var(--texto-destaque);
  }

  .contador, .vazio, .reler-nota {
    margin: 0;
    color: var(--tinta-suave);
    font-size: var(--texto-s);
  }

  .vazio { max-width: 50ch; line-height: 1.5; }

  .palavras {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(13rem, 1fr));
    gap: 0.6rem;
    margin: 0;
    padding: 0;
    list-style: none;
  }

  .palavras li {
    display: grid;
    grid-template-columns: 4.5rem minmax(0, 1fr);
    gap: 0.5rem 0.7rem;
    padding: 0.55rem;
    border: 1.5px solid var(--linha);
    border-radius: var(--raio-ficha);
    background: var(--papel);
  }

  .imagem {
    width: 4.5rem;
    overflow: hidden;
    border: 1px solid var(--linha);
    border-radius: 4px;
    background: var(--papel-ficha);
  }

  .imagem :global(img) { display: block; width: 100%; height: auto; }

  .info { display: grid; gap: 0.1rem; justify-items: start; }
  .info strong { font-size: var(--texto-s); }
  .info small { color: var(--tinta-fraca); font-size: var(--texto-mini); }

  .marcar {
    grid-column: 1 / -1;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 0.35rem;
    min-height: 36px;
    padding: 0.25rem 0.5rem;
    border: 1.5px solid var(--linha-forte);
    border-radius: var(--raio-pill);
    background: transparent;
    color: var(--tinta);
    font-family: var(--fonte-texto);
    font-size: var(--texto-mini);
    font-weight: 700;
    cursor: pointer;
    transition: background-color var(--transicao), color var(--transicao);
  }

  .marcar:hover { background: var(--sol-fundo); }
  .marcar.ativo { border-color: var(--cobalto); background: var(--cobalto-fundo); color: var(--cobalto); }

  .historico {
    margin-top: 1.3rem;
    padding-top: 1rem;
    border-top: 1.5px solid var(--linha);
  }

  .historico ol { margin: 0; padding: 0; list-style: none; }
  .historico li { display: flex; flex-wrap: wrap; align-items: center; gap: 0.5rem; padding: 0.3rem 0; }
  .ponto { width: 0.6rem; height: 0.6rem; border-radius: var(--raio-circulo); background: var(--coral); }
  .data { min-width: 4.5rem; font-weight: 700; }
  .detalhe { color: var(--tinta-suave); font-size: var(--texto-mini); }

  .reler-nota {
    display: flex;
    align-items: center;
    gap: 0.4rem;
    margin-top: 1rem;
  }

  @media (max-width: 520px) {
    .palavras { grid-template-columns: minmax(0, 1fr); }
  }
</style>
