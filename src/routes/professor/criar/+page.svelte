<script lang="ts">
  import { resolve } from '$app/paths';
  import { PALAVRAS, PALAVRAS_NUCLEARES, obterPalavra } from '#lib/data/palavras';
  import { MODELO_IA, PROMPT_VALIDACAO } from '#lib/data/prompts';
  import {
    FASES,
    NOMES_FASE,
    NOMES_TIPO,
    type Apoios,
    type Fase,
    type Recurso,
    type TipoAtividade
  } from '#lib/data/tipos';
  import { dados } from '#lib/stores/dados.svelte';
  import {
    apoiosSugeridos,
    criarRecurso,
    numeroOpcoesSugerido
  } from '#lib/utils/gerador';
  import { comValidacao, validarRecurso } from '#lib/utils/validacao';
  import CamposRecurso from '#lib/components/CamposRecurso.svelte';
  import Icone from '#lib/components/Icone.svelte';
  import ListaValidacao from '#lib/components/ListaValidacao.svelte';
  import PreviaRecurso from '#lib/components/PreviaRecurso.svelte';

  const TIPOS: TipoAtividade[] = ['cartao', 'reconhecimento', 'associacao', 'silabas', 'frase'];
  const derivadas = PALAVRAS.filter((p) => !p.nuclear);

  let criancaId = $state(dados.criancas[0]?.id ?? 'alice');
  let palavraId = $state('galinha');
  let fase = $state<Fase>(3);
  let tipo = $state<TipoAtividade>('associacao');
  let numeroOpcoes = $state(3);
  let apoios = $state<Apoios>({ imagem: false, audio: true, silabas: false });

  let proposta = $state<Recurso | null>(null);
  let guardado = $state(false);
  let mensagem = $state('');
  let erro = $state('');
  let copiado = $state(false);

  const crianca = $derived(dados.crianca(criancaId) ?? dados.criancas[0]);
  const palavra = $derived(obterPalavra(palavraId));
  const validacao = $derived(proposta ? validarRecurso(proposta) : []);
  const valido = $derived(validacao.length > 0 && validacao.every((item) => item.ok));
  const falhas = $derived(validacao.filter((item) => !item.ok).length);

  function escolherCrianca(id: string) {
    criancaId = id;
    const escolhida = dados.crianca(id);
    if (escolhida) fase = escolhida.fase;
  }

  function aplicarSugestoes() {
    numeroOpcoes = numeroOpcoesSugerido(fase);
    apoios = apoiosSugeridos(fase);
    if (tipo === 'cartao') {
      apoios = { imagem: true, audio: true, silabas: true };
    }
  }

  function gerar(evento: SubmitEvent) {
    evento.preventDefault();
    erro = '';
    mensagem = '';
    copiado = false;
    if (!crianca) {
      erro = 'Escolhe uma criança antes de gerar.';
      return;
    }
    const quantidade = tipo === 'cartao' ? 0 : numeroOpcoes;
    proposta = criarRecurso({
      crianca,
      palavraId,
      fase,
      tipo,
      numeroOpcoes: quantidade,
      apoios: { ...apoios }
    });
    guardado = false;
    mensagem = 'Proposta preparada. Revê os campos e as verificações antes de aprovar.';
  }

  function guardar(aprovar = false) {
    if (!proposta) return;
    if (aprovar && !valido) {
      erro = 'Há pontos por corrigir. A aprovação fica bloqueada até estarem resolvidos.';
      return;
    }
    const atualizado = comValidacao({
      ...proposta,
      estado: aprovar ? 'aprovado' : 'rascunho',
      aprovadoEm: aprovar ? new Date().toISOString() : undefined
    });
    if (guardado) {
      dados.atualizarRecurso(atualizado);
    } else {
      dados.adicionarRecurso(atualizado);
      guardado = true;
    }
    proposta = atualizado;
    erro = '';
    mensagem = aprovar
      ? 'Recurso aprovado. Já aparece na área da criança.'
      : 'Rascunho guardado na biblioteca. Ainda não está visível para a criança.';
  }

  async function copiarPrompt() {
    if (!proposta) return;
    try {
      await navigator.clipboard.writeText(proposta.prompt);
      copiado = true;
      setTimeout(() => (copiado = false), 2200);
    } catch {
      erro = 'O browser não permitiu copiar. Seleciona o texto do prompt.';
    }
  }
</script>

<svelte:head>
  <title>Estúdio de recursos — Palavra Viva</title>
  <meta
    name="description"
    content="Estúdio de criação de recursos com IA: escolher palavra, fase, atividade e apoios, rever a proposta e aprovar antes de chegar à criança."
  />
</svelte:head>

<section class="pagina pagina--ficha">
  <div class="container">
    <p class="migalhas">
      <a href={resolve('/')}>Início</a>
      <span aria-hidden="true">/</span>
      <a href={resolve('/professor')}>Professor</a>
      <span aria-hidden="true">/</span>
      <span>Criar recurso</span>
    </p>

    <div class="pagina__cabeca">
      <div>
        <p class="contexto"><Icone nome="faisca" tamanho={18} /> Estúdio de recursos</p>
        <h1>Um pedido pequeno, uma proposta revista.</h1>
      </div>
      <div>
        <p>
          Dá o contexto pedagógico. A proposta é composta a partir do léxico validado e fica em
          rascunho até a aprovares. A criança nunca vê o que ainda não foi revisto.
        </p>
        <p class="pagina__nota">
          <Icone nome="escudo" tamanho={15} /> Geração prévia. Sem chamadas a APIs em tempo de execução.
        </p>
      </div>
    </div>
  </div>
</section>

<div class="container pagina">
  <div class="estudio" class:estudio--com-proposta={proposta}>
    <section class="pedido-ficha ficha" aria-labelledby="pedido-titulo">
      <div class="ficha__topo">
        <span id="pedido-titulo">1 · O pedido</span>
        <span class="etiqueta etiqueta--info">professora</span>
      </div>

      <form class="formulario" onsubmit={gerar}>
        <div class="campo">
          <label for="crianca">Criança</label>
          <select id="crianca" value={criancaId} onchange={(e) => escolherCrianca(e.currentTarget.value)}>
            {#each dados.criancas as c (c.id)}
              <option value={c.id}>{c.nome} · {c.idade} anos · fase {c.fase}</option>
            {/each}
          </select>
          {#if crianca}
            <p class="campo__ajuda">{crianca.nota}</p>
          {/if}
        </div>

        <div class="campo">
          <label for="palavra">Palavra</label>
          <select id="palavra" bind:value={palavraId}>
            <optgroup label="As 28 palavras">
              {#each PALAVRAS_NUCLEARES as p (p.id)}
                <option value={p.id}>{String(p.ordem).padStart(2, '0')} · {p.palavra}</option>
              {/each}
            </optgroup>
            <optgroup label="Palavras derivadas">
              {#each derivadas as p (p.id)}
                <option value={p.id}>{p.palavra}</option>
              {/each}
            </optgroup>
          </select>
          <p class="campo__ajuda">
            {palavra.silabas.join(' · ')} · «{palavra.frase}»
          </p>
        </div>

        <div class="grelha">
          <div class="campo">
            <label for="fase">Fase de aprendizagem</label>
            <select id="fase" bind:value={fase}>
              {#each FASES as f (f.numero)}
                <option value={f.numero}>{f.numero} · {f.nome}</option>
              {/each}
            </select>
          </div>

          <div class="campo">
            <label for="tipo">Tipo de atividade</label>
            <select id="tipo" bind:value={tipo}>
              {#each TIPOS as t (t)}
                <option value={t}>{NOMES_TIPO[t]}</option>
              {/each}
            </select>
          </div>
        </div>

        <p class="fase-descricao">
          <strong>{NOMES_FASE[fase]}.</strong>
          {FASES.find((f) => f.numero === fase)?.descricao}
        </p>

        {#if tipo !== 'cartao'}
          <div class="campo">
            <div class="campo__rotulo">
              <span>Número de opções</span>
              <strong class="numero-valor">{numeroOpcoes}</strong>
            </div>
            <input
              id="opcoes"
              type="range"
              min="2"
              max="4"
              step="1"
              bind:value={numeroOpcoes}
              aria-label="Número de opções, entre 2 e 4"
            />
            <div class="escala" aria-hidden="true"><span>2</span><span>3</span><span>4</span></div>
          </div>
        {:else}
          <p class="aviso aviso--info">
            <Icone nome="cartao" tamanho={20} />
            <span>O cartão não tem resposta certa. Mostra a palavra, a imagem e o áudio para explorar.</span>
          </p>
        {/if}

        <fieldset class="apoios-campo">
          <legend>Apoios</legend>
          <label><input type="checkbox" bind:checked={apoios.imagem} /> Imagem visível</label>
          <label><input type="checkbox" bind:checked={apoios.audio} /> Áudio repetível</label>
          <label><input type="checkbox" bind:checked={apoios.silabas} /> Sílabas visíveis</label>
        </fieldset>

        <div class="sugestao">
          <button type="button" class="link-botao" onclick={aplicarSugestoes}>
            <Icone nome="refresh" tamanho={15} /> Sugerir apoios e opções para a fase {fase}
          </button>
        </div>

        <button class="botao botao--primario botao--bloco" type="submit">
          <Icone nome="faisca" tamanho={19} /> Gerar proposta
        </button>

        <p class="nota-ia">
          {MODELO_IA}
        </p>
      </form>
    </section>

    <section class="resultado" aria-live="polite" aria-labelledby="resultado-titulo">
      {#if !proposta}
        <div class="espera">
          <span class="espera__icone" aria-hidden="true"><Icone nome="lapis" tamanho={30} /></span>
          <h2 id="resultado-titulo">A proposta aparece aqui</h2>
          <p>
            Escolhe a criança, a palavra, a fase e o tipo. A aplicação devolve uma proposta com
            opções, frase, feedback e seis verificações.
          </p>
          <div class="espera__lista">
            <span><Icone nome="check" tamanho={16} /> Ortografia e sílabas</span>
            <span><Icone nome="check" tamanho={16} /> Palavra, imagem e áudio</span>
            <span><Icone nome="check" tamanho={16} /> Opções e frase curta</span>
          </div>
        </div>
      {:else}
        <div class="resultado__topo">
          <div>
            <p class="etiqueta etiqueta--info">2 · Proposta</p>
            <h2 id="resultado-titulo">{proposta.palavra}</h2>
            <p>{NOMES_TIPO[proposta.tipo]} · {NOMES_FASE[proposta.fase]} · {crianca?.nome}</p>
          </div>
          <span class="etiqueta" class:etiqueta--ok={valido} class:etiqueta--aviso={!valido}>
            {valido ? 'Pronta a aprovar' : `${falhas} ${falhas === 1 ? 'ponto' : 'pontos'} a corrigir`}
          </span>
        </div>

        {#if mensagem}
          <p class="aviso aviso--ok" role="status"><Icone nome="check-circulo" tamanho={19} /> {mensagem}</p>
        {/if}
        {#if erro}
          <p class="aviso aviso--erro" role="alert"><Icone nome="alerta" tamanho={19} /> {erro}</p>
        {/if}

        <div class="resultado__grelha">
          <div class="bloco">
            <h3 class="bloco__titulo">3 · Revisão dos campos</h3>
            <CamposRecurso recurso={proposta} />
          </div>

          <div class="bloco bloco--previa">
            <h3 class="bloco__titulo">Pré-visualização</h3>
            <PreviaRecurso recurso={proposta} />
            <ListaValidacao itens={validacao} titulo="Verificações automáticas" />
            {#if !valido}
              <p class="aviso aviso--erro">
                <Icone nome="alerta" tamanho={18} />
                <span>Corrige os campos assinalados. O botão de aprovação só fica ativo quando as seis verificações passam.</span>
              </p>
            {/if}
          </div>
        </div>

        <details class="prompt">
          <summary><Icone nome="olho" tamanho={17} /> Ver o prompt e o pedido de verificação</summary>
          <div class="prompt__corpo">
            <p class="prompt__rotulo">Prompt enviado</p>
            <pre>{proposta.prompt}</pre>
            <p class="prompt__rotulo">Prompt de verificação</p>
            <pre>{PROMPT_VALIDACAO}</pre>
            <button type="button" class="botao botao--pequeno botao--secundario" onclick={copiarPrompt}>
              {copiado ? 'Prompt copiado' : 'Copiar o prompt'}
            </button>
          </div>
        </details>

        <div class="resultado__acoes">
          <button type="button" class="botao botao--secundario" onclick={() => guardar(false)}>
            <Icone nome="lapis" tamanho={18} /> Guardar rascunho
          </button>
          <button type="button" class="botao botao--primario" onclick={() => guardar(true)} disabled={!valido}>
            <Icone nome="check-circulo" tamanho={18} /> Aprovar e disponibilizar
          </button>
        </div>

        {#if guardado}
          <p class="resultado__ligacoes">
            <a class="link" href={resolve('/professor/biblioteca') + '?recurso=' + proposta.id}>Ver na biblioteca</a>
            <a class="link" href={resolve('/professor')}>Voltar ao painel</a>
            <button type="button" class="link-botao" onclick={() => { proposta = null; mensagem = ''; erro = ''; guardado = false; }}>
              Criar outra proposta
            </button>
          </p>
        {/if}
      {/if}
    </section>
  </div>
</div>

<style>
  .contexto {
    display: flex;
    align-items: center;
    gap: 0.4rem;
    margin: 0 0 0.5rem;
    color: var(--cobalto);
    font-size: var(--texto-s);
    font-weight: 700;
  }

  :global(html[data-tema='escuro']) .contexto {
    color: var(--link);
  }

  .estudio {
    display: grid;
    grid-template-columns: minmax(0, 0.82fr) minmax(0, 1.18fr);
    gap: 1.2rem;
    align-items: start;
  }

  .pedido-ficha {
    position: sticky;
    top: 5.6rem;
    overflow: hidden;
  }

  .formulario {
    display: flex;
    flex-direction: column;
    gap: 0.9rem;
    padding: 1rem;
  }

  .grelha {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 0.7rem;
  }

  .formulario .campo > select,
  .formulario .campo > input:not([type='range']) {
    width: 100%;
    min-height: 46px;
    padding: 0.55rem 0.65rem;
    border: 2px solid var(--linha-ficha);
    border-radius: 5px;
    background: var(--papel-ficha);
    color: var(--tinta-ficha);
    font-size: var(--texto-s);
  }

  .fase-descricao {
    margin: -0.15rem 0 0;
    padding: 0.55rem 0.7rem;
    border-left: 4px solid var(--sol);
    background: var(--sol-fundo);
    color: var(--tinta-ficha);
    font-size: var(--texto-s);
    line-height: 1.4;
  }

  .fase-descricao strong {
    display: block;
  }

  .numero-valor {
    display: inline-grid;
    place-items: center;
    width: 1.7rem;
    height: 1.7rem;
    border: 1.5px solid var(--tinta-ficha);
    border-radius: 50%;
    background: var(--sol);
    color: var(--tinta-ficha);
    font-family: var(--fonte-titulo);
    font-size: 1rem;
    line-height: 1;
  }

  .campo__rotulo {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.5rem;
  }

  input[type='range'] {
    width: 100%;
    min-height: 34px;
    accent-color: var(--cobalto);
  }

  .escala {
    display: flex;
    justify-content: space-between;
    color: var(--tinta-fraca);
    font-size: var(--texto-xs);
  }

  .apoios-campo {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem 1rem;
    margin: 0;
    padding: 0.65rem 0.8rem;
    border: 1.5px solid var(--linha);
    border-radius: var(--raio-ficha);
  }

  .apoios-campo legend {
    padding: 0 0.3rem;
    color: var(--tinta);
    font-size: var(--texto-s);
    font-weight: 700;
  }

  .apoios-campo label {
    display: flex;
    align-items: center;
    gap: 0.4rem;
    color: var(--tinta-suave);
    font-size: var(--texto-s);
    font-weight: 700;
    cursor: pointer;
  }

  .apoios-campo input {
    width: 18px;
    height: 18px;
    accent-color: var(--cobalto);
  }

  .sugestao {
    margin-top: -0.15rem;
  }

  .link-botao {
    display: inline-flex;
    align-items: center;
    gap: 0.35rem;
    padding: 0;
    border: 0;
    background: transparent;
    color: var(--link);
    font-size: var(--texto-s);
    font-weight: 700;
    text-align: left;
    text-decoration: underline;
    text-decoration-thickness: 2px;
    text-underline-offset: 3px;
    cursor: pointer;
  }

  .link-botao:hover {
    background: var(--sol);
    color: var(--tinta-ficha);
    text-decoration-color: transparent;
  }

  .nota-ia {
    margin: 0;
    color: var(--tinta-fraca);
    font-size: var(--texto-xs);
    line-height: 1.4;
  }

  /* Resultado --------------------------------------------------------------- */

  .resultado {
    display: flex;
    flex-direction: column;
    gap: 0.9rem;
    min-width: 0;
  }

  .espera {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 0.65rem;
    min-height: 24rem;
    padding: clamp(1.4rem, 3vw, 2.4rem);
    border: 2px dashed var(--linha-forte);
    border-radius: var(--raio-ficha);
    background: var(--papel-alto);
  }

  .espera__icone {
    display: grid;
    place-items: center;
    width: 3.4rem;
    height: 3.4rem;
    border: 1.5px solid var(--linha);
    border-radius: 50%;
    background: var(--sol-fundo);
    color: var(--tinta-ficha);
  }

  .espera h2 {
    margin: 0;
    font-size: var(--texto-xl);
  }

  .espera p {
    max-width: 48ch;
    margin: 0;
    color: var(--tinta-suave);
    line-height: 1.5;
  }

  .espera__lista {
    display: flex;
    flex-direction: column;
    gap: 0.35rem;
    margin-top: 0.3rem;
  }

  .espera__lista span {
    display: flex;
    align-items: center;
    gap: 0.4rem;
    color: var(--tinta-suave);
    font-size: var(--texto-s);
  }

  .espera__lista :global(svg) {
    color: var(--sucesso);
  }

  .resultado__topo {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 1rem;
    padding: 1rem 1.1rem;
    border: 2px solid var(--linha-forte);
    border-radius: var(--raio-ficha);
    background: var(--papel-ficha);
    color: var(--tinta-ficha);
  }

  .resultado__topo h2 {
    margin: 0.2rem 0 0;
    font-size: clamp(2rem, 1.4rem + 2vw, 3rem);
  }

  .resultado__topo p:not(.etiqueta) {
    margin: 0.15rem 0 0;
    color: var(--tinta-suave);
    font-size: var(--texto-s);
  }

  .resultado__grelha {
    display: grid;
    grid-template-columns: minmax(0, 1.1fr) minmax(0, 0.9fr);
    gap: 0.9rem;
    align-items: start;
  }

  .bloco {
    display: flex;
    flex-direction: column;
    gap: 0.6rem;
    min-width: 0;
  }

  .bloco__titulo {
    margin: 0;
    color: var(--tinta-suave);
    font-family: var(--fonte-texto);
    font-size: var(--texto-xs);
    font-weight: 700;
    letter-spacing: 0.04em;
    text-transform: uppercase;
  }

  .bloco--previa {
    position: sticky;
    top: 5.6rem;
  }

  .prompt {
    border: 1.5px solid var(--linha);
    border-radius: var(--raio-ficha);
    background: var(--papel-alto);
  }

  .prompt summary {
    display: flex;
    align-items: center;
    gap: 0.4rem;
    padding: 0.75rem 0.9rem;
    color: var(--tinta-suave);
    font-size: var(--texto-s);
    font-weight: 700;
    cursor: pointer;
  }

  .prompt__corpo {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
    padding: 0 0.9rem 0.9rem;
  }

  .prompt__rotulo {
    margin: 0.3rem 0 0;
    color: var(--tinta-fraca);
    font-size: var(--texto-xs);
    font-weight: 700;
    letter-spacing: 0.04em;
    text-transform: uppercase;
  }

  .prompt pre {
    width: 100%;
    max-height: 22rem;
    margin: 0;
    overflow: auto;
    padding: 0.7rem;
    border: 1.5px solid var(--linha);
    border-radius: 4px;
    background: var(--papel-ficha);
    color: var(--tinta-ficha);
    font-family: ui-monospace, 'SFMono-Regular', Consolas, monospace;
    font-size: 0.76rem;
    line-height: 1.45;
    white-space: pre-wrap;
  }

  .resultado__acoes {
    display: flex;
    flex-wrap: wrap;
    gap: 0.6rem;
    padding: 0.9rem;
    border: 2px solid var(--linha-forte);
    border-radius: var(--raio-ficha);
    background: var(--papel-ficha);
  }

  .resultado__ligacoes {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 1rem;
    margin: 0;
    font-size: var(--texto-s);
  }

  @media (max-width: 1100px) {
    .resultado__grelha {
      grid-template-columns: 1fr;
    }

    .bloco--previa {
      position: static;
    }
  }

  @media (max-width: 900px) {
    .estudio {
      grid-template-columns: 1fr;
    }

    .pedido-ficha {
      position: static;
    }
  }

  @media (max-width: 560px) {
    .grelha {
      grid-template-columns: 1fr;
    }

    .resultado__topo {
      flex-direction: column;
    }

    .resultado__acoes {
      flex-direction: column;
    }

    .resultado__acoes .botao {
      width: 100%;
    }
  }
</style>
