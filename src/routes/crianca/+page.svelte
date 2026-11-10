<script lang="ts">
  import { resolve } from '$app/paths';
  import { onMount } from 'svelte';
  import { PALAVRAS_NUCLEARES, obterPalavra } from '#lib/data/palavras';
  import { DESCRICAO_TIPO, NOMES_FASE, NOMES_TIPO } from '#lib/data/tipos';
  import { dados } from '#lib/stores/dados.svelte';
  import { parametroUrl } from '#lib/utils/consulta';
  import { dataCurta, plural } from '#lib/utils/formato';
  import EstadoVazio from '#lib/components/EstadoVazio.svelte';
  import Icone from '#lib/components/Icone.svelte';
  import Ilustracao from '#lib/components/Ilustracao.svelte';

  let selecionadaId = $state('');

  onMount(() => {
    const inicial = parametroUrl('crianca');
    if (inicial && dados.criancas.some((c) => c.id === inicial)) {
      selecionadaId = inicial;
    }
  });

  const selecionada = $derived(selecionadaId ? dados.crianca(selecionadaId) : undefined);
  const atividades = $derived(
    selecionada ? dados.recursosDaCrianca(selecionada.id) : []
  );
  const sessoes = $derived(selecionada ? dados.sessoesDaCrianca(selecionada.id) : []);
  const palavrasConhecidas = $derived(
    selecionada
      ? selecionada.palavrasTrabalhadas.map((id) => obterPalavra(id)).filter((p) => p.nuclear)
      : []
  );

  function escolher(id: string) {
    selecionadaId = id;
    document.getElementById('atividades')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
</script>

<svelte:head>
  <title>Área da criança — Palavra Viva</title>
  <meta
    name="description"
    content="Área da criança do Palavra Viva: ouvir a palavra, olhar para a imagem, escolher e tentar outra vez, com poucas opções de cada vez."
  />
</svelte:head>

<section class="abertura">
  <div class="container abertura__interior">
    <div class="abertura__texto">
      <p class="abertura__contexto"><Icone nome="crianca" tamanho={18} /> Área da criança</p>
      <h1>Olá! Vamos ler uma palavra?</h1>
      <p>
        Escolhe o teu nome. Depois ouve com atenção, olha para as imagens e escolhe. Se não
        acertares à primeira, podes tentar outra vez.
      </p>
    </div>
    <div class="abertura__desenho" aria-hidden="true">
      <span class="letra letra--1">p</span>
      <span class="letra letra--2">a</span>
      <span class="letra letra--3">l</span>
      <span class="letra letra--4">a</span>
      <span class="letra letra--5">v</span>
      <span class="letra letra--6">r</span>
      <span class="letra letra--7">a</span>
    </div>
  </div>
</section>

<section class="pagina" aria-labelledby="quem-titulo">
  <div class="container">
    <div class="secao__cabeca cabeca-crianca">
      <div>
        <h2 id="quem-titulo">Quem está a ler hoje?</h2>
        <p class="ajuda">Toca no teu nome. A professora já preparou as atividades.</p>
      </div>
      <p class="nota-turma">
        Turma fictícia do 1.º A. Nenhum dado sai deste computador.
      </p>
    </div>

    <ul class="criancas" aria-label="Escolher criança">
      {#each dados.criancas as crianca (crianca.id)}
        {@const aprovadas = dados.recursosDaCrianca(crianca.id).length}
        <li>
          <button
            type="button"
            class="crianca"
            class:escolhida={selecionadaId === crianca.id}
            style="--cor-aluno: var(--{crianca.cor === 'cobalto' ? 'cobalto' : crianca.cor});"
            aria-pressed={selecionadaId === crianca.id}
            onclick={() => escolher(crianca.id)}
          >
            <span class="crianca__avatar" aria-hidden="true">{crianca.nome.slice(0, 1)}</span>
            <span class="crianca__nome">{crianca.nome}</span>
            <span class="crianca__meta">{crianca.idade} anos · fase {crianca.fase}</span>
            <span class="crianca__atividades">
              {aprovadas} {plural(aprovadas, 'atividade pronta', 'atividades prontas')}
            </span>
            {#if selecionadaId === crianca.id}
              <span class="crianca__check"><Icone nome="check-circulo" tamanho={20} /></span>
            {/if}
          </button>
        </li>
      {/each}
    </ul>
  </div>
</section>

{#if selecionada}
  <section id="atividades" class="secao secao--alt atividades" aria-labelledby="atividades-titulo">
    <div class="container">
      <div class="atividades__topo">
        <div class="atividades__identidade">
          <span class="avatar-grande" aria-hidden="true">{selecionada.nome.slice(0, 1)}</span>
          <div>
            <p class="atividades__ola">As tuas atividades, {selecionada.nome}</p>
            <h2 id="atividades-titulo">O que vamos fazer?</h2>
            <p class="atividades__fase">Fase {selecionada.fase} · {NOMES_FASE[selecionada.fase]}</p>
          </div>
        </div>
        {#if atividades.length > 0}
          <a class="botao botao--primario botao--grande" href={resolve('/crianca/sessao') + '?crianca=' + selecionada.id}>
            <Icone nome="play" tamanho={20} /> Começar a sessão
          </a>
        {/if}
      </div>

      {#if atividades.length === 0}
        <EstadoVazio
          titulo="Ainda não há atividades aprovadas"
          texto="A professora tem de rever e aprovar os recursos antes de aparecerem aqui. Podes pedir-lhe para preparar uma palavra."
          icone="professor"
        >
          <a class="botao botao--secundario botao--pequeno" href={resolve('/professor/biblioteca')}>
            Abrir a biblioteca da professora
          </a>
        </EstadoVazio>
      {:else}
        <ul class="lista-atividades">
          {#each atividades as atividade, indice (atividade.id)}
            {@const palavra = obterPalavra(atividade.palavraId)}
            <li>
              <article class="atividade superficie-ficha">
                <div class="atividade__numero" aria-hidden="true">{indice + 1}</div>
                <div class="atividade__imagem">
                  <Ilustracao palavra={palavra} />
                </div>
                <div class="atividade__texto">
                  <p class="atividade__tipo">{NOMES_TIPO[atividade.tipo]}</p>
                  <h3>{atividade.palavra}</h3>
                  <p>{DESCRICAO_TIPO[atividade.tipo]}</p>
                  <div class="atividade__apoios" aria-label="Apoios disponíveis">
                    {#if atividade.apoios.audio}<span><Icone nome="som" tamanho={15} /> ouvir</span>{/if}
                    {#if atividade.apoios.imagem}<span><Icone nome="olho" tamanho={15} /> ver</span>{/if}
                    {#if atividade.apoios.silabas}<span><Icone nome="silabas" tamanho={15} /> sílabas</span>{/if}
                  </div>
                </div>
                <a
                  class="botao botao--secundario atividade__acao"
                  href={resolve('/crianca/sessao') + '?crianca=' + selecionada.id + '&recurso=' + atividade.id}
                  aria-label="Começar a atividade {NOMES_TIPO[atividade.tipo]} com a palavra {atividade.palavra}"
                >
                  Começar <Icone nome="seta" tamanho={16} />
                </a>
              </article>
            </li>
          {/each}
        </ul>
      {/if}

      <div class="conhece">
        <div class="conhece__cabeca">
          <h3>Palavras que já conheces</h3>
          <p>{palavrasConhecidas.length} de {PALAVRAS_NUCLEARES.length}</p>
        </div>
        {#if palavrasConhecidas.length === 0}
          <p class="conhece__vazia">Ainda não há palavras registadas. A primeira vem já a seguir.</p>
        {:else}
          <ul class="conhece__lista">
            {#each palavrasConhecidas as palavra (palavra.id)}
              <li>
                <span class="conhece__palavra">{palavra.palavra}</span>
                <span class="conhece__silabas">{palavra.silabas.join(' · ')}</span>
              </li>
            {/each}
          </ul>
        {/if}
      </div>

      {#if sessoes.length > 0}
        <p class="ultima">
          <Icone nome="olho" tamanho={16} />
          A tua última sessão foi a {dataCurta(sessoes[0].fim)}. Podes repetir as atividades quando quiseres.
        </p>
      {/if}
    </div>
  </section>
{/if}

<section class="secao como-funciona" aria-labelledby="como-titulo">
  <div class="container">
    <h2 id="como-titulo">Lê com calma. Não há pressa.</h2>
    <ol class="passos">
      <li>
        <span class="passos__icone"><Icone nome="som" tamanho={26} /></span>
        <h3>Ouve</h3>
        <p>Toca no botão do som quantas vezes precisares. Podes ouvir a palavra outra vez.</p>
      </li>
      <li>
        <span class="passos__icone"><Icone nome="olho" tamanho={26} /></span>
        <h3>Olha</h3>
        <p>Vê a imagem e pensa no que a palavra quer dizer. As imagens ajudam a lembrar.</p>
      </li>
      <li>
        <span class="passos__icone"><Icone nome="silabas" tamanho={26} /></span>
        <h3>Escolhe</h3>
        <p>Toca na palavra ou na imagem certa. Se não for essa, podes tentar outra vez.</p>
      </li>
      <li>
        <span class="passos__icone"><Icone nome="check-circulo" tamanho={26} /></span>
        <h3>Confirma</h3>
        <p>No fim, vês o que correu bem. A professora também vê, sem dar notas.</p>
      </li>
    </ol>
  </div>
</section>

<style>
  .abertura {
    background: var(--cobalto);
    color: #fff;
    overflow: hidden;
  }

  .abertura__interior {
    display: grid;
    grid-template-columns: minmax(0, 1.1fr) minmax(0, 0.9fr);
    gap: 1.5rem;
    align-items: center;
    padding-block: clamp(2rem, 5vw, 3.6rem);
  }

  .abertura__contexto {
    display: inline-flex;
    align-items: center;
    gap: 0.4rem;
    margin: 0 0 0.5rem;
    padding: 0.25rem 0.6rem;
    border: 1.5px solid rgba(255, 255, 255, 0.65);
    border-radius: var(--raio-pill);
    color: #fff;
    font-size: var(--texto-s);
    font-weight: 700;
  }

  .abertura h1 {
    max-width: 17ch;
    margin: 0;
    color: #fff;
    font-size: clamp(2.5rem, 1.5rem + 4vw, 4.6rem);
    line-height: 0.96;
  }

  .abertura__texto > p:not(.abertura__contexto) {
    max-width: 46ch;
    margin: 0.8rem 0 0;
    color: #e9eeff;
    font-size: var(--texto-l);
    line-height: 1.45;
  }

  .abertura__desenho {
    position: relative;
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 0.4rem;
    padding: 1.2rem;
  }

  .letra {
    display: grid;
    place-items: center;
    width: clamp(2.6rem, 7vw, 3.8rem);
    height: clamp(2.6rem, 7vw, 3.8rem);
    border: 2px solid var(--tinta-ficha);
    border-radius: 6px;
    background: var(--sol);
    color: var(--tinta-ficha);
    font-family: var(--fonte-titulo);
    font-size: clamp(1.5rem, 4vw, 2.2rem);
    font-weight: 700;
    box-shadow: 4px 4px 0 rgba(15, 25, 48, 0.35);
  }

  .letra:nth-child(2n) {
    background: var(--coral);
    color: #fff;
    transform: rotate(3deg);
  }

  .letra:nth-child(3n) {
    background: var(--menta);
    transform: rotate(-3deg);
  }

  .letra:nth-child(4n) {
    background: var(--papel-ficha);
  }

  @media (prefers-reduced-motion: no-preference) {
    .letra {
      animation: entrar-ficha 500ms cubic-bezier(0.2, 0.7, 0.3, 1) both;
    }

    .letra--1 { animation-delay: 80ms; }
    .letra--2 { animation-delay: 150ms; }
    .letra--3 { animation-delay: 220ms; }
    .letra--4 { animation-delay: 290ms; }
    .letra--5 { animation-delay: 360ms; }
    .letra--6 { animation-delay: 430ms; }
    .letra--7 { animation-delay: 500ms; }
  }

  .cabeca-crianca {
    align-items: start;
  }

  .ajuda {
    margin: 0.6rem 0 0 !important;
    color: var(--tinta-suave);
    font-size: var(--texto-l) !important;
  }

  .nota-turma {
    padding: 0.7rem 0.85rem;
    border: 1.5px solid var(--linha);
    border-radius: var(--raio-ficha);
    background: var(--papel-alto);
    color: var(--tinta-fraca) !important;
    font-size: var(--texto-s) !important;
    line-height: 1.45;
  }

  .criancas {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 0.8rem;
    margin: 0;
  }

  .crianca {
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.2rem;
    width: 100%;
    padding: 1.2rem 0.8rem 1rem;
    border: 2px solid var(--linha-forte);
    border-radius: var(--raio-ficha);
    background: var(--papel-alto);
    color: var(--tinta);
    cursor: pointer;
    text-align: center;
    transition: transform var(--transicao), box-shadow var(--transicao), background-color var(--transicao);
  }

  .crianca:hover {
    transform: translateY(-3px);
    box-shadow: 5px 5px 0 color-mix(in srgb, var(--cor-aluno) 32%, transparent);
  }

  .crianca.escolhida {
    border-color: var(--cor-aluno);
    background: color-mix(in srgb, var(--cor-aluno) 12%, var(--papel-alto));
    box-shadow: 5px 5px 0 var(--cor-aluno);
  }

  .crianca__avatar,
  .avatar-grande {
    display: grid;
    place-items: center;
    border: 2px solid var(--tinta-ficha);
    border-radius: 50%;
    background: var(--cor-aluno);
    color: #fff;
    font-family: var(--fonte-titulo);
    font-weight: 700;
    line-height: 1;
  }

  .crianca__avatar {
    width: 4rem;
    height: 4rem;
    margin-bottom: 0.4rem;
    font-size: 1.9rem;
  }

  .crianca__nome {
    font-family: var(--fonte-titulo);
    font-size: 1.45rem;
    font-weight: 700;
    letter-spacing: -0.03em;
    line-height: 1;
  }

  .crianca__meta {
    color: var(--tinta-suave);
    font-size: var(--texto-xs);
  }

  .crianca__atividades {
    margin-top: 0.35rem;
    padding: 0.15rem 0.45rem;
    border-radius: var(--raio-pill);
    background: var(--papel-ficha);
    color: var(--tinta-ficha);
    font-size: 0.7rem;
    font-weight: 700;
  }

  .crianca__check {
    position: absolute;
    top: 0.45rem;
    right: 0.45rem;
    color: var(--cor-aluno);
    background: var(--papel-alto);
    border-radius: 50%;
  }

  /* Atividades -------------------------------------------------------------- */

  .atividades__topo {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1.2rem;
    margin-bottom: 1.2rem;
  }

  .atividades__identidade {
    display: flex;
    align-items: center;
    gap: 0.8rem;
  }

  .avatar-grande {
    width: 4.4rem;
    height: 4.4rem;
    flex: none;
    background: var(--cobalto);
    font-size: 2rem;
  }

  .atividades__ola {
    margin: 0;
    color: var(--tinta-suave);
    font-size: var(--texto-s);
    font-weight: 700;
  }

  .atividades h2 {
    margin: 0.1rem 0 0;
    font-size: var(--texto-xl);
  }

  .atividades__fase {
    margin: 0.15rem 0 0;
    color: var(--tinta-fraca);
    font-size: var(--texto-s);
  }

  .lista-atividades {
    display: flex;
    flex-direction: column;
    gap: 0.6rem;
  }

  .atividade {
    display: grid;
    grid-template-columns: 2.4rem 5.2rem minmax(0, 1fr) auto;
    gap: 0.8rem;
    align-items: center;
    padding: 0.7rem;
    border: 2px solid var(--linha-forte);
    border-radius: var(--raio-ficha);
    background: var(--papel-ficha);
    color: var(--tinta-ficha);
    box-shadow: 4px 4px 0 color-mix(in srgb, var(--cobalto) 18%, transparent);
  }

  .atividade__numero {
    display: grid;
    place-items: center;
    width: 2rem;
    height: 2rem;
    border: 1.5px solid var(--tinta-ficha);
    border-radius: 50%;
    background: var(--sol);
    color: var(--tinta-ficha);
    font-family: var(--fonte-titulo);
    font-weight: 700;
  }

  .atividade__imagem {
    display: grid;
    place-items: center;
    width: 5.2rem;
    height: 4.4rem;
    padding: 0.2rem;
    border-radius: 50%;
    background: color-mix(in srgb, var(--sol) 26%, var(--papel-ficha));
  }

  .atividade__texto {
    display: flex;
    flex-direction: column;
    gap: 0.1rem;
    min-width: 0;
  }

  .atividade__tipo {
    margin: 0;
    color: var(--link-ficha);
    font-size: var(--texto-xs);
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.03em;
  }

  .atividade h3 {
    margin: 0;
    color: var(--tinta-ficha);
    font-size: 1.7rem;
    letter-spacing: -0.04em;
    line-height: 1;
  }

  .atividade__texto > p:not(.atividade__tipo) {
    margin: 0;
    color: var(--tinta-suave);
    font-size: var(--texto-s);
    line-height: 1.35;
  }

  .atividade__apoios {
    display: flex;
    flex-wrap: wrap;
    gap: 0.45rem;
    margin-top: 0.2rem;
  }

  .atividade__apoios span {
    display: inline-flex;
    align-items: center;
    gap: 0.2rem;
    color: var(--tinta-fraca);
    font-size: 0.68rem;
    font-weight: 700;
  }

  .atividade__acao {
    white-space: nowrap;
  }

  .conhece {
    margin-top: 1.2rem;
    padding: 1rem;
    border: 1.5px solid var(--linha);
    border-radius: var(--raio-ficha);
    background: var(--papel-alto);
  }

  .conhece__cabeca {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    gap: 0.7rem;
    margin-bottom: 0.5rem;
  }

  .conhece h3 {
    margin: 0;
    font-size: var(--texto-l);
  }

  .conhece__cabeca p {
    margin: 0;
    color: var(--tinta-fraca);
    font-size: var(--texto-s);
    font-variant-numeric: tabular-nums;
  }

  .conhece__lista {
    display: flex;
    flex-wrap: wrap;
    gap: 0.4rem;
    margin: 0;
  }

  .conhece__lista li {
    display: flex;
    flex-direction: column;
    padding: 0.3rem 0.55rem;
    border: 1.5px solid var(--linha);
    border-radius: 5px;
    background: var(--papel-ficha);
  }

  .conhece__palavra {
    color: var(--tinta-ficha);
    font-family: var(--fonte-titulo);
    font-weight: 700;
    letter-spacing: -0.03em;
    line-height: 1.1;
  }

  .conhece__silabas {
    color: var(--tinta-fraca);
    font-size: 0.68rem;
  }

  .conhece__vazia {
    margin: 0;
    color: var(--tinta-fraca);
    font-size: var(--texto-s);
  }

  .ultima {
    display: flex;
    align-items: center;
    gap: 0.35rem;
    margin: 1rem 0 0;
    color: var(--tinta-fraca);
    font-size: var(--texto-s);
  }

  /* Como funciona ----------------------------------------------------------- */

  .como-funciona h2 {
    max-width: 20ch;
    margin: 0 0 1.2rem;
    font-size: var(--texto-xl);
  }

  .passos {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 0.8rem;
    margin: 0;
  }

  .passos li {
    display: flex;
    flex-direction: column;
    gap: 0.4rem;
    padding: 1rem;
    border: 1.5px solid var(--linha);
    border-radius: var(--raio-ficha);
    background: var(--papel-alto);
  }

  .passos__icone {
    display: grid;
    place-items: center;
    width: 2.8rem;
    height: 2.8rem;
    border: 1.5px solid var(--linha-forte);
    border-radius: 50%;
    background: var(--sol-fundo);
    color: var(--tinta-ficha);
  }

  .passos h3 {
    margin: 0;
    font-size: 1.2rem;
  }

  .passos p {
    margin: 0;
    color: var(--tinta-suave);
    font-size: var(--texto-s);
    line-height: 1.45;
  }

  @media (max-width: 900px) {
    .criancas {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }

    .passos {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }

    .atividade {
      grid-template-columns: 2rem 4.4rem minmax(0, 1fr);
    }

    .atividade__imagem {
      width: 4.4rem;
      height: 4rem;
    }

    .atividade__acao {
      grid-column: 2 / -1;
      justify-self: start;
    }
  }

  @media (max-width: 700px) {
    .abertura__interior {
      grid-template-columns: 1fr;
    }

    .abertura__desenho {
      justify-content: flex-start;
      padding: 0;
    }

    .atividades__topo {
      flex-direction: column;
      align-items: stretch;
    }

    .atividades__topo .botao {
      width: 100%;
    }
  }

  @media (max-width: 480px) {
    .criancas,
    .passos {
      grid-template-columns: 1fr;
    }

    .atividade {
      grid-template-columns: 2rem minmax(0, 1fr);
    }

    .atividade__imagem {
      grid-column: 2;
      width: 4.4rem;
    }

    .atividade__texto,
    .atividade__acao {
      grid-column: 2;
    }
  }
</style>
