<script lang="ts">
  import { resolve } from '$app/paths';
  import { onMount } from 'svelte';
  import { NOMES_FASE, NOMES_TIPO, type Recurso } from '#lib/data/tipos';
  import { dados } from '#lib/stores/dados.svelte';
  import { parametroUrl } from '#lib/utils/consulta';
  import { csv, dataCurta, descarregar, plural } from '#lib/utils/formato';
  import { comValidacao, validarRecurso } from '#lib/utils/validacao';
  import CamposRecurso from '#lib/components/CamposRecurso.svelte';
  import EstadoVazio from '#lib/components/EstadoVazio.svelte';
  import Icone from '#lib/components/Icone.svelte';
  import Ilustracao from '#lib/components/Ilustracao.svelte';
  import ListaValidacao from '#lib/components/ListaValidacao.svelte';
  import PreviaRecurso from '#lib/components/PreviaRecurso.svelte';
  import SeloEstado from '#lib/components/SeloEstado.svelte';
  import { obterPalavra } from '#lib/data/palavras';

  let busca = $state('');
  let filtroCrianca = $state('todas');
  let filtroEstado = $state<'todos' | 'rascunho' | 'aprovado'>('todos');
  let filtroTipo = $state('todos');

  let selecionadoId = $state<string | null>(null);
  let edicao = $state<Recurso | null>(null);
  let mensagem = $state('');
  let erro = $state('');
  let aEditar = $state(false);

  onMount(() => {
    const pedido = parametroUrl('recurso');
    if (pedido && dados.recurso(pedido)) selecionadoId = pedido;
  });

  const criancas = $derived(dados.criancas);

  const recursos = $derived(
    dados.recursos
      .filter((r) => {
        const crianca = dados.crianca(r.criancaId);
        const alvo = `${r.palavra} ${crianca?.nome ?? ''} ${NOMES_TIPO[r.tipo]}`.toLocaleLowerCase('pt-PT');
        const termo = busca.trim().toLocaleLowerCase('pt-PT');
        return (
          (!termo || alvo.includes(termo)) &&
          (filtroCrianca === 'todas' || r.criancaId === filtroCrianca) &&
          (filtroEstado === 'todos' || r.estado === filtroEstado) &&
          (filtroTipo === 'todos' || r.tipo === filtroTipo)
        );
      })
      .sort((a, b) => b.criadoEm.localeCompare(a.criadoEm))
  );

  const selecionado = $derived(edicao);
  const validacao = $derived(selecionado ? validarRecurso(selecionado) : []);
  const valido = $derived(validacao.length > 0 && validacao.every((i) => i.ok));
  const original = $derived(selecionadoId ? dados.recurso(selecionadoId) : undefined);
  const alterado = $derived(
    Boolean(selecionado && original && JSON.stringify(selecionado) !== JSON.stringify(original))
  );

  $effect(() => {
    if (!selecionadoId) {
      edicao = null;
      aEditar = false;
      return;
    }
    const atual = dados.recurso(selecionadoId);
    if (atual && (!edicao || edicao.id !== atual.id)) {
      edicao = $state.snapshot(atual) as Recurso;
      aEditar = false;
      mensagem = '';
      erro = '';
    }
  });

  function selecionar(id: string) {
    selecionadoId = id;
    const atual = dados.recurso(id);
    edicao = atual ? ($state.snapshot(atual) as Recurso) : null;
    aEditar = false;
    mensagem = '';
    erro = '';
  }

  function fecharDetalhe() {
    selecionadoId = null;
    edicao = null;
    aEditar = false;
    mensagem = '';
    erro = '';
  }

  function salvar() {
    if (!selecionado) return;
    dados.atualizarRecurso(comValidacao(selecionado));
    edicao = comValidacao(selecionado);
    mensagem = 'Alterações guardadas.';
    erro = '';
  }

  function aprovar() {
    if (!selecionado) return;
    const atualizada = comValidacao({
      ...selecionado,
      estado: 'aprovado',
      aprovadoEm: new Date().toISOString()
    });
    if (!atualizada.validacao.every((i) => i.ok)) {
      erro = 'Ainda há verificações em falta. Corrige os campos antes de aprovar.';
      return;
    }
    dados.atualizarRecurso(atualizada);
    edicao = atualizada;
    mensagem = 'Recurso aprovado e disponível para a criança.';
    erro = '';
    aEditar = false;
  }

  function devolver() {
    if (!selecionado) return;
    const atualizada = comValidacao({ ...selecionado, estado: 'rascunho', aprovadoEm: undefined });
    dados.atualizarRecurso(atualizada);
    edicao = atualizada;
    mensagem = 'Recurso devolvido a rascunho. Deixa de estar visível para a criança.';
    erro = '';
  }

  function eliminar() {
    if (!selecionado) return;
    const confirmar = window.confirm(
      `Eliminar o recurso «${selecionado.palavra}»? Esta ação não pode ser anulada.`
    );
    if (!confirmar) return;
    dados.eliminarRecurso(selecionado.id);
    fecharDetalhe();
    mensagem = 'Recurso eliminado.';
  }

  function exportar() {
    const linhas: Array<Array<string | number>> = [
      ['id', 'palavra', 'crianca', 'tipo', 'fase', 'estado', 'criado_em', 'aprovado_em'],
      ...recursos.map((r) => [
        r.id,
        r.palavra,
        dados.crianca(r.criancaId)?.nome ?? '',
        NOMES_TIPO[r.tipo],
        r.fase,
        r.estado,
        r.criadoEm,
        r.aprovadoEm ?? ''
      ])
    ];
    descarregar('palavra-viva-recursos.csv', csv(linhas));
  }

  function imprimir() {
    window.print();
  }
</script>

<svelte:head>
  <title>Biblioteca de recursos — Palavra Viva</title>
  <meta
    name="description"
    content="Biblioteca de recursos do Palavra Viva: filtrar, pré-visualizar, corrigir e aprovar propostas antes de chegar à criança."
  />
</svelte:head>

<section class="pagina pagina--ficha nao-imprimir">
  <div class="container">
    <p class="migalhas">
      <a href={resolve('/')}>Início</a>
      <span aria-hidden="true">/</span>
      <a href={resolve('/professor')}>Professor</a>
      <span aria-hidden="true">/</span>
      <span>Biblioteca</span>
    </p>

    <div class="pagina__cabeca">
      <div>
        <p class="contexto"><Icone nome="livro" tamanho={18} /> Biblioteca de recursos</p>
        <h1>Rever antes de mostrar.</h1>
      </div>
      <div>
        <p>
          Tudo o que foi criado fica aqui: aprovado, em rascunho ou à espera de correção. Abre um
          recurso para ver o que a criança veria e confirmar as seis verificações.
        </p>
        <div class="pagina__acao">
          <a class="botao botao--primario" href={resolve('/professor/criar')}>
            <Icone nome="faisca" tamanho={18} /> Criar recurso
          </a>
          <button type="button" class="botao botao--secundario" onclick={exportar}>
            <Icone nome="descarregar" tamanho={18} /> Exportar CSV
          </button>
        </div>
      </div>
    </div>
  </div>
</section>

<div class="container pagina nao-imprimir">
  <div class="filtros" aria-label="Filtros da biblioteca">
    <div class="campo-filtro">
      <label for="busca">Procurar</label>
      <input id="busca" type="search" placeholder="palavra, criança ou tipo" bind:value={busca} />
    </div>
    <div class="campo-filtro">
      <label for="filtro-crianca">Criança</label>
      <select id="filtro-crianca" bind:value={filtroCrianca}>
        <option value="todas">Todas</option>
        {#each criancas as c (c.id)}
          <option value={c.id}>{c.nome}</option>
        {/each}
      </select>
    </div>
    <div class="campo-filtro">
      <label for="filtro-estado">Estado</label>
      <select id="filtro-estado" bind:value={filtroEstado}>
        <option value="todos">Todos</option>
        <option value="rascunho">Por aprovar</option>
        <option value="aprovado">Aprovados</option>
      </select>
    </div>
    <div class="campo-filtro">
      <label for="filtro-tipo">Tipo</label>
      <select id="filtro-tipo" bind:value={filtroTipo}>
        <option value="todos">Todos</option>
        {#each Object.entries(NOMES_TIPO) as [valor, nome] (valor)}
          <option value={valor}>{nome}</option>
        {/each}
      </select>
    </div>
  </div>

  {#if mensagem}
    <p class="aviso aviso--ok" role="status"><Icone nome="check-circulo" tamanho={19} /> {mensagem}</p>
  {/if}
  {#if erro}
    <p class="aviso aviso--erro" role="alert"><Icone nome="alerta" tamanho={19} /> {erro}</p>
  {/if}

  {#if recursos.length === 0}
    <EstadoVazio
      titulo="Nenhum recurso com estes filtros"
      texto="Limpa a procura ou muda o estado. Também podes criar uma proposta nova no estúdio."
      icone="lupa"
    >
      <div class="linha">
        <button
          type="button"
          class="botao botao--secundario botao--pequeno"
          onclick={() => {
            busca = '';
            filtroCrianca = 'todas';
            filtroEstado = 'todos';
            filtroTipo = 'todos';
          }}
        >
          Limpar filtros
        </button>
        <a class="botao botao--primario botao--pequeno" href={resolve('/professor/criar')}>Criar recurso</a>
      </div>
    </EstadoVazio>
  {:else}
    <div class="biblioteca" class:com-detalhe={selecionadoId}>
      <section class="lista" aria-labelledby="lista-titulo">
        <div class="lista__topo">
          <h2 id="lista-titulo">{recursos.length} {plural(recursos.length, 'recurso', 'recursos')}</h2>
          <span class="etiqueta etiqueta--neutra">{recursos.filter((r) => r.estado === 'rascunho').length} por aprovar</span>
        </div>

        <ul class="lista__itens">
          {#each recursos as recurso (recurso.id)}
            {@const crianca = dados.crianca(recurso.criancaId)}
            {@const palavra = obterPalavra(recurso.palavraId)}
            <li>
              <button
                type="button"
                class="item"
                class:ativo={selecionadoId === recurso.id}
                aria-pressed={selecionadoId === recurso.id}
                onclick={() => selecionar(recurso.id)}
              >
                <span class="item__imagem"><Ilustracao palavra={palavra} /></span>
                <span class="item__texto">
                  <span class="item__palavra">{recurso.palavra}</span>
                  <span class="item__meta">{NOMES_TIPO[recurso.tipo]} · {crianca?.nome ?? 'criança'}</span>
                  <span class="item__meta">{NOMES_FASE[recurso.fase]} · {dataCurta(recurso.criadoEm)}</span>
                </span>
                <span class="item__estado"><SeloEstado estado={recurso.estado} /></span>
              </button>
            </li>
          {/each}
        </ul>
      </section>

      <aside class="detalhe" aria-live="polite">
        {#if selecionado}
          <div class="detalhe__topo">
            <div>
              <p class="detalhe__contexto">
                {NOMES_TIPO[selecionado.tipo]} · {NOMES_FASE[selecionado.fase]}
              </p>
              <h2>{selecionado.palavra}</h2>
              <p class="detalhe__meta">
                {dados.crianca(selecionado.criancaId)?.nome ?? 'criança'} · criado a {dataCurta(selecionado.criadoEm)}
                {#if selecionado.aprovadoEm} · aprovado a {dataCurta(selecionado.aprovadoEm)}{/if}
              </p>
            </div>
            <button type="button" class="fechar" aria-label="Fechar detalhe" onclick={fecharDetalhe}>
              <Icone nome="fechar" tamanho={20} />
            </button>
          </div>

          <div class="detalhe__corpo">
            {#if mensagem}
              <p class="aviso aviso--ok" role="status"><Icone nome="check-circulo" tamanho={18} /> {mensagem}</p>
            {/if}
            {#if erro}
              <p class="aviso aviso--erro" role="alert"><Icone nome="alerta" tamanho={18} /> {erro}</p>
            {/if}

            <PreviaRecurso recurso={selecionado} />
            <ListaValidacao itens={validacao} titulo="Verificações automáticas" />

            <div class="detalhe__acoes">
              <button type="button" class="botao botao--primario botao--pequeno" onclick={aprovar} disabled={!valido}>
                <Icone nome="check-circulo" tamanho={16} /> {selecionado.estado === 'aprovado' ? 'Confirmar aprovação' : 'Aprovar'}
              </button>
              {#if selecionado.estado === 'aprovado'}
                <button type="button" class="botao botao--secundario botao--pequeno" onclick={devolver}>
                  Devolver a rascunho
                </button>
              {/if}
              <button type="button" class="botao botao--secundario botao--pequeno" onclick={imprimir}>
                <Icone nome="impressora" tamanho={16} /> Imprimir
              </button>
              <button type="button" class="botao botao--fantasma botao--pequeno" onclick={eliminar}>
                Eliminar
              </button>
            </div>

            {#if !valido}
              <p class="aviso aviso--sol">
                <Icone nome="alerta" tamanho={18} />
                <span>Há verificações em falta. A aprovação fica bloqueada até todas passarem.</span>
              </p>
            {/if}

            <div class="editar">
              <button
                type="button"
                class="editar__botao"
                aria-expanded={aEditar}
                onclick={() => (aEditar = !aEditar)}
              >
                <Icone nome="lapis" tamanho={17} />
                {aEditar ? 'Fechar edição' : 'Editar campos do recurso'}
                {#if alterado}<span class="etiqueta etiqueta--aviso">alterações por guardar</span>{/if}
              </button>

              {#if aEditar}
                <div class="editar__corpo">
                  <CamposRecurso recurso={selecionado} />
                  <div class="linha">
                    <button type="button" class="botao botao--secundario botao--pequeno" onclick={salvar} disabled={!alterado}>
                      Guardar alterações
                    </button>
                    <p class="editar__nota">
                      {alterado ? 'As alterações ainda não foram guardadas.' : 'Sem alterações por guardar.'}
                    </p>
                  </div>
                </div>
              {/if}
            </div>

            <details class="origem">
              <summary>Origem e prompt</summary>
              <p class="origem__modelo">{selecionado.modelo}</p>
              <p class="origem__rotulo">Prompt usado</p>
              <pre>{selecionado.prompt}</pre>
            </details>
          </div>
        {:else}
          <div class="escolhe superficie-ficha">
            <span class="escolhe__icone" aria-hidden="true"><Icone nome="olho" tamanho={30} /></span>
            <h2>Escolhe um recurso</h2>
            <p>
              A pré-visualização mostra o que a criança veria. As verificações dizem o que foi
              confirmado automaticamente — e o que precisa da tua decisão.
            </p>
          </div>
        {/if}
      </aside>
    </div>
  {/if}
</div>

{#if selecionado}
  <section class="impressao" aria-hidden="true">
    <h1>Palavra Viva · ficha para copiar</h1>
    <p class="impressao__meta">{NOMES_FASE[selecionado.fase]} · {dados.crianca(selecionado.criancaId)?.nome}</p>
    <p class="impressao__palavra">{selecionado.palavra}</p>
    <p class="impressao__silabas">{selecionado.silabas.join(' · ')}</p>
    <p class="impressao__frase">«{selecionado.frase}»</p>
    <p class="impressao__linhas">Copia a palavra três vezes:</p>
    <div class="impressao__linha"></div>
    <div class="impressao__linha"></div>
    <div class="impressao__linha"></div>
    <p class="impressao__nota">
      Ficha gerada pela professora. A escrita manual complementa a atividade digital.
    </p>
  </section>
{/if}

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

  .biblioteca {
    display: grid;
    grid-template-columns: minmax(0, 0.72fr) minmax(0, 1.28fr);
    gap: 1rem;
    align-items: start;
  }

  .biblioteca.com-detalhe {
    grid-template-columns: minmax(0, 0.78fr) minmax(0, 1.22fr);
  }

  .lista {
    display: flex;
    flex-direction: column;
    gap: 0.7rem;
    min-width: 0;
  }

  .lista__topo {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.7rem;
  }

  .lista__topo h2 {
    margin: 0;
    font-size: var(--texto-l);
    letter-spacing: -0.02em;
  }

  .lista__itens {
    display: flex;
    flex-direction: column;
    gap: 0.45rem;
    max-height: 70vh;
    margin: 0;
    padding-right: 0.2rem;
    overflow-y: auto;
  }

  .item {
    display: flex;
    align-items: center;
    gap: 0.6rem;
    width: 100%;
    padding: 0.5rem;
    border: 2px solid var(--linha);
    border-radius: var(--raio-ficha);
    background: var(--papel-alto);
    color: var(--tinta);
    text-align: left;
    cursor: pointer;
    transition: border-color var(--transicao), background-color var(--transicao);
  }

  .item:hover {
    border-color: var(--linha-forte);
    background: var(--sol-fundo);
  }

  .item.ativo {
    border-color: var(--cobalto);
    background: var(--cobalto-fundo);
  }

  .item__imagem {
    display: grid;
    place-items: center;
    width: 3.4rem;
    height: 3.4rem;
    flex: none;
    padding: 0.2rem;
    border: 1.5px solid var(--linha);
    border-radius: 50%;
    background: var(--papel-ficha);
  }

  .item__texto {
    display: flex;
    flex-direction: column;
    gap: 0.08rem;
    min-width: 0;
    flex: 1;
  }

  .item__palavra {
    color: var(--tinta);
    font-family: var(--fonte-titulo);
    font-size: 1.25rem;
    font-weight: 700;
    letter-spacing: -0.03em;
    line-height: 1.05;
  }

  .item__meta {
    color: var(--tinta-suave);
    font-size: var(--texto-xs);
    line-height: 1.3;
  }

  .item__estado {
    flex: none;
  }

  .detalhe {
    display: flex;
    flex-direction: column;
    border: 2px solid var(--linha-forte);
    border-radius: var(--raio-ficha);
    background: var(--papel-ficha);
    color: var(--tinta-ficha);
    overflow: hidden;
  }

  .detalhe__topo {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 0.8rem;
    padding: 0.9rem 1rem;
    border-bottom: 2px solid var(--linha-ficha);
    background: var(--sol);
  }

  .detalhe__contexto {
    margin: 0;
    color: var(--tinta-ficha);
    font-size: var(--texto-xs);
    font-weight: 700;
    letter-spacing: 0.03em;
    text-transform: uppercase;
  }

  .detalhe__topo h2 {
    margin: 0.2rem 0 0;
    color: var(--tinta-ficha);
    font-size: clamp(1.8rem, 1.3rem + 1.4vw, 2.6rem);
  }

  .detalhe__meta {
    margin: 0.2rem 0 0;
    color: var(--tinta-suave);
    font-size: var(--texto-xs);
  }

  .fechar {
    display: grid;
    place-items: center;
    width: 2.2rem;
    height: 2.2rem;
    flex: none;
    border: 1.5px solid var(--tinta-ficha);
    border-radius: 50%;
    background: var(--papel-ficha);
    color: var(--tinta-ficha);
    cursor: pointer;
  }

  .fechar:hover {
    background: var(--coral);
    color: #fff;
  }

  .detalhe__corpo {
    display: flex;
    flex-direction: column;
    gap: 0.8rem;
    padding: 1rem;
    max-height: 76vh;
    overflow-y: auto;
  }

  .detalhe__acoes {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
  }

  .editar {
    border: 1.5px solid var(--linha);
    border-radius: var(--raio-ficha);
    background: var(--papel-alto);
  }

  .editar__botao {
    display: flex;
    align-items: center;
    gap: 0.45rem;
    width: 100%;
    padding: 0.75rem 0.9rem;
    border: 0;
    background: transparent;
    color: var(--tinta);
    font-size: var(--texto-s);
    font-weight: 700;
    text-align: left;
    cursor: pointer;
  }

  .editar__corpo {
    display: flex;
    flex-direction: column;
    gap: 0.7rem;
    padding: 0 0.9rem 0.9rem;
  }

  .editar__nota {
    margin: 0;
    color: var(--tinta-fraca);
    font-size: var(--texto-xs);
  }

  .origem {
    border-top: 1.5px solid var(--linha);
    padding-top: 0.7rem;
  }

  .origem summary {
    color: var(--tinta-suave);
    font-size: var(--texto-s);
    font-weight: 700;
    cursor: pointer;
  }

  .origem__modelo {
    margin: 0.5rem 0;
    color: var(--tinta-suave);
    font-size: var(--texto-xs);
    line-height: 1.4;
  }

  .origem__rotulo {
    margin: 0.4rem 0 0.25rem;
    color: var(--tinta-fraca);
    font-size: var(--texto-xs);
    font-weight: 700;
    text-transform: uppercase;
  }

  .origem pre {
    max-height: 14rem;
    margin: 0;
    overflow: auto;
    padding: 0.6rem;
    border: 1.5px solid var(--linha);
    border-radius: 4px;
    background: var(--papel-alto);
    font-family: ui-monospace, 'SFMono-Regular', Consolas, monospace;
    font-size: 0.72rem;
    line-height: 1.45;
    white-space: pre-wrap;
  }

  .escolhe {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 0.6rem;
    min-height: 20rem;
    padding: 1.5rem;
    background: var(--papel-ficha);
  }

  .escolhe__icone {
    display: grid;
    place-items: center;
    width: 3rem;
    height: 3rem;
    border: 1.5px solid var(--linha);
    border-radius: 50%;
    background: var(--sol-fundo);
    color: var(--tinta-ficha);
  }

  .escolhe h2 {
    margin: 0;
    color: var(--tinta-ficha);
    font-size: var(--texto-xl);
  }

  .escolhe p {
    max-width: 46ch;
    margin: 0;
    color: var(--tinta-suave);
    line-height: 1.5;
  }

  /* Impressão --------------------------------------------------------------- */

  .impressao {
    display: none;
  }

  @media (max-width: 900px) {
    .biblioteca,
    .biblioteca.com-detalhe {
      grid-template-columns: 1fr;
    }

    .lista__itens {
      max-height: none;
    }

    .detalhe__corpo {
      max-height: none;
    }
  }

  @media print {
    .impressao {
      display: block;
      padding: 2rem;
      color: #000;
      background: #fff;
    }

    .impressao h1 {
      font-size: 1.4rem;
    }

    .impressao__meta {
      margin: 0.2rem 0 1.5rem;
      font-size: 0.9rem;
    }

    .impressao__palavra {
      margin: 0;
      font-family: var(--fonte-titulo);
      font-size: 4rem;
      font-weight: 700;
      letter-spacing: -0.04em;
    }

    .impressao__silabas {
      margin: 0.2rem 0 1rem;
      font-size: 1.4rem;
      font-weight: 700;
    }

    .impressao__frase {
      margin: 0 0 2rem;
      font-size: 1.2rem;
    }

    .impressao__linhas {
      margin: 1.5rem 0 0.5rem;
      font-size: 0.95rem;
    }

    .impressao__linha {
      height: 3.5rem;
      border-bottom: 1px solid #000;
    }

    .impressao__nota {
      margin-top: 1.5rem;
      font-size: 0.75rem;
    }
  }
</style>
