<script lang="ts">
  import { resolve } from '$app/paths';
  import { PALAVRAS_NUCLEARES } from '#lib/data/palavras';
  import { NOMES_FASE, NOMES_TIPO } from '#lib/data/tipos';
  import { dados } from '#lib/stores/dados.svelte';
  import { dataCurta, hora, plural } from '#lib/utils/formato';
  import Icone from '#lib/components/Icone.svelte';
  import SeloEstado from '#lib/components/SeloEstado.svelte';

  const stats = $derived(dados.estatisticas());
  const porAprovar = $derived(dados.recursosPorAprovar());
  const aprovados = $derived(dados.recursos.filter((r) => r.estado === 'aprovado').length);

  const criancas = $derived(
    dados.criancas.map((crianca) => {
      const sessoes = dados.sessoesDaCrianca(crianca.id);
      return {
        ...crianca,
        recursos: dados.recursosDaCrianca(crianca.id).length,
        sessoes: sessoes.length,
        ultima: sessoes[0],
        progresso: Math.round(
          (crianca.palavrasTrabalhadas.filter((id) =>
            PALAVRAS_NUCLEARES.some((p) => p.id === id)
          ).length /
            PALAVRAS_NUCLEARES.length) *
            100
        )
      };
    })
  );

  const totalPalavras = PALAVRAS_NUCLEARES.length;
</script>

<svelte:head>
  <title>Painel da professora — Palavra Viva</title>
  <meta
    name="description"
    content="Painel da turma fictícia: percursos por criança, recursos por aprovar e registos de sessão do Palavra Viva."
  />
</svelte:head>

<section class="pagina pagina--ficha">
  <div class="container">
    <p class="migalhas">
      <a href={resolve('/')}>Início</a>
      <span aria-hidden="true">/</span>
      <span>Professor</span>
    </p>

    <div class="pagina__cabeca">
      <div>
        <p class="contexto"><Icone nome="professor" tamanho={18} /> Área da professora</p>
        <h1 id="titulo-painel">A turma, palavra a palavra.</h1>
      </div>
      <div>
        <p>
          Cada criança tem um percurso próprio. Aqui vê o que já foi trabalhado, o que espera
          revisão e o que as sessões registaram — sem transformar um acerto numa nota.
        </p>
        <div class="pagina__acao">
          <a class="botao botao--primario" href={resolve('/professor/criar')}>
            <Icone nome="faisca" tamanho={18} /> Criar um recurso
          </a>
          <a class="botao botao--secundario" href={resolve('/professor/biblioteca')}>
            <Icone nome="livro" tamanho={18} /> Abrir biblioteca
          </a>
        </div>
        <p class="pagina__nota">
          <Icone nome="escudo" tamanho={15} /> Turma fictícia de demonstração. Os dados ficam neste browser.
        </p>
      </div>
    </div>

    <div class="cartoes-resumo" aria-label="Resumo da turma">
      <div class="resumo">
        <span class="resumo__rotulo">Crianças</span>
        <strong class="resumo__valor">{dados.criancas.length}</strong>
        <span class="resumo__nota">Turma do 1.º A · demonstração</span>
      </div>
      <div class="resumo">
        <span class="resumo__rotulo">Recursos aprovados</span>
        <strong class="resumo__valor">{aprovados}</strong>
        <span class="resumo__nota">{porAprovar.length} {plural(porAprovar.length, 'proposta espera', 'propostas esperam')} revisão</span>
      </div>
      <div class="resumo">
        <span class="resumo__rotulo">Respostas autónomas</span>
        <strong class="resumo__valor">{stats.percentagemAutonoma}%</strong>
        <span class="resumo__nota">{stats.autonomas} de {stats.respostas} respostas registadas</span>
      </div>
      <div class="resumo">
        <span class="resumo__rotulo">Sessões</span>
        <strong class="resumo__valor">{stats.sessoes}</strong>
        <span class="resumo__nota">{stats.ajudas} {plural(stats.ajudas, 'ajuda usada', 'ajudas usadas')}</span>
      </div>
    </div>
  </div>
</section>

<section class="pagina" aria-labelledby="turma-titulo">
  <div class="container">
    <div class="secao__cabeca">
      <div>
        <h2 id="turma-titulo">Percursos em curso</h2>
        <p class="subtitulo">A fase indica o apoio que a criança recebe; não é um ano nem um nível de avaliação.</p>
      </div>
      <p>
        A sequência tem 28 palavras nucleares. O progresso conta as palavras já registadas como
        trabalhadas, não a velocidade com que são aprendidas.
      </p>
    </div>

    <div class="turma">
      {#each criancas as crianca (crianca.id)}
        <article class="aluno" style="--cor-aluno: var(--{crianca.cor === 'cobalto' ? 'cobalto' : crianca.cor});">
          <div class="aluno__topo">
            <div>
              <h3>{crianca.nome}</h3>
              <p class="aluno__meta">{crianca.idade} anos · fase {crianca.fase} · {NOMES_FASE[crianca.fase]}</p>
            </div>
            <span class="aluno__inicial" aria-hidden="true">{crianca.nome.slice(0, 1)}</span>
          </div>

          <p class="aluno__nota">{crianca.nota}</p>

          <div class="aluno__progresso">
            <div class="aluno__rotulo">
              <span>Palavras trabalhadas</span>
              <strong>{crianca.palavrasTrabalhadas.length} de {totalPalavras}</strong>
            </div>
            <div class="barra" role="img" aria-label="{crianca.palavrasTrabalhadas.length} de {totalPalavras} palavras trabalhadas">
              <span style="width: {Math.min(100, crianca.progresso)}%"></span>
            </div>
          </div>

          <dl class="aluno__numeros">
            <div><dt>Atividades</dt><dd>{crianca.recursos}</dd></div>
            <div><dt>Sessões</dt><dd>{crianca.sessoes}</dd></div>
            <div>
              <dt>Última</dt>
              <dd>{crianca.ultima ? dataCurta(crianca.ultima.fim) : '—'}</dd>
            </div>
          </dl>

          <div class="aluno__acoes">
            <a class="link" href={resolve('/professor/sessoes') + '?crianca=' + crianca.id}>Ver registos</a>
            <a class="botao botao--pequeno botao--secundario" href={resolve('/crianca/sessao') + '?crianca=' + crianca.id}>
              Abrir sessão <Icone nome="seta" tamanho={15} />
            </a>
          </div>
        </article>
      {/each}
    </div>
  </div>
</section>

<section class="secao secao--alt" aria-labelledby="revisao-titulo">
  <div class="container revisao-grade">
    <div class="revisao-texto">
      <span class="etiqueta etiqueta--aviso"><Icone nome="alerta" tamanho={14} /> Revisão humana</span>
      <h2 id="revisao-titulo">Nada chega à criança sem passar por aqui.</h2>
      <p>
        A IA prepara uma proposta a partir do pedido da professora. As verificações automáticas
        assinalam o que pode estar errado, mas a decisão de aprovar é sempre humana.
      </p>
      <ol class="passos-mini">
        <li><strong>1.</strong> Escolher palavra, fase, tipo e número de opções.</li>
        <li><strong>2.</strong> Rever a proposta, corrigir campos e confirmar o áudio.</li>
        <li><strong>3.</strong> Aprovar. Só então a atividade aparece na área da criança.</li>
      </ol>
      <a class="link" href={resolve('/professor/criar')}>Começar um recurso novo</a>
    </div>

    <div class="fila ficha">
      <div class="ficha__topo">
        <span>Por aprovar</span>
        <span class="etiqueta etiqueta--neutra">{porAprovar.length} {plural(porAprovar.length, 'item', 'itens')}</span>
      </div>
      {#if porAprovar.length === 0}
        <div class="fila-vazia">
          <Icone nome="check-circulo" tamanho={26} />
          <p>Tudo revisto. Quando criares uma proposta, ela aparece aqui até ser aprovada.</p>
        </div>
      {:else}
        <ul class="fila-lista">
          {#each porAprovar as recurso (recurso.id)}
            {@const crianca = dados.crianca(recurso.criancaId)}
            <li>
              <div class="fila-item">
                <div class="fila-item__texto">
                  <p class="fila-item__palavra">{recurso.palavra}</p>
                  <p class="fila-item__meta">
                    {NOMES_TIPO[recurso.tipo]} · {crianca?.nome ?? 'criança'} · {NOMES_FASE[recurso.fase]}
                  </p>
                  <p class="fila-item__data">Criado a {dataCurta(recurso.criadoEm)}, {hora(recurso.criadoEm)}</p>
                  <SeloEstado estado={recurso.estado} />
                </div>
                <a class="botao botao--pequeno botao--secundario" href={resolve('/professor/biblioteca') + '?recurso=' + recurso.id}>
                  Rever <Icone nome="seta" tamanho={14} />
                </a>
              </div>
            </li>
          {/each}
        </ul>
      {/if}
      <div class="fila-rodape">
        <a class="link" href={resolve('/professor/biblioteca')}>Ver todos os recursos</a>
      </div>
    </div>
  </div>
</section>

<section class="pagina" aria-labelledby="atalhos-titulo">
  <div class="container">
    <h2 id="atalhos-titulo" class="titulo-atalhos">O que precisas agora?</h2>
    <div class="atalhos">
      <a class="atalho" href={resolve('/professor/criar')}>
        <Icone nome="faisca" tamanho={24} />
        <h3>Criar com IA</h3>
        <p>Dar o contexto, receber uma proposta e revê-la antes de aprovar.</p>
      </a>
      <a class="atalho" href={resolve('/professor/biblioteca')}>
        <Icone nome="livro" tamanho={24} />
        <h3>Biblioteca</h3>
        <p>Filtrar por criança, palavra ou estado. Editar, aprovar, imprimir.</p>
      </a>
      <a class="atalho" href={resolve('/professor/sessoes')}>
        <Icone nome="olho" tamanho={24} />
        <h3>Registos</h3>
        <p>Tentativas, ajudas e autonomia por sessão. Exportar em CSV.</p>
      </a>
      <a class="atalho" href={resolve('/crianca')}>
        <Icone nome="crianca" tamanho={24} />
        <h3>Área da criança</h3>
        <p>Ver o que a criança encontra: poucas escolhas, instruções curtas.</p>
      </a>
    </div>
  </div>
</section>

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

  .subtitulo {
    max-width: 48ch;
    margin-top: 0.5rem !important;
    color: var(--tinta-suave);
    font-size: var(--texto-m) !important;
    line-height: 1.45;
  }

  .turma {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 0.85rem;
  }

  .aluno {
    display: flex;
    flex-direction: column;
    gap: 0.7rem;
    padding: 1rem;
    border: 2px solid var(--linha-forte);
    border-top: 6px solid var(--cor-aluno);
    border-radius: var(--raio-ficha);
    background: var(--papel-alto);
    box-shadow: 4px 4px 0 color-mix(in srgb, var(--cor-aluno) 22%, transparent);
  }

  .aluno__topo {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 0.5rem;
  }

  .aluno h3 {
    margin: 0;
    font-size: 1.55rem;
    letter-spacing: -0.03em;
  }

  .aluno__meta {
    margin: 0.15rem 0 0;
    color: var(--tinta-suave);
    font-size: var(--texto-xs);
    line-height: 1.35;
  }

  .aluno__inicial {
    display: grid;
    place-items: center;
    width: 2.4rem;
    height: 2.4rem;
    flex: none;
    border: 1.5px solid var(--linha-forte);
    border-radius: 50%;
    background: var(--cor-aluno);
    color: #fff;
    font-family: var(--fonte-titulo);
    font-size: 1.2rem;
    font-weight: 700;
    line-height: 1;
  }

  .aluno__nota {
    flex: 1;
    margin: 0;
    color: var(--tinta-suave);
    font-size: var(--texto-s);
    line-height: 1.45;
  }

  .aluno__rotulo {
    display: flex;
    justify-content: space-between;
    gap: 0.5rem;
    margin-bottom: 0.3rem;
    color: var(--tinta-suave);
    font-size: var(--texto-xs);
  }

  .aluno__rotulo strong {
    color: var(--tinta);
    font-variant-numeric: tabular-nums;
  }

  .aluno__numeros {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 0.4rem;
    margin: 0;
    padding-top: 0.6rem;
    border-top: 1.5px solid var(--linha);
  }

  .aluno__numeros dt {
    color: var(--tinta-fraca);
    font-size: 0.68rem;
  }

  .aluno__numeros dd {
    margin: 0;
    color: var(--tinta);
    font-family: var(--fonte-titulo);
    font-size: 1.15rem;
    font-weight: 700;
    line-height: 1.1;
    font-variant-numeric: tabular-nums;
  }

  .aluno__acoes {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: space-between;
    gap: 0.4rem;
    margin-top: auto;
    padding-top: 0.6rem;
    border-top: 1.5px solid var(--linha);
  }

  .aluno__acoes .link {
    font-size: var(--texto-s);
  }

  /* Revisão ----------------------------------------------------------------- */

  .revisao-grade {
    display: grid;
    grid-template-columns: minmax(0, 0.9fr) minmax(0, 1.1fr);
    gap: clamp(1.5rem, 4vw, 4rem);
    align-items: center;
  }

  .revisao-texto {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 0.85rem;
  }

  .revisao-texto h2 {
    margin: 0;
    max-width: 16ch;
  }

  .revisao-texto > p {
    max-width: 49ch;
    margin: 0;
    color: var(--tinta-suave);
    line-height: 1.55;
  }

  .passos-mini {
    display: flex;
    flex-direction: column;
    gap: 0.35rem;
    margin: 0;
    padding: 0;
  }

  .passos-mini li {
    color: var(--tinta-suave);
    font-size: var(--texto-s);
    line-height: 1.4;
  }

  .passos-mini strong {
    display: inline-grid;
    place-items: center;
    width: 1.35rem;
    height: 1.35rem;
    margin-right: 0.3rem;
    border-radius: 50%;
    background: var(--sol);
    color: var(--tinta-ficha);
    font-size: 0.75rem;
  }

  .fila {
    overflow: hidden;
  }

  .fila-lista {
    display: flex;
    flex-direction: column;
    margin: 0;
  }

  .fila-lista li + li {
    border-top: 1.5px solid var(--linha);
  }

  .fila-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.8rem;
    padding: 0.85rem 1rem;
  }

  .fila-item__texto {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 0.15rem;
    min-width: 0;
  }

  .fila-item__palavra {
    margin: 0;
    color: var(--tinta-ficha);
    font-family: var(--fonte-titulo);
    font-size: 1.35rem;
    font-weight: 700;
    letter-spacing: -0.03em;
    line-height: 1.05;
  }

  .fila-item__meta {
    margin: 0;
    color: var(--tinta-suave);
    font-size: var(--texto-xs);
    line-height: 1.35;
  }

  .fila-item__data {
    margin: 0 0 0.2rem;
    color: var(--tinta-fraca);
    font-size: var(--texto-xs);
  }

  .fila-vazia {
    display: flex;
    align-items: center;
    gap: 0.6rem;
    padding: 1.2rem 1rem;
    color: var(--sucesso);
  }

  .fila-vazia p {
    margin: 0;
    color: var(--tinta-suave);
    font-size: var(--texto-s);
    line-height: 1.45;
  }

  .fila-rodape {
    padding: 0.7rem 1rem;
    border-top: 1.5px solid var(--linha);
    background: var(--papel-alto);
  }

  .fila-rodape .link {
    font-size: var(--texto-s);
  }

  /* Atalhos ----------------------------------------------------------------- */

  .titulo-atalhos {
    margin: 0 0 1.2rem;
    font-size: var(--texto-xl);
  }

  .atalhos {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 0.75rem;
  }

  .atalho {
    display: flex;
    flex-direction: column;
    gap: 0.4rem;
    padding: 1rem;
    border: 1.5px solid var(--linha);
    border-radius: var(--raio-ficha);
    background: var(--papel-alto);
    color: var(--tinta);
    text-decoration: none;
    transition: border-color var(--transicao), background-color var(--transicao), transform var(--transicao);
  }

  .atalho:hover {
    border-color: var(--linha-forte);
    background: var(--sol-fundo);
    transform: translateY(-2px);
  }

  .atalho :global(svg) {
    color: var(--cobalto);
  }

  :global(html[data-tema='escuro']) .atalho :global(svg) {
    color: var(--link);
  }

  .atalho h3 {
    margin: 0;
    font-size: 1.15rem;
  }

  .atalho p {
    margin: 0;
    color: var(--tinta-suave);
    font-size: var(--texto-s);
    line-height: 1.45;
  }

  @media (max-width: 1100px) {
    .turma {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }

    .atalhos {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
  }

  @media (max-width: 860px) {
    .revisao-grade {
      grid-template-columns: 1fr;
    }
  }

  @media (max-width: 560px) {
    .turma,
    .atalhos {
      grid-template-columns: 1fr;
    }

    .fila-item {
      align-items: flex-start;
      flex-direction: column;
    }

    .fila-item .botao {
      width: 100%;
    }
  }
</style>