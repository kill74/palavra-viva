<script lang="ts">
  import { onMount } from 'svelte';
  import { PALAVRAS_NUCLEARES, obterPalavra } from '#lib/data/palavras';
  import { NOMES_FASE, NOMES_TIPO } from '#lib/data/tipos';
  import { dados } from '#lib/stores/dados.svelte';
  import { parametroUrl } from '#lib/utils/consulta';
  import { csv, dataCurta, dataLonga, descarregar, duracao, hora, idCurto, plural } from '#lib/utils/formato';
  import EstadoVazio from '#lib/components/EstadoVazio.svelte';
  import Icone from '#lib/components/Icone.svelte';

  let filtroCrianca = $state('todas');

  onMount(() => {
    const inicial = parametroUrl('crianca');
    if (inicial && dados.criancas.some((c) => c.id === inicial)) {
      filtroCrianca = inicial;
    }
  });

  let escreverCrianca = $state(dados.criancas[0]?.id ?? 'alice');
  let escreverPalavra = $state('sapato');
  let escreverNota = $state('');
  let mensagemEscrita = $state('');
  let erroEscrita = $state('');

  const sessoes = $derived(
    dados.sessoes
      .filter((s) => filtroCrianca === 'todas' || s.criancaId === filtroCrianca)
      .sort((a, b) => b.fim.localeCompare(a.fim))
  );

  const respostas = $derived(sessoes.flatMap((s) => s.respostas));
  const autonomas = $derived(respostas.filter((r) => r.acertouPrimeira).length);
  const apoiadas = $derived(respostas.length - autonomas);
  const ajudas = $derived(respostas.reduce((soma, r) => soma + r.ajudas, 0));
  const percentagem = $derived(
    respostas.length ? Math.round((autonomas / respostas.length) * 100) : 0
  );

  const porCrianca = $derived(
    dados.criancas.map((crianca) => {
      const lista = dados.sessoesDaCrianca(crianca.id);
      const resp = lista.flatMap((s) => s.respostas);
      const auto = resp.filter((r) => r.acertouPrimeira).length;
      return {
        crianca,
        sessoes: lista.length,
        respostas: resp.length,
        autonomia: resp.length ? Math.round((auto / resp.length) * 100) : 0,
        ajudas: resp.reduce((soma, r) => soma + r.ajudas, 0),
        ultima: lista[0]
      };
    })
  );

  const escritas = $derived(
    dados.escritas
      .filter((e) => filtroCrianca === 'todas' || e.criancaId === filtroCrianca)
      .sort((a, b) => b.data.localeCompare(a.data))
  );

  function duracaoSessao(inicio: string, fim: string): string {
    const ms = new Date(fim).getTime() - new Date(inicio).getTime();
    return duracao(Math.max(0, ms));
  }

  function registarEscrita(evento: SubmitEvent) {
    evento.preventDefault();
    erroEscrita = '';
    mensagemEscrita = '';
    const crianca = dados.crianca(escreverCrianca);
    const palavra = obterPalavra(escreverPalavra);
    if (!crianca || !palavra) {
      erroEscrita = 'Escolhe a criança e a palavra antes de registar.';
      return;
    }
    dados.registarEscrita({
      id: `esc-${idCurto()}`,
      criancaId: crianca.id,
      palavraId: palavra.id,
      data: new Date().toISOString(),
      nota: escreverNota.trim() || 'Cópia com modelo concluída.'
    });
    escreverNota = '';
    mensagemEscrita = `Ficha de «${palavra.palavra}» registada para ${crianca.nome}.`;
  }

  function exportar() {
    const linhas: Array<Array<string | number>> = [
      ['sessao', 'crianca', 'inicio', 'fim', 'palavra', 'atividade', 'tentativas', 'ajudas', 'autonoma', 'tempo_ms', 'audio', 'dica', 'revelou']
    ];
    for (const sessao of sessoes) {
      const crianca = dados.crianca(sessao.criancaId);
      for (const resposta of sessao.respostas) {
        linhas.push([
          sessao.id,
          crianca?.nome ?? sessao.criancaId,
          sessao.inicio,
          sessao.fim,
          resposta.palavra,
          NOMES_TIPO[resposta.tipo],
          resposta.tentativas,
          resposta.ajudas,
          resposta.acertouPrimeira ? 'sim' : 'não',
          resposta.tempoMs,
          resposta.usouAudio ? 'sim' : 'não',
          resposta.usouDica ? 'sim' : 'não',
          resposta.revelou ? 'sim' : 'não'
        ]);
      }
    }
    descarregar('palavra-viva-sessoes.csv', csv(linhas));
  }
</script>

<svelte:head>
  <title>Registos de sessão — Palavra Viva</title>
  <meta
    name="description"
    content="Registos de sessão do Palavra Viva: tentativas, ajudas, respostas autónomas e apoiadas, com exportação CSV."
  />
</svelte:head>

<section class="pagina pagina--ficha">
  <div class="container">
    <p class="migalhas">
      <a href="/">Início</a>
      <span aria-hidden="true">/</span>
      <a href="/professor">Professor</a>
      <span aria-hidden="true">/</span>
      <span>Registos</span>
    </p>

    <div class="pagina__cabeca">
      <div>
        <p class="contexto"><Icone nome="olho" tamanho={18} /> Observação da leitura</p>
        <h1>O que a sessão mostrou.</h1>
      </div>
      <div>
        <p>
          Tentativas, ajudas e tempo não valem como nota. Servem para distinguir uma resposta
          autónoma de uma resposta apoiada e para decidir o próximo passo com a criança.
        </p>
        <div class="pagina__acao">
          <button type="button" class="botao botao--secundario" onclick={exportar}>
            <Icone nome="descarregar" tamanho={18} /> Exportar registos
          </button>
          <a class="botao botao--primario" href="/crianca">
            <Icone nome="crianca" tamanho={18} /> Abrir área da criança
          </a>
        </div>
      </div>
    </div>

    <div class="cartoes-resumo" aria-label="Resumo dos registos">
      <div class="resumo">
        <span class="resumo__rotulo">Sessões</span>
        <strong class="resumo__valor">{sessoes.length}</strong>
        <span class="resumo__nota">{filtroCrianca === 'todas' ? 'toda a turma' : dados.crianca(filtroCrianca)?.nome}</span>
      </div>
      <div class="resumo">
        <span class="resumo__rotulo">Respostas</span>
        <strong class="resumo__valor">{respostas.length}</strong>
        <span class="resumo__nota">{autonomas} autónomas · {apoiadas} com apoio</span>
      </div>
      <div class="resumo">
        <span class="resumo__rotulo">Autonomia</span>
        <strong class="resumo__valor">{percentagem}%</strong>
        <span class="resumo__nota">acertos à primeira tentativa, sem ajuda</span>
      </div>
      <div class="resumo">
        <span class="resumo__rotulo">Ajudas</span>
        <strong class="resumo__valor">{ajudas}</strong>
        <span class="resumo__nota">{plural(ajudas, 'áudio ou dica usada', 'áudios ou dicas usados')}</span>
      </div>
    </div>
  </div>
</section>

<div class="container pagina">
  <div class="filtros" aria-label="Filtro por criança">
    <div class="campo-filtro">
      <label for="filtro-crianca">Ver registos de</label>
      <select id="filtro-crianca" bind:value={filtroCrianca}>
        <option value="todas">Toda a turma</option>
        {#each dados.criancas as c (c.id)}
          <option value={c.id}>{c.nome}</option>
        {/each}
      </select>
    </div>
    <p class="filtro-nota">
      <Icone nome="escudo" tamanho={15} /> Dados fictícios guardados neste browser.
    </p>
  </div>

  <section aria-labelledby="turma-titulo" class="bloco-turma">
    <h2 id="turma-titulo">Por criança</h2>
    <div class="tabela-envolvente">
      <table class="tabela">
        <caption>Resumo do percurso registado. A percentagem de autonomia é descritiva, não avaliativa.</caption>
        <thead>
          <tr>
            <th scope="col">Criança</th>
            <th scope="col">Fase</th>
            <th scope="col" class="coluna-numero">Sessões</th>
            <th scope="col" class="coluna-numero">Respostas</th>
            <th scope="col" class="coluna-numero">Autonomia</th>
            <th scope="col" class="coluna-numero">Ajudas</th>
            <th scope="col">Última sessão</th>
            <th scope="col" class="coluna-acao"><span class="visualmente-oculto">Ação</span></th>
          </tr>
        </thead>
        <tbody>
          {#each porCrianca as linha (linha.crianca.id)}
            <tr>
              <th scope="row">{linha.crianca.nome}</th>
              <td>{linha.crianca.fase} · {NOMES_FASE[linha.crianca.fase]}</td>
              <td class="coluna-numero">{linha.sessoes}</td>
              <td class="coluna-numero">{linha.respostas}</td>
              <td class="coluna-numero">{linha.autonomia}%</td>
              <td class="coluna-numero">{linha.ajudas}</td>
              <td>{linha.ultima ? `${dataCurta(linha.ultima.fim)}, ${hora(linha.ultima.fim)}` : '—'}</td>
              <td class="coluna-acao">
                <button type="button" class="link-botao" onclick={() => (filtroCrianca = linha.crianca.id)}>
                  Filtrar
                </button>
              </td>
            </tr>
          {/each}
        </tbody>
      </table>
    </div>
  </section>

  <div class="grelha-registos">
    <section aria-labelledby="sessoes-titulo" class="sessoes">
      <div class="bloco-cabeca">
        <h2 id="sessoes-titulo">Sessões</h2>
        <span class="etiqueta etiqueta--neutra">{sessoes.length} {plural(sessoes.length, 'sessão', 'sessões')}</span>
      </div>

      {#if sessoes.length === 0}
        <EstadoVazio
          titulo="Ainda não há sessões"
          texto="Quando a criança terminar uma atividade, os registos aparecem aqui. Podes abrir uma sessão de demonstração na área da criança."
          icone="crianca"
        >
          <a class="botao botao--primario botao--pequeno" href="/crianca">Abrir área da criança</a>
        </EstadoVazio>
      {:else}
        <div class="lista-sessoes">
          {#each sessoes as sessao (sessao.id)}
            {@const crianca = dados.crianca(sessao.criancaId)}
            {@const total = sessao.respostas.length}
            {@const auto = sessao.respostas.filter((r) => r.acertouPrimeira).length}
            <details class="sessao">
              <summary>
                <span class="sessao__marca" aria-hidden="true"><Icone nome="olho" tamanho={18} /></span>
                <span class="sessao__texto">
                  <span class="sessao__titulo">{crianca?.nome ?? 'Criança'} · {dataLonga(sessao.fim)}</span>
                  <span class="sessao__meta">
                    {hora(sessao.inicio)}–{hora(sessao.fim)} · {duracaoSessao(sessao.inicio, sessao.fim)} · {total} {plural(total, 'atividade', 'atividades')}
                  </span>
                </span>
                <span class="sessao__valores">
                  <span class="sessao__auto">{auto} autónomas</span>
                  <span class="sessao__apoio">{total - auto} com apoio</span>
                </span>
                <span class="sessao__seta" aria-hidden="true"><Icone nome="seta" tamanho={17} /></span>
              </summary>

              <div class="sessao__corpo">
                {#if total === 0}
                  <p class="sessao__vazia">Sessão aberta sem respostas registadas.</p>
                {:else}
                  <table class="tabela tabela--sessao">
                    <caption class="visualmente-oculto">Respostas da sessão de {crianca?.nome}</caption>
                    <thead>
                      <tr>
                        <th scope="col">Palavra</th>
                        <th scope="col">Atividade</th>
                        <th scope="col" class="coluna-numero">Tentativas</th>
                        <th scope="col" class="coluna-numero">Ajudas</th>
                        <th scope="col">Resultado</th>
                        <th scope="col" class="coluna-numero">Tempo</th>
                      </tr>
                    </thead>
                    <tbody>
                      {#each sessao.respostas as resposta, indice (resposta.recursoId + indice)}
                        <tr>
                          <th scope="row">{resposta.palavra}</th>
                          <td>{NOMES_TIPO[resposta.tipo]}</td>
                          <td class="coluna-numero">{resposta.tentativas}</td>
                          <td class="coluna-numero">{resposta.ajudas}</td>
                          <td>
                            {#if resposta.revelou}
                              <span class="etiqueta etiqueta--aviso">Resposta mostrada</span>
                            {:else if resposta.acertouPrimeira}
                              <span class="etiqueta etiqueta--ok">Autónoma</span>
                            {:else}
                              <span class="etiqueta etiqueta--info">Com apoio</span>
                            {/if}
                          </td>
                          <td class="coluna-numero">{duracao(resposta.tempoMs)}</td>
                        </tr>
                      {/each}
                    </tbody>
                  </table>
                  <p class="sessao__nota">
                    {#if sessao.respostas.some((r) => r.usouAudio)}
                      Houve pedidos de áudio nesta sessão.
                    {:else}
                      Não houve pedidos de áudio nesta sessão.
                    {/if}
                    {#if sessao.respostas.some((r) => r.usouDica)}
                      Foram usadas dicas.
                    {/if}
                  </p>
                {/if}
              </div>
            </details>
          {/each}
        </div>
      {/if}
    </section>

    <aside class="escrita" aria-labelledby="escrita-titulo">
      <div class="bloco-cabeca">
        <h2 id="escrita-titulo">Escrita em papel</h2>
        <span class="etiqueta etiqueta--neutra">manual</span>
      </div>
      <p class="escrita__intro">
        A aplicação não substitui a cópia à mão. Usa a ficha impressa da biblioteca e registra aqui
        quando a criança concluiu a tarefa.
      </p>

      <form class="escrita__form" onsubmit={registarEscrita}>
        <div class="campo">
          <label for="escrita-crianca">Criança</label>
          <select id="escrita-crianca" bind:value={escreverCrianca}>
            {#each dados.criancas as c (c.id)}
              <option value={c.id}>{c.nome}</option>
            {/each}
          </select>
        </div>
        <div class="campo">
          <label for="escrita-palavra">Palavra copiada</label>
          <select id="escrita-palavra" bind:value={escreverPalavra}>
            {#each PALAVRAS_NUCLEARES as p (p.id)}
              <option value={p.id}>{p.palavra}</option>
            {/each}
          </select>
        </div>
        <div class="campo">
          <label for="escrita-nota">Observação <span class="opcional">(opcional)</span></label>
          <input id="escrita-nota" type="text" bind:value={escreverNota} placeholder="Ex.: copiou sem modelo" maxlength="120" />
        </div>
        {#if mensagemEscrita}
          <p class="aviso aviso--ok" role="status"><Icone nome="check" tamanho={17} /> {mensagemEscrita}</p>
        {/if}
        {#if erroEscrita}
          <p class="aviso aviso--erro" role="alert"><Icone nome="alerta" tamanho={17} /> {erroEscrita}</p>
        {/if}
        <button type="submit" class="botao botao--secundario botao--bloco botao--pequeno">
          <Icone nome="lapis" tamanho={17} /> Registar conclusão
        </button>
      </form>

      <div class="escrita__lista">
        <h3>Registos recentes</h3>
        {#if escritas.length === 0}
          <p class="escrita__vazia">Ainda não há fichas de escrita registadas com este filtro.</p>
        {:else}
          <ul>
            {#each escritas.slice(0, 6) as registo (registo.id)}
              {@const crianca = dados.crianca(registo.criancaId)}
              {@const palavra = obterPalavra(registo.palavraId)}
              <li>
                <p class="escrita__palavra">{palavra.palavra} <span>· {crianca?.nome ?? 'criança'}</span></p>
                <p class="escrita__data">{dataCurta(registo.data)} · {registo.nota}</p>
              </li>
            {/each}
          </ul>
        {/if}
      </div>
    </aside>
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

  .filtro-nota {
    display: flex;
    align-items: center;
    gap: 0.35rem;
    margin: 0 0 0.55rem auto;
    color: var(--tinta-fraca);
    font-size: var(--texto-s);
  }

  .bloco-turma {
    margin-bottom: 2rem;
  }

  .bloco-turma h2,
  .bloco-cabeca h2 {
    margin: 0 0 0.7rem;
    font-size: var(--texto-l);
    letter-spacing: -0.02em;
  }

  .bloco-cabeca {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    gap: 0.6rem;
    margin-bottom: 0.7rem;
  }

  .bloco-cabeca h2 {
    margin: 0;
    font-size: var(--texto-xl);
  }

  .grelha-registos {
    display: grid;
    grid-template-columns: minmax(0, 1.5fr) minmax(0, 0.75fr);
    gap: 1.2rem;
    align-items: start;
  }

  .sessoes {
    min-width: 0;
  }

  .lista-sessoes {
    display: flex;
    flex-direction: column;
    gap: 0.55rem;
  }

  .sessao {
    border: 1.5px solid var(--linha);
    border-radius: var(--raio-ficha);
    background: var(--papel-alto);
    overflow: hidden;
  }

  .sessao summary {
    display: flex;
    align-items: center;
    gap: 0.7rem;
    padding: 0.75rem 0.9rem;
    cursor: pointer;
    list-style: none;
  }

  .sessao summary::-webkit-details-marker {
    display: none;
  }

  .sessao summary:hover {
    background: var(--sol-fundo);
  }

  .sessao__marca {
    display: grid;
    place-items: center;
    width: 2.4rem;
    height: 2.4rem;
    flex: none;
    border: 1.5px solid var(--linha);
    border-radius: 50%;
    background: var(--cobalto-fundo);
    color: var(--link);
  }

  .sessao__texto {
    display: flex;
    flex-direction: column;
    gap: 0.1rem;
    flex: 1;
    min-width: 0;
  }

  .sessao__titulo {
    color: var(--tinta);
    font-weight: 700;
    line-height: 1.25;
  }

  .sessao__meta {
    color: var(--tinta-suave);
    font-size: var(--texto-xs);
  }

  .sessao__valores {
    display: flex;
    flex-wrap: wrap;
    justify-content: flex-end;
    gap: 0.3rem;
    flex: none;
  }

  .sessao__auto,
  .sessao__apoio {
    padding: 0.15rem 0.45rem;
    border-radius: var(--raio-pill);
    font-size: 0.7rem;
    font-weight: 700;
    white-space: nowrap;
  }

  .sessao__auto {
    background: var(--verde-fundo);
    color: var(--sucesso);
  }

  .sessao__apoio {
    background: var(--coral-fundo);
    color: var(--erro);
  }

  .sessao__seta {
    flex: none;
    color: var(--tinta-fraca);
    transition: transform var(--transicao);
  }

  .sessao[open] .sessao__seta {
    transform: rotate(90deg);
  }

  .sessao__corpo {
    padding: 0 0.9rem 0.9rem;
    border-top: 1.5px solid var(--linha);
  }

  .tabela--sessao {
    margin-top: 0.6rem;
  }

  .sessao__nota {
    margin: 0.6rem 0 0;
    color: var(--tinta-fraca);
    font-size: var(--texto-xs);
  }

  .sessao__vazia {
    margin: 0.7rem 0 0;
    color: var(--tinta-suave);
    font-size: var(--texto-s);
  }

  /* Escrita ----------------------------------------------------------------- */

  .escrita {
    display: flex;
    flex-direction: column;
    gap: 0.7rem;
    padding: 1rem;
    border: 1.5px solid var(--linha);
    border-radius: var(--raio-ficha);
    background: var(--papel-alto);
  }

  .escrita__intro {
    margin: 0;
    color: var(--tinta-suave);
    font-size: var(--texto-s);
    line-height: 1.45;
  }

  .escrita__form {
    display: flex;
    flex-direction: column;
    gap: 0.6rem;
  }

  .escrita__form select,
  .escrita__form input {
    width: 100%;
    min-height: 42px;
    padding: 0.45rem 0.6rem;
    border: 1.5px solid var(--linha-forte);
    border-radius: 5px;
    background: var(--papel-ficha);
    color: var(--tinta-ficha);
    font-size: var(--texto-s);
  }

  .opcional {
    color: var(--tinta-fraca);
    font-weight: 400;
  }

  .escrita__lista {
    display: flex;
    flex-direction: column;
    gap: 0.4rem;
    padding-top: 0.7rem;
    border-top: 1.5px solid var(--linha);
  }

  .escrita__lista h3 {
    margin: 0;
    color: var(--tinta-suave);
    font-family: var(--fonte-texto);
    font-size: var(--texto-xs);
    font-weight: 700;
    letter-spacing: 0.04em;
    text-transform: uppercase;
  }

  .escrita__lista ul {
    display: flex;
    flex-direction: column;
    gap: 0.4rem;
    margin: 0;
  }

  .escrita__lista li {
    padding-bottom: 0.4rem;
    border-bottom: 1.5px solid var(--linha);
  }

  .escrita__lista li:last-child {
    border-bottom: 0;
    padding-bottom: 0;
  }

  .escrita__palavra {
    margin: 0;
    color: var(--tinta);
    font-family: var(--fonte-titulo);
    font-size: 1.05rem;
    font-weight: 700;
    letter-spacing: -0.02em;
  }

  .escrita__palavra span {
    color: var(--tinta-suave);
    font-family: var(--fonte-texto);
    font-size: var(--texto-xs);
    font-weight: 400;
  }

  .escrita__data {
    margin: 0;
    color: var(--tinta-fraca);
    font-size: var(--texto-xs);
    line-height: 1.35;
  }

  .escrita__vazia {
    margin: 0;
    color: var(--tinta-fraca);
    font-size: var(--texto-xs);
    line-height: 1.4;
  }

  @media (max-width: 950px) {
    .grelha-registos {
      grid-template-columns: 1fr;
    }
  }

  @media (max-width: 620px) {
    .sessao summary {
      flex-wrap: wrap;
    }

    .sessao__valores {
      justify-content: flex-start;
      width: 100%;
      padding-left: 3.1rem;
    }

    .sessao__seta {
      margin-left: auto;
    }

    .filtro-nota {
      margin-left: 0;
    }
  }
</style>
