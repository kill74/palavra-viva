<script lang="ts">
  import { goto } from '$app/navigation';
  import { resolve } from '$app/paths';
  import { onMount } from 'svelte';
  import EstadoVazio from '#lib/components/EstadoVazio.svelte';
  import Icone from '#lib/components/Icone.svelte';
  import Ilustracao from '#lib/components/Ilustracao.svelte';
  import LinhaFases from '#lib/components/LinhaFases.svelte';
  import PreviaRecurso from '#lib/components/PreviaRecurso.svelte';
  import SeloEstado from '#lib/components/SeloEstado.svelte';
  import { obterPalavra } from '#lib/data/palavras';
  import { FASES, NOMES_FASE, NOMES_TIPO, type Fase } from '#lib/data/tipos';
  import { dados } from '#lib/stores/dados.svelte';
  import { parametroUrl } from '#lib/utils/consulta';
  import { dataCurta, dataLonga, percentagem, plural } from '#lib/utils/formato';
  import { proximoRecurso, resumoCrianca } from '#lib/utils/recomendacao';

  let criancaId = $state('');
  let busca = $state('');
  let filtroFase = $state<'todas' | Fase>('todas');
  let previaId = $state<string | null>(null);

  onMount(() => {
    const pedido = parametroUrl('crianca');
    if (pedido && dados.crianca(pedido)) criancaId = pedido;
    else if (dados.criancas[0]) criancaId = dados.criancas[0].id;
  });

  const crianca = $derived(criancaId ? dados.crianca(criancaId) : undefined);
  const recursos = $derived(crianca ? dados.recursosDaCrianca(crianca.id, false) : []);
  const filtrados = $derived(
    recursos.filter((r) => {
      const termo = busca.trim().toLocaleLowerCase('pt-PT');
      const alvo = `${r.palavra} ${NOMES_TIPO[r.tipo]} ${NOMES_FASE[r.fase]}`.toLocaleLowerCase('pt-PT');
      return (
        (!termo || alvo.includes(termo)) &&
        (filtroFase === 'todas' || r.fase === filtroFase)
      );
    })
  );
  const aprovados = $derived(filtrados.filter((r) => r.estado === 'aprovado'));
  const rascunhos = $derived(filtrados.filter((r) => r.estado === 'rascunho'));
  const haFiltro = $derived(busca.trim().length > 0 || filtroFase !== 'todas');
  const sessoes = $derived(crianca ? dados.sessoesDaCrianca(crianca.id) : []);
  const resumo = $derived(resumoCrianca(dados.sessoes, criancaId));
  const proximo = $derived(
    crianca ? proximoRecurso(crianca, dados.recursos, dados.sessoes) : undefined
  );

  function trocar(id: string) {
    criancaId = id;
    void goto(`${resolve('/professor/crianca')}?crianca=${encodeURIComponent(id)}`, {
      replaceState: true
    });
  }
</script>

<svelte:head>
  <title>Biblioteca da criança — Palavra Viva</title>
  <meta
    name="description"
    content="Biblioteca individual de cada criança: o que já fez, o que pode fazer a seguir e o que a professora ainda está a preparar."
  />
</svelte:head>

<section class="pagina pagina--ficha">
  <div class="container">
    <p class="migalhas">
      <a href={resolve('/')}>Início</a>
      <span aria-hidden="true">/</span>
      <a href={resolve('/professor')}>Professor</a>
      <span aria-hidden="true">/</span>
      <span>Biblioteca da criança</span>
    </p>

    <div class="cabeca">
      <div>
        <p class="contexto"><Icone nome="livro" tamanho={18} /> Biblioteca da criança</p>
        <h1>O percurso de cada um.</h1>
      </div>
      <div>
        <p>
          Aqui vês o que a criança já trabalhou, o que está aprovado para a próxima sessão e o que
          ainda espera revisão. A fase indica o apoio, não uma nota.
        </p>
        <div class="pagina__acao">
          <a class="botao botao--primario" href={resolve('/professor/criar')}>
            <Icone nome="mais" tamanho={18} /> Criar para esta criança
          </a>
          <a class="botao botao--secundario" href={resolve('/professor')}>
            <Icone nome="voltar" tamanho={18} /> Voltar à turma
          </a>
        </div>
      </div>
    </div>

    <div class="seletor" aria-label="Escolher criança">
      {#each dados.criancas as c (c.id)}
        <button
          type="button"
          class="pastilha"
          class:ativa={c.id === criancaId}
          aria-pressed={c.id === criancaId}
          onclick={() => trocar(c.id)}
        >
          <span class="pastilha__ponto" style="background: var(--{c.cor === 'cobalto' ? 'cobalto' : c.cor});" aria-hidden="true"></span>
          {c.nome}
        </button>
      {/each}
    </div>

    <div class="filtros" aria-label="Filtrar os recursos da criança">
      <div class="campo-filtro">
        <label for="filtro-palavra">Procurar</label>
        <input
          id="filtro-palavra"
          type="search"
          placeholder="palavra, tipo ou fase"
          bind:value={busca}
        />
      </div>
      <div class="campo-filtro">
        <label for="filtro-fase">Fase</label>
        <select id="filtro-fase" bind:value={filtroFase}>
          <option value="todas">Todas</option>
          {#each FASES as fase (fase.numero)}
            <option value={fase.numero}>{fase.numero} — {fase.nome}</option>
          {/each}
        </select>
      </div>
      <button
        type="button"
        class="botao botao--fantasma botao--pequeno limpar"
        disabled={!haFiltro}
        onclick={() => {
          busca = '';
          filtroFase = 'todas';
        }}
      >
        Limpar filtros
      </button>
    </div>
  </div>
</section>

{#if !crianca}
  <div class="container pagina">
    <EstadoVazio
      titulo="Escolhe uma criança"
      texto="Seleciona um nome na turma para ver a biblioteca individual."
      icone="crianca"
    />
  </div>
{:else}
  <div class="container pagina conteudo">
    {#snippet linhaRecurso(recurso: (typeof recursos)[number], acao: 'rever' | 'estado')}
      <li class="item-recurso">
        <div class="item-recurso__linha">
          <span class="lista-recursos__palavra">{recurso.palavra}</span>
          <span class="lista-recursos__meta">{NOMES_TIPO[recurso.tipo]} · fase {recurso.fase}</span>
          {#if acao === 'estado'}
            <SeloEstado estado={recurso.estado} />
          {:else}
            <a
              class="link"
              aria-label="Rever a proposta da palavra {recurso.palavra}"
              href={resolve('/professor/biblioteca') + '?recurso=' + recurso.id}
            >
              Rever
            </a>
          {/if}
          <button
            type="button"
            class="botao botao--fantasma botao--pequeno"
            aria-expanded={previaId === recurso.id}
            aria-label="Ver como a criança vê: {NOMES_TIPO[recurso.tipo]} · {recurso.palavra}"
            onclick={() => (previaId = previaId === recurso.id ? null : recurso.id)}
          >
            <Icone nome="olho" tamanho={15} /> Ver como a criança vê
          </button>
        </div>
        {#if previaId === recurso.id}
          <div class="previa-caixa">
            <PreviaRecurso {recurso} />
          </div>
        {/if}
      </li>
    {/snippet}

    <section class="cartao crianca-cabecalho" aria-labelledby="nome-crianca">
      <div class="identidade-cor" aria-hidden="true" style="background: var(--{crianca.cor === 'cobalto' ? 'cobalto' : crianca.cor});">
        {crianca.nome.charAt(0)}
      </div>
      <div class="crianca-dados">
        <h2 id="nome-crianca">{crianca.nome}</h2>
        <p class="crianca-meta">
          {crianca.idade} {plural(crianca.idade, 'ano', 'anos')} · fase {crianca.fase} · {NOMES_FASE[crianca.fase]}
        </p>
        <p class="crianca-nota">{crianca.nota}</p>
      </div>
      <dl class="mini-numeros">
        <div><dt>Sessões</dt><dd>{resumo.sessoes}</dd></div>
        <div><dt>Respostas</dt><dd>{resumo.respostas}</dd></div>
        <div><dt>Autonomia</dt><dd>{percentagem(resumo.autonomas, resumo.respostas)}%</dd></div>
        <div><dt>Ajudas</dt><dd>{resumo.ajudas}</dd></div>
      </dl>
    </section>

    <section class="bloco" aria-labelledby="fases-titulo">
      <div class="bloco__cabeca">
        <h2 id="fases-titulo">O percurso pelas fases</h2>
        <p>A fase atual é assinalada a vermelho; as anteriores estão concluídas.</p>
      </div>
      <div class="fases">
        <LinhaFases faseAtual={crianca.fase} />
      </div>
    </section>

    <div class="colunas">
      <section class="bloco" aria-labelledby="pode-titulo">
        <div class="bloco__cabeca">
          <h2 id="pode-titulo">O que pode fazer agora</h2>
          <p>{aprovados.length} {plural(aprovados.length, 'atividade aprovada', 'atividades aprovadas')}</p>
        </div>

        {#if proximo}
          <article class="destaque">
            <span class="etiqueta etiqueta--info"><Icone nome="seta" tamanho={14} /> Próxima atividade</span>
            <div class="destaque__corpo">
              <div class="destaque__imagem">
                <Ilustracao palavra={obterPalavra(proximo.palavraId)} />
              </div>
              <div>
                <h3>{proximo.palavra}</h3>
                <p>{NOMES_TIPO[proximo.tipo]} · fase {proximo.fase}</p>
                <a class="link" href={resolve('/crianca/sessao') + '?crianca=' + crianca.id}>
                  Abrir na área da criança
                </a>
              </div>
            </div>
          </article>
        {/if}

        {#if aprovados.length === 0}
          {#if haFiltro}
            <EstadoVazio
              titulo="Nenhuma atividade com estes filtros"
              texto="Limpa a procura ou escolhe outra fase para ver os recursos aprovados."
              icone="lupa"
            />
          {:else}
            <EstadoVazio
              titulo="Ainda não há atividades aprovadas"
              texto="Cria um recurso para esta criança e aprova-o no estúdio."
              icone="livro"
            />
          {/if}
        {:else}
          <ul class="lista-recursos">
            {#each aprovados as recurso (recurso.id)}
              {@render linhaRecurso(recurso, 'estado')}
            {/each}
          </ul>
        {/if}
      </section>

      <section class="bloco" aria-labelledby="preparar-titulo">
        <div class="bloco__cabeca">
          <h2 id="preparar-titulo">A preparar</h2>
          <p>{rascunhos.length} {plural(rascunhos.length, 'rascunho', 'rascunhos')}</p>
        </div>
        {#if rascunhos.length === 0}
          {#if haFiltro}
            <EstadoVazio
              titulo="Nenhum rascunho com estes filtros"
              texto="Limpa a procura ou escolhe outra fase."
              icone="lupa"
            />
          {:else}
            <EstadoVazio
              titulo="Tudo revisto"
              texto="Não há propostas à espera desta criança."
              icone="livro"
            />
          {/if}
        {:else}
          <ul class="lista-recursos">
            {#each rascunhos as recurso (recurso.id)}
              {@render linhaRecurso(recurso, 'rever')}
            {/each}
          </ul>
        {/if}
      </section>
    </div>

    <section class="bloco" aria-labelledby="fez-titulo">
      <div class="bloco__cabeca">
        <h2 id="fez-titulo">O que já fez</h2>
        <p>Palavras trabalhadas e registos das sessões.</p>
      </div>

      {#if crianca.palavrasTrabalhadas.length === 0}
        <EstadoVazio titulo="Ainda sem palavras" texto="As palavras trabalhadas aparecem aqui." icone="livro" />
      {:else}
        <ul class="palavras" aria-label="Palavras já trabalhadas">
          {#each crianca.palavrasTrabalhadas as id (id)}
            {@const palavra = obterPalavra(id)}
            <li>
              <Ilustracao {palavra} />
              <span>{palavra.palavra}</span>
            </li>
          {/each}
        </ul>
      {/if}

      {#if sessoes.length === 0}
        <p class="sem-sessoes">Ainda não há sessões registadas para esta criança.</p>
      {:else}
        <div class="tabela">
          <table>
            <caption class="visualmente-oculto">Sessões de {crianca.nome}</caption>
            <thead>
              <tr><th scope="col">Data</th><th scope="col">Respostas</th><th scope="col">Autónomas</th><th scope="col">Ajudas</th></tr>
            </thead>
            <tbody>
              {#each sessoes as sessao (sessao.id)}
                <tr>
                  <td>{dataLonga(sessao.fim)}</td>
                  <td>{sessao.respostas.length}</td>
                  <td>{sessao.respostas.filter((r) => r.acertouPrimeira).length}</td>
                  <td>{sessao.respostas.reduce((t, r) => t + r.ajudas, 0)}</td>
                </tr>
              {/each}
            </tbody>
          </table>
        </div>
      {/if}

      {#if resumo.ultima}
        <p class="ultima">Última sessão a {dataCurta(resumo.ultima.fim)}.</p>
      {/if}
    </section>
  </div>
{/if}

<style>
  .cabeca {
    display: grid;
    grid-template-columns: minmax(0, 1.15fr) minmax(0, 0.85fr);
    gap: clamp(1.5rem, 4vw, 4rem);
    align-items: end;
    margin-bottom: 1.8rem;
  }

  h1 {
    margin: 0;
    font-size: clamp(2.2rem, 1.4rem + 3vw, 3.6rem);
    line-height: 1.08;
  }

  .cabeca :global(p) {
    max-width: 52ch;
    color: var(--tinta-suave);
    line-height: 1.45;
  }

  .contexto {
    display: flex;
    align-items: center;
    gap: 0.4rem;
    margin: 0 0 0.7rem;
    color: var(--cobalto);
    font-size: var(--texto-s);
    font-weight: 700;
  }

  .seletor {
    display: flex;
    flex-wrap: wrap;
    gap: 0.45rem;
  }

  .pastilha {
    display: inline-flex;
    align-items: center;
    gap: 0.4rem;
    min-height: 44px;
    padding: 0.35rem 0.85rem;
    border: 1.5px solid var(--linha-forte);
    border-radius: var(--raio-pill);
    background: var(--papel-alto);
    color: var(--tinta);
    font-family: var(--fonte-texto);
    font-size: var(--texto-s);
    font-weight: 700;
    cursor: pointer;
    transition: background-color var(--transicao), color var(--transicao);
  }

  .pastilha:hover {
    background: var(--sol-fundo);
  }

  .pastilha.ativa {
    border-color: var(--cobalto);
    background: var(--cobalto);
    color: var(--sobre-acento);
  }

  .pastilha__ponto {
    width: 0.7rem;
    height: 0.7rem;
    border-radius: var(--raio-circulo);
  }

  .filtros {
    display: flex;
    flex-wrap: wrap;
    align-items: end;
    gap: 0.8rem;
    margin-top: 1.3rem;
  }

  .campo-filtro {
    display: grid;
    gap: 0.3rem;
    min-width: min(100%, 12rem);
  }

  .campo-filtro label {
    color: var(--tinta-fraca);
    font-size: var(--texto-mini);
    font-weight: 700;
    letter-spacing: 0.04em;
    text-transform: uppercase;
  }

  .campo-filtro input,
  .campo-filtro select {
    width: 100%;
    min-height: 44px;
    padding: 0.5rem 0.7rem;
    border: 1.5px solid var(--linha-forte);
    border-radius: var(--raio-ficha);
    background: var(--papel-alto);
    color: var(--tinta);
    font-family: var(--fonte-texto);
    font-size: var(--texto-s);
  }

  .campo-filtro input::placeholder {
    color: var(--tinta-fraca);
    opacity: 1;
  }

  .limpar {
    min-height: 44px;
  }

  .conteudo {
    display: grid;
    gap: 1.4rem;
  }

  .cartao,
  .bloco {
    padding: clamp(1.1rem, 2.5vw, 1.8rem);
    border: 1.5px solid var(--linha);
    border-radius: var(--raio-ficha);
    background: var(--papel-alto);
  }

  .crianca-cabecalho {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 1rem;
  }

  .identidade-cor {
    display: grid;
    place-items: center;
    flex: none;
    width: 4.2rem;
    height: 4.2rem;
    border: 2px solid var(--tinta-ficha);
    border-radius: var(--raio-circulo);
    color: var(--sobre-acento);
    font-family: var(--fonte-titulo);
    font-size: var(--texto-grande);
    font-weight: 800;
  }

  .crianca-dados {
    flex: 1 1 14rem;
  }

  .crianca-dados h2 {
    margin: 0;
    font-size: var(--texto-xl);
  }

  .crianca-meta {
    margin: 0.2rem 0 0;
    color: var(--tinta-suave);
    font-size: var(--texto-s);
  }

  .crianca-nota {
    max-width: 50ch;
    margin: 0.4rem 0 0;
    color: var(--tinta-fraca);
    font-size: var(--texto-s);
  }

  .mini-numeros {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 0.8rem;
    margin: 0;
  }

  .mini-numeros div {
    display: grid;
    min-width: 4.5rem;
  }

  .mini-numeros dt {
    color: var(--tinta-fraca);
    font-size: var(--texto-mini);
    text-transform: uppercase;
    letter-spacing: 0.04em;
  }

  .mini-numeros dd {
    margin: 0;
    font-family: var(--fonte-titulo);
    font-size: var(--texto-dado);
    font-weight: 800;
  }

  .bloco__cabeca {
    display: flex;
    flex-wrap: wrap;
    align-items: baseline;
    justify-content: space-between;
    gap: 0.5rem 1.5rem;
    margin-bottom: 1.2rem;
  }

  .bloco__cabeca h2 {
    margin: 0;
    font-size: var(--texto-xl);
  }

  .bloco__cabeca p {
    margin: 0;
    color: var(--tinta-fraca);
    font-size: var(--texto-s);
  }

  .fases {
    padding: 0.4rem 0 0;
    overflow-x: auto;
  }

  .colunas {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 1.4rem;
    align-items: start;
  }

  .destaque {
    margin-bottom: 1rem;
    padding: 0.9rem;
    border: 2px solid var(--cobalto);
    border-radius: var(--raio-ficha);
    background: var(--cobalto-fundo);
  }

  .etiqueta--info {
    display: inline-flex;
    align-items: center;
    gap: 0.3rem;
    padding: 0.2rem 0.55rem;
    border-radius: var(--raio-pill);
    background: var(--cobalto);
    color: var(--sobre-acento);
    font-size: var(--texto-mini);
    font-weight: 700;
  }

  .destaque__corpo {
    display: flex;
    align-items: center;
    gap: 0.9rem;
    margin-top: 0.8rem;
  }

  .destaque__imagem {
    flex: none;
    width: 6rem;
    overflow: hidden;
    border: 1.5px solid var(--linha-forte);
    border-radius: var(--raio-ficha);
    background: var(--papel-ficha);
  }

  .destaque__imagem :global(img) {
    display: block;
    width: 100%;
    height: auto;
  }

  .destaque h3 {
    margin: 0;
    font-size: var(--texto-destaque);
  }

  .destaque p {
    margin: 0.2rem 0 0.5rem;
    color: var(--tinta-suave);
    font-size: var(--texto-s);
  }

  .lista-recursos {
    margin: 0;
    padding: 0;
    list-style: none;
  }

  .lista-recursos li {
    display: block;
    padding: 0.65rem 0;
    border-bottom: 1px solid var(--linha);
  }

  .lista-recursos li:last-child {
    border-bottom: 0;
  }

  .item-recurso__linha {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 0.4rem 0.8rem;
  }

  .item-recurso__linha .botao {
    margin-left: auto;
  }

  .previa-caixa {
    margin-top: 0.9rem;
    padding: 0.5rem;
    border: 1.5px dashed var(--linha);
    border-radius: var(--raio-ficha);
    background: var(--papel);
  }

  .lista-recursos__palavra {
    font-family: var(--fonte-titulo);
    font-size: var(--texto-m);
    font-weight: 800;
  }

  .lista-recursos__meta {
    margin-right: auto;
    color: var(--tinta-fraca);
    font-size: var(--texto-s);
  }

  .palavras {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(7rem, 1fr));
    gap: 0.6rem;
    margin: 0 0 1.2rem;
    padding: 0;
    list-style: none;
  }

  .palavras li {
    display: grid;
    gap: 0.25rem;
    padding: 0.35rem;
    border: 1.5px solid var(--linha);
    border-radius: var(--raio-ficha);
    background: var(--papel);
    text-align: center;
    font-size: var(--texto-s);
    font-weight: 700;
  }

  .palavras :global(img) {
    display: block;
    width: 100%;
    height: auto;
    border-radius: 3px;
  }

  .tabela {
    overflow-x: auto;
  }

  table {
    width: 100%;
    border-collapse: collapse;
    font-size: var(--texto-s);
  }

  th,
  td {
    padding: 0.6rem 0.5rem;
    border-bottom: 1px solid var(--linha);
    text-align: left;
  }

  th {
    /* A tabela herda a superfície de ficha (sempre clara), mesmo no tema escuro. */
    color: var(--tinta-fraca-ficha);
    font-size: var(--texto-mini);
    text-transform: uppercase;
    letter-spacing: 0.04em;
  }

  td {
    color: var(--tinta);
  }

  .sem-sessoes,
  .ultima {
    margin: 1rem 0 0;
    color: var(--tinta-fraca);
    font-size: var(--texto-s);
  }

  :global(html[data-tema='escuro']) .contexto {
    color: var(--link);
  }

  @media (max-width: 860px) {
    .cabeca,
    .colunas {
      grid-template-columns: minmax(0, 1fr);
    }
  }

  @media (max-width: 560px) {
    .mini-numeros {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }

    .identidade-cor {
      width: 3.4rem;
      height: 3.4rem;
    }
  }
</style>
