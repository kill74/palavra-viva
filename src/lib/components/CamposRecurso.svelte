<script lang="ts">
  import { PALAVRAS, porId, porTexto } from '#lib/data/palavras';
  import { NOMES_TIPO, type Recurso } from '#lib/data/tipos';
  import { feedbackCerto, feedbackErrado } from '#lib/utils/gerador';
  import Icone from './Icone.svelte';

  let { recurso = $bindable() }: { recurso: Recurso } = $props();

  let silabasTexto = $state(recurso.silabas.join('-'));
  let opcoesTexto = $state(textoDasOpcoes(recurso));

  const reconhecida = $derived(porTexto(recurso.palavra));

  function textoDasOpcoes(r: Recurso): string {
    if (r.tipo === 'reconhecimento') return r.opcoes.join(', ');
    if (r.tipo === 'silabas') return r.opcoes.join(', ');
    return r.opcoes.map((id) => porId.get(id)?.palavra ?? id).join(', ');
  }

  function mudarPalavra(valor: string) {
    const anterior = porId.get(recurso.palavraId);
    recurso.palavra = valor;
    const encontrada = porTexto(valor);

    if (!encontrada) {
      // Mantém o registo anterior para que a validação mostre a incoerência.
      return;
    }

    recurso.palavraId = encontrada.id;
    recurso.silabas = [...encontrada.silabas];
    recurso.frase = encontrada.frase;
    silabasTexto = encontrada.silabas.join('-');
    recurso.feedbackCerto = feedbackCerto(recurso.tipo, encontrada.palavra, encontrada.silabas);
    recurso.feedbackErrado = feedbackErrado(recurso.tipo, encontrada.palavra, encontrada.silabas);

    if (recurso.tipo === 'reconhecimento') {
      recurso.opcoes = recurso.opcoes.map((o) =>
        anterior && o === anterior.palavra ? encontrada.palavra : o
      );
      if (!recurso.opcoes.includes(encontrada.palavra)) {
        recurso.opcoes = [encontrada.palavra, ...recurso.opcoes].slice(0, 4);
      }
    } else if (recurso.tipo === 'associacao' || recurso.tipo === 'frase') {
      recurso.opcoes = recurso.opcoes.map((id) =>
        anterior && id === anterior.id ? encontrada.id : id
      );
      if (!recurso.opcoes.includes(encontrada.id)) {
        recurso.opcoes = [encontrada.id, ...recurso.opcoes].slice(0, 4);
      }
    }
    opcoesTexto = textoDasOpcoes(recurso);
  }

  function mudarSilabas(valor: string) {
    silabasTexto = valor;
    recurso.silabas = valor
      .split('-')
      .map((s) => s.trim())
      .filter(Boolean);
  }

  function mudarOpcoes(valor: string) {
    opcoesTexto = valor;
    const partes = valor
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
    if (recurso.tipo === 'reconhecimento' || recurso.tipo === 'silabas') {
      recurso.opcoes = partes;
    } else {
      recurso.opcoes = partes.map((parte) => porTexto(parte)?.id ?? parte);
    }
  }
</script>

<div class="campos">
  <div class="grelha">
    <div class="campo">
      <label for="campo-palavra">Palavra</label>
      <input
        id="campo-palavra"
        type="text"
        value={recurso.palavra}
        list="lista-palavras"
        autocomplete="off"
        oninput={(e) => mudarPalavra(e.currentTarget.value)}
      />
      <datalist id="lista-palavras">
        {#each PALAVRAS as p}
          <option value={p.palavra}></option>
        {/each}
      </datalist>
      {#if !reconhecida}
        <p class="aviso-erro"><Icone nome="alerta" tamanho={15} /> Esta forma não está no léxico. Corrige a ortografia ou escolhe uma palavra da lista.</p>
      {:else}
        <p class="campo__ajuda">A ilustração e o áudio são puxados do catálogo por este nome.</p>
      {/if}
    </div>

    <div class="campo">
      <label for="campo-silabas">Sílabas</label>
      <input
        id="campo-silabas"
        type="text"
        value={silabasTexto}
        autocomplete="off"
        spellcheck="false"
        oninput={(e) => mudarSilabas(e.currentTarget.value)}
      />
      <p class="campo__ajuda">Separa com hífen. Exemplo: me-ni-na. As partes juntas têm de formar a palavra.</p>
    </div>
  </div>

  <div class="campo">
    <label for="campo-frase">Frase de apoio</label>
    <input
      id="campo-frase"
      type="text"
      bind:value={recurso.frase}
      autocomplete="off"
    />
    <p class="campo__ajuda">Entre 3 e 10 palavras, com a palavra-alvo e ligações já conhecidas.</p>
  </div>

  <div class="campo">
    <label for="campo-opcoes">
      {recurso.tipo === 'silabas' ? 'Sílabas extra' : 'Opções'}
    </label>
    <input
      id="campo-opcoes"
      type="text"
      value={opcoesTexto}
      autocomplete="off"
      oninput={(e) => mudarOpcoes(e.currentTarget.value)}
    />
    <p class="campo__ajuda">
      {#if recurso.tipo === 'reconhecimento'}
        Palavras escritas, separadas por vírgulas, incluindo a palavra certa.
      {:else if recurso.tipo === 'silabas'}
        Sílabas que não pertencem à palavra, separadas por vírgulas.
      {:else}
        Nomes das imagens, separados por vírgulas, incluindo a imagem certa.
      {/if}
    </p>
  </div>

  <div class="grelha">
    <div class="campo">
      <label for="campo-certo">Feedback quando acerta</label>
      <input id="campo-certo" type="text" bind:value={recurso.feedbackCerto} />
    </div>
    <div class="campo">
      <label for="campo-errado">Feedback quando erra</label>
      <input id="campo-errado" type="text" bind:value={recurso.feedbackErrado} />
    </div>
  </div>

  <fieldset class="apoios">
    <legend>Apoios na atividade</legend>
    <label><input type="checkbox" bind:checked={recurso.apoios.imagem} /> Mostrar imagem</label>
    <label><input type="checkbox" bind:checked={recurso.apoios.audio} /> Deixar ouvir</label>
    <label><input type="checkbox" bind:checked={recurso.apoios.silabas} /> Mostrar sílabas</label>
  </fieldset>

  <p class="tipo-nota">Formato: <strong>{NOMES_TIPO[recurso.tipo]}</strong>. Para mudar de formato, cria uma nova proposta no estúdio.</p>
</div>

<style>
  .campos {
    display: flex;
    flex-direction: column;
    gap: 0.9rem;
  }

  .grelha {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 0.85rem;
  }

  .aviso-erro {
    display: flex;
    align-items: flex-start;
    gap: 0.35rem;
    margin: 0;
    color: var(--erro);
    font-size: var(--texto-s);
    font-weight: 700;
    line-height: 1.35;
  }

  .aviso-erro :global(svg) {
    flex: none;
    margin-top: 0.1rem;
  }

  .apoios {
    display: flex;
    flex-wrap: wrap;
    gap: 0.6rem 1.2rem;
    margin: 0;
    padding: 0.65rem 0.8rem;
    border: 1.5px solid var(--linha);
    border-radius: var(--raio-ficha);
  }

  .apoios legend {
    padding: 0 0.3rem;
    color: var(--tinta);
    font-size: var(--texto-s);
    font-weight: 700;
  }

  .apoios label {
    display: flex;
    align-items: center;
    gap: 0.4rem;
    color: var(--tinta-suave);
    font-size: var(--texto-s);
    font-weight: 700;
    cursor: pointer;
  }

  .apoios input {
    width: 18px;
    height: 18px;
    accent-color: var(--cobalto);
  }

  .tipo-nota {
    margin: 0;
    color: var(--tinta-fraca);
    font-size: var(--texto-xs);
    line-height: 1.4;
  }

  @media (max-width: 620px) {
    .grelha {
      grid-template-columns: 1fr;
    }
  }
</style>
