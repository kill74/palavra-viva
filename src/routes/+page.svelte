<script lang="ts">
  import { resolve } from '$app/paths';
  import { RECURSOS_DEMO } from '#lib/data/demo';
  import { NOMES_FASE } from '#lib/data/tipos';
  import { obterPalavra } from '#lib/data/palavras';
  import { dados } from '#lib/stores/dados.svelte';
  import BotaoAudio from '#lib/components/BotaoAudio.svelte';
  import Icone from '#lib/components/Icone.svelte';
  import Ilustracao from '#lib/components/Ilustracao.svelte';
  import ListaValidacao from '#lib/components/ListaValidacao.svelte';
  import MesaSilabas from '#lib/components/MesaSilabas.svelte';
  import MuralPalavras from '#lib/components/MuralPalavras.svelte';

  const uva = obterPalavra('uva');
  const galinha = obterPalavra('galinha');
  const exemplo = $derived(
    dados.recurso('rec-alice-galinha') ??
      RECURSOS_DEMO.find((r) => r.id === 'rec-alice-galinha')!
  );
  const stats = $derived(dados.estatisticas());
  const percentagemApoio = $derived(100 - stats.percentagemAutonoma);
</script>

<svelte:head>
  <title>Palavra Viva — aprender a ler pelo método das 28 palavras</title>
  <meta
    name="description"
    content="Um sistema interactivo para aprender a ler pelo método das 28 palavras: a professora prepara e aprova, a criança ouve, lê e constrói."
  />
  <meta property="og:title" content="Palavra Viva — ler começa numa palavra" />
  <meta
    property="og:description"
    content="Método das 28 palavras, com revisão da professora antes de cada atividade. Protótipo académico com dados fictícios."
  />
</svelte:head>

<section class="hero" aria-labelledby="hero-titulo">
  <div class="container hero__grade">
    <div class="hero__texto">
      <p class="hero__contexto">Para o 1.º ciclo, com a professora no comando.</p>
      <h1 id="hero-titulo">
        <span class="linha">Ler começa numa palavra</span>
        <span class="linha">que a criança já conhece.</span>
      </h1>
      <p class="hero__sub">
        O Palavra Viva leva o método das 28 palavras para a sala: a professora escolhe a palavra,
        a fase e o apoio; a criança ouve, lê e constrói. Nenhum recurso aparece sem revisão.
      </p>
      <div class="hero__acoes">
        <a class="botao botao--primario botao--grande" href={resolve('/professor')}>
          <Icone nome="lapis" tamanho={19} /> Preparar uma aula
        </a>
        <a class="botao botao--secundario botao--grande" href={resolve('/crianca')}>
          <Icone nome="crianca" tamanho={19} /> Entrar como criança
        </a>
      </div>
      <p class="hero__nota">
        <Icone nome="escudo" tamanho={16} />
        Protótipo com dados fictícios. Os registos ficam neste browser.
      </p>
    </div>

    <div class="hero__mesa">
      <MesaSilabas />
      <p class="hero__indicacao">Experimenta: escolhe uma imagem e constrói a palavra.</p>
    </div>
  </div>
</section>

<section class="secao" aria-labelledby="areas-titulo">
  <div class="container">
    <div class="secao__cabeca">
      <h2 id="areas-titulo">Duas áreas, o mesmo cuidado.</h2>
      <p>
        A professora decide o que entra. A criança encontra poucas escolhas de cada vez, com
        instruções curtas e ajuda repetível.
      </p>
    </div>

    <div class="areas">
      <article class="area area--professor">
        <div class="area__topo">
          <span class="etiqueta etiqueta--info">Área do professor</span>
          <Icone nome="professor" tamanho={28} />
        </div>
        <h3>Preparar, rever e aprovar.</h3>
        <p>
          O estúdio parte da palavra e da fase. Devolve uma proposta, mostra o que validou e
          deixa corrigir antes de a criança ver.
        </p>
        <ul class="lista-check">
          <li><Icone nome="check" tamanho={17} /> Palavra, fase, tipo e número de opções.</li>
          <li><Icone nome="check" tamanho={17} /> Ortografia, sílabas, imagem e pronúncia.</li>
          <li><Icone nome="check" tamanho={17} /> Registo de tentativas e ajudas por sessão.</li>
        </ul>
        <a class="link" href={resolve('/professor')}>Abrir o painel da turma</a>
      </article>

      <article class="area area--crianca">
        <div class="area__topo">
          <span class="etiqueta">Área da criança</span>
          <Icone nome="crianca" tamanho={28} />
        </div>
        <h3>Uma escolha de cada vez.</h3>
        <p>
          A criança ouve a palavra, olha para a imagem e escolhe. Se errar, recebe uma pista
          concreta e pode tentar outra vez.
        </p>

        <div class="mini-ficha">
          <div class="mini-ficha__imagem"><Ilustracao palavra={uva} /></div>
          <div class="mini-ficha__texto">
            <span class="mini-ficha__palavra">uva</span>
            <span class="mini-ficha__silabas">u + va</span>
          </div>
          <BotaoAudio
            src={uva.audio}
            rotulo="Ouvir"
            rotuloAria="Ouvir a palavra uva"
            tamanho="pequeno"
            variante="fantasma"
          />
        </div>

        <a class="link link--claro" href={resolve('/crianca')}>Entrar na sessão de leitura</a>
      </article>
    </div>
  </div>
</section>

<section class="secao secao--alt" aria-labelledby="percurso-titulo">
  <div class="container">
    <div class="secao__cabeca">
      <h2 id="percurso-titulo">A palavra inteira vem primeiro.</h2>
      <p>
        A criança começa por reconhecer uma palavra com significado. Só depois a separa, a
        recombina e a lê dentro de uma frase.
      </p>
    </div>

    <ol class="percurso">
      <li>
        <span class="percurso__marca" aria-hidden="true">1</span>
        <h3>Palavra inteira</h3>
        <p>Vê a imagem, ouve «menina» e encontra a palavra.</p>
        <span class="exemplo">menina</span>
      </li>
      <li>
        <span class="percurso__marca" aria-hidden="true">2</span>
        <h3>Sem apoio</h3>
        <p>Escolhe a forma escrita sem depender só da imagem.</p>
        <span class="exemplo">menina / menino / uva</span>
      </li>
      <li>
        <span class="percurso__marca" aria-hidden="true">3</span>
        <h3>Separar sílabas</h3>
        <p>Ouve cada parte e reconstrói a palavra.</p>
        <span class="exemplo">me · ni · na</span>
      </li>
      <li>
        <span class="percurso__marca" aria-hidden="true">4</span>
        <h3>Combinar</h3>
        <p>Junta partes conhecidas para descobrir outra palavra.</p>
        <span class="exemplo">pa + to = pato</span>
      </li>
      <li>
        <span class="percurso__marca" aria-hidden="true">5</span>
        <h3>Ler uma frase</h3>
        <p>Lê uma frase curta e escolhe a imagem que combina.</p>
        <span class="exemplo">O menino usa o sapato.</span>
      </li>
    </ol>

    <div class="nota-escrita superficie-ficha">
      <Icone nome="lapis" tamanho={22} />
      <p>
        A escrita manual não é substituída por um ecrã. A aplicação pode gerar uma ficha de
        cópia em papel e a professora regista a conclusão.
      </p>
      <a class="link" href={resolve('/metodo#escrita')}>Ver a fase de escrita</a>
    </div>
  </div>
</section>

<section class="secao" aria-labelledby="palavras-titulo">
  <div class="container">
    <div class="secao__cabeca">
      <h2 id="palavras-titulo">As 28 palavras, por inteiro.</h2>
      <p>
        Esta é a sequência adotada no protótipo: a do enunciado, com «mamã» e «gema». A variante
        com «dedo» existe, mas não se mistura com esta ordem.
      </p>
    </div>
    <MuralPalavras />
    <p class="mais-abaixo">
      <a class="link" href={resolve('/metodo#sequencia')}>Ver a sequência, a variante e as referências</a>
    </p>
  </div>
</section>

<section class="secao secao--alt" aria-labelledby="ia-titulo">
  <div class="container">
    <div class="secao__cabeca">
      <h2 id="ia-titulo">A IA propõe. A professora decide.</h2>
      <p>
        O pedido é pequeno e explícito. A proposta é validada por regras e fica em rascunho
        até alguém a aprovar. A IA nunca chega sozinha à criança.
      </p>
    </div>

    <div class="estudio superficie-ficha">
      <article class="estudio__passo">
        <div class="estudio__numero">1</div>
        <h3>A professora dá o contexto</h3>
        <p>Palavra, fase, tipo de atividade e número de opções. Sem isto, a proposta não começa.</p>
        <dl class="pedido">
          <div><dt>Palavra</dt><dd>galinha</dd></div>
          <div><dt>Fase</dt><dd>3, sílabas</dd></div>
          <div><dt>Atividade</dt><dd>associar som e imagem</dd></div>
          <div><dt>Opções</dt><dd>3</dd></div>
        </dl>
        <p class="prompt-exemplo">«As opções devem afastar-se o suficiente para não testar apenas a memória visual. Mantém o áudio em português europeu.»</p>
      </article>

      <article class="estudio__passo estudio__passo--proposta">
        <div class="estudio__numero">2</div>
        <h3>A IA prepara uma proposta</h3>
        <div class="proposta">
          <div class="proposta__imagem"><Ilustracao palavra={galinha} /></div>
          <div>
            <p class="proposta__palavra">galinha</p>
            <p class="proposta__silabas">ga + li + nha</p>
            <p class="proposta__frase">«A galinha põe um ovo.»</p>
          </div>
        </div>
        <div class="proposta__opcoes" aria-label="Imagens propostas">
          {#each exemplo.opcoes as id}
            {@const p = obterPalavra(id)}
            <span class:correta={id === exemplo.palavraId}>
              <Ilustracao palavra={p} />
            </span>
          {/each}
        </div>
        <p class="rascunho"><Icone nome="olho" tamanho={16} /> Em rascunho. Ainda não está visível para a criança.</p>
      </article>

      <article class="estudio__passo">
        <div class="estudio__numero">3</div>
        <h3>A validação e a professora aprovam</h3>
        <ListaValidacao itens={exemplo.validacao} titulo="Verificação da proposta" />
        <p class="revisao">
          «Galinheiro» foi retirado da primeira proposta por pertencer à mesma família e poder
          confundir o referente. A opção passou a «cenoura».
        </p>
        <div class="linha">
          <a class="botao botao--secundario botao--pequeno" href={resolve('/professor/biblioteca?recurso=rec-alice-galinha')}>
            Rever este recurso
          </a>
          <a class="link" href={resolve('/metodo#ia')}>Ver o registo do prompt</a>
        </div>
      </article>
    </div>
  </div>
</section>

<section class="secao" aria-labelledby="registo-titulo">
  <div class="container registo">
    <div class="registo__texto">
      <h2 id="registo-titulo">O que fica registado.</h2>
      <p>
        A sessão guarda tentativas, ajudas e tempo. A distinção importante não é «certo ou
        errado»: é entre uma resposta autónoma e uma resposta apoiada.
      </p>
      <p class="cita">
        «Uma resposta correta isolada não demonstra domínio da leitura.»
        <span>Enunciado do projeto</span>
      </p>
      <a class="link" href={resolve('/professor/sessoes')}>Ver os registos da turma fictícia</a>
    </div>

    <div class="painel-registo ficha">
      <div class="ficha__topo">
        <span>Turma do 1.º A · demonstração</span>
        <span class="etiqueta etiqueta--ok">dados fictícios</span>
      </div>
      <div class="painel-registo__corpo">
        <div class="metrica">
          <div class="metrica__rotulo"><span>Respostas autónomas</span><strong>{stats.autonomas} de {stats.respostas}</strong></div>
          <div class="barra"><span style="width: {stats.percentagemAutonoma}%"></span></div>
        </div>
        <div class="metrica">
          <div class="metrica__rotulo"><span>Com apoio</span><strong>{stats.apoiadas} de {stats.respostas}</strong></div>
          <div class="barra barra--coral"><span style="width: {percentagemApoio}%"></span></div>
        </div>
        <dl class="numeros">
          <div><dt>Sessões</dt><dd>{stats.sessoes}</dd></div>
          <div><dt>Ajudas usadas</dt><dd>{stats.ajudas}</dd></div>
          <div><dt>Áudio pedido</dt><dd>{stats.audio}</dd></div>
        </dl>
        <p class="painel-registo__nota">
          {#if dados.sessoes.length > 0}
            Última sessão: {dados.criancas.find((c) => c.id === dados.sessoes[0].criancaId)?.nome ?? 'criança'},
            {NOMES_FASE[dados.criancas.find((c) => c.id === dados.sessoes[0].criancaId)?.fase ?? 1].toLowerCase()}.
          {:else}
            Ainda não há sessões registadas.
          {/if}
        </p>
      </div>
    </div>
  </div>
</section>

<section class="cta" aria-labelledby="cta-titulo">
  <div class="container cta__interior">
    <div>
      <h2 id="cta-titulo">A próxima palavra pode ser hoje.</h2>
      <p>
        Prepara uma atividade, revê a proposta e abre a sessão da criança. O percurso completo
        está a um clique.
      </p>
    </div>
    <div class="cta__acoes">
      <a class="botao botao--secundario botao--grande" href={resolve('/professor')}>Preparar uma aula</a>
      <a class="botao botao--fantasma botao--grande" href={resolve('/crianca')}>Entrar como criança</a>
      <a class="cta__metodo" href={resolve('/metodo')}>Ler a metodologia e os limites</a>
    </div>
  </div>
</section>

<style>
  .hero {
    position: relative;
    overflow: hidden;
    padding-block: clamp(2.4rem, 6vw, 5.5rem) clamp(3rem, 7vw, 6rem);
    border-bottom: 1.5px solid var(--linha);
  }

  .hero::before {
    content: '';
    position: absolute;
    top: 0;
    bottom: 0;
    left: max(1rem, calc((100% - var(--largura)) / 2 - 2rem));
    width: 3px;
    background: var(--coral);
    opacity: 0.7;
  }

  .hero__grade {
    display: grid;
    grid-template-columns: minmax(0, 1.02fr) minmax(0, 0.98fr);
    gap: clamp(2rem, 5vw, 4.5rem);
    align-items: center;
  }

  .hero__texto {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 1.1rem;
  }

  .hero__contexto {
    margin: 0;
    padding-left: 0.75rem;
    border-left: 4px solid var(--sol);
    color: var(--tinta-suave);
    font-size: var(--texto-s);
    font-weight: 700;
  }

  h1 {
    max-width: 12.5ch;
    margin: 0;
    font-size: clamp(2.8rem, 1.2rem + 5.7vw, 5.5rem);
    line-height: 0.92;
  }

  .linha {
    display: block;
  }

  @media (prefers-reduced-motion: no-preference) {
    .hero__contexto,
    h1 .linha,
    .hero__sub,
    .hero__acoes,
    .hero__nota {
      animation: entrar-texto 600ms cubic-bezier(0.2, 0.7, 0.3, 1) both;
    }

    .hero__contexto { animation-delay: 40ms; }
    h1 .linha:first-child { animation-delay: 110ms; }
    h1 .linha:last-child { animation-delay: 180ms; }
    .hero__sub { animation-delay: 260ms; }
    .hero__acoes { animation-delay: 330ms; }
    .hero__nota { animation-delay: 400ms; }

    .hero__mesa {
      animation: entrar-ficha 700ms cubic-bezier(0.2, 0.7, 0.3, 1) 220ms both;
    }
  }

  .hero__sub {
    max-width: 47ch;
    margin: 0;
    color: var(--tinta-suave);
    font-size: var(--texto-l);
    line-height: 1.45;
  }

  .hero__acoes {
    display: flex;
    flex-wrap: wrap;
    gap: 0.7rem;
    margin-top: 0.4rem;
  }

  .hero__nota {
    display: flex;
    align-items: center;
    gap: 0.4rem;
    margin: 0;
    color: var(--tinta-fraca);
    font-size: var(--texto-s);
  }

  .hero__mesa {
    display: flex;
    flex-direction: column;
    gap: 0.7rem;
    align-items: flex-end;
  }

  .hero__indicacao {
    margin: 0;
    padding-right: 0.8rem;
    color: var(--tinta-fraca);
    font-size: var(--texto-s);
    text-align: right;
  }

  /* Áreas ------------------------------------------------------------------ */

  .areas {
    display: grid;
    grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
    gap: 1.2rem;
    align-items: stretch;
  }

  .area {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 0.8rem;
    padding: clamp(1.2rem, 3vw, 2rem);
    border: 2px solid var(--linha-forte);
    border-radius: var(--raio-ficha);
  }

  .area--professor {
    background: var(--papel-alto);
    box-shadow: 5px 5px 0 color-mix(in srgb, var(--cobalto) 32%, transparent);
  }

  .area--crianca {
    background: var(--cobalto);
    color: #fff;
  }

  .area--crianca h3,
  .area.area--crianca p {
    color: #fff;
  }

  .area__topo {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    color: var(--cobalto);
  }

  .area--crianca .area__topo {
    color: #fff;
  }

  .area h3 {
    margin: 0;
    font-size: clamp(1.6rem, 1.2rem + 1vw, 2.2rem);
  }

  .area p {
    max-width: 44ch;
    margin: 0;
    color: var(--tinta-suave);
    line-height: 1.5;
  }

  .area--crianca .etiqueta {
    color: #fff;
    border-color: #fff;
    background: transparent;
  }

  .lista-check {
    display: flex;
    flex-direction: column;
    gap: 0.35rem;
    margin: 0.2rem 0 0.4rem;
  }

  .lista-check li {
    display: flex;
    align-items: flex-start;
    gap: 0.4rem;
    color: var(--tinta-suave);
    font-size: var(--texto-s);
    line-height: 1.4;
  }

  .lista-check :global(svg) {
    flex: none;
    margin-top: 0.15rem;
    color: var(--sucesso);
  }

  .area--crianca .link {
    color: #fff;
    text-decoration-color: var(--sol);
  }

  .area--crianca .link:hover {
    color: var(--tinta-ficha);
  }

  .mini-ficha {
    display: flex;
    align-items: center;
    gap: 0.7rem;
    width: 100%;
    margin: 0.3rem 0;
    padding: 0.55rem;
    border: 2px solid var(--tinta-ficha);
    border-radius: 5px;
    background: var(--papel-ficha);
    color: var(--tinta-ficha);
  }

  .mini-ficha__imagem {
    width: 4.6rem;
    flex: none;
    padding: 0.15rem;
    border-radius: 50%;
    background: var(--sol-fundo);
  }

  .mini-ficha__texto {
    display: flex;
    flex-direction: column;
    gap: 0.15rem;
    min-width: 0;
  }

  .mini-ficha__palavra {
    font-family: var(--fonte-titulo);
    font-size: 1.8rem;
    font-weight: 700;
    letter-spacing: -0.04em;
    line-height: 1;
  }

  .mini-ficha__silabas {
    color: var(--link-ficha);
    font-size: var(--texto-s);
    font-weight: 700;
  }

  /* Percurso ---------------------------------------------------------------- */

  .percurso {
    display: grid;
    grid-template-columns: repeat(5, minmax(0, 1fr));
    gap: 1rem;
    margin: 0;
    counter-reset: passo;
  }

  .percurso li {
    position: relative;
    display: flex;
    flex-direction: column;
    gap: 0.45rem;
    padding-right: 0.6rem;
  }

  .percurso li:not(:last-child)::after {
    content: '';
    position: absolute;
    top: 1.05rem;
    left: 2.6rem;
    right: -0.4rem;
    height: 1.5px;
    background: var(--linha-forte);
    opacity: 0.3;
  }

  .percurso__marca {
    display: grid;
    place-items: center;
    width: 2.1rem;
    height: 2.1rem;
    border: 2px solid var(--linha-forte);
    border-radius: 50%;
    background: var(--papel);
    color: var(--tinta);
    font-family: var(--fonte-titulo);
    font-size: 1rem;
    font-weight: 700;
  }

  .percurso h3 {
    margin: 0;
    font-size: 1.12rem;
    letter-spacing: -0.015em;
    line-height: 1.15;
  }

  .percurso p {
    margin: 0;
    color: var(--tinta-suave);
    font-size: var(--texto-s);
    line-height: 1.42;
  }

  .exemplo {
    display: inline-block;
    align-self: flex-start;
    margin-top: 0.1rem;
    padding: 0.18rem 0.45rem;
    border: 1.5px solid var(--linha);
    border-radius: 4px;
    background: var(--papel-ficha);
    color: var(--tinta-ficha);
    font-family: var(--fonte-titulo);
    font-size: 0.85rem;
    font-weight: 700;
    line-height: 1.2;
  }

  .nota-escrita {
    display: grid;
    grid-template-columns: auto minmax(0, 1fr) auto;
    gap: 0.9rem;
    align-items: center;
    margin-top: 2.4rem;
    padding: 1rem 1.1rem;
    border: 1.5px solid var(--linha);
    border-radius: var(--raio-ficha);
    background: var(--papel-ficha);
    color: var(--tinta-ficha);
  }

  .nota-escrita p {
    margin: 0;
    color: var(--tinta-suave);
    font-size: var(--texto-s);
    line-height: 1.45;
  }

  .mais-abaixo {
    margin: 1.2rem 0 0;
  }

  /* Estúdio de IA ----------------------------------------------------------- */

  .estudio {
    display: grid;
    grid-template-columns: minmax(0, 0.9fr) minmax(0, 1.05fr) minmax(0, 1.05fr);
    gap: 0;
    border: 2px solid var(--linha-forte);
    border-radius: var(--raio-ficha);
    background: var(--papel-ficha);
    color: var(--tinta-ficha);
    box-shadow: 7px 7px 0 var(--sombra-ficha);
    overflow: hidden;
  }

  .estudio__passo {
    display: flex;
    flex-direction: column;
    gap: 0.6rem;
    padding: 1.1rem;
    border-right: 1.5px solid var(--linha-ficha);
  }

  .estudio__passo:last-child {
    border-right: 0;
  }

  .estudio__numero {
    display: grid;
    place-items: center;
    width: 2rem;
    height: 2rem;
    border: 2px solid var(--linha-ficha);
    border-radius: 50%;
    background: var(--sol);
    color: var(--tinta-ficha);
    font-family: var(--fonte-titulo);
    font-weight: 700;
  }

  .estudio h3 {
    margin: 0;
    color: var(--tinta-ficha);
    font-size: 1.15rem;
    line-height: 1.15;
  }

  .estudio p {
    margin: 0;
    color: var(--tinta-suave);
    font-size: var(--texto-s);
    line-height: 1.45;
  }

  .pedido {
    display: grid;
    gap: 0.25rem;
    margin: 0.1rem 0;
    padding: 0.6rem;
    border: 1.5px solid var(--linha);
    border-radius: 4px;
    background: var(--papel-ficha-baixo);
  }

  .pedido div {
    display: grid;
    grid-template-columns: 5.2rem minmax(0, 1fr);
    gap: 0.4rem;
    font-size: var(--texto-xs);
  }

  .pedido dt {
    color: var(--tinta-fraca);
    font-weight: 700;
  }

  .pedido dd {
    margin: 0;
    color: var(--tinta-ficha);
  }

  .prompt-exemplo {
    padding-left: 0.6rem;
    border-left: 3px solid var(--cobalto);
    font-style: italic;
  }

  .proposta {
    display: flex;
    gap: 0.6rem;
    align-items: center;
    padding: 0.5rem;
    border: 1.5px solid var(--linha);
    border-radius: 4px;
    background: var(--papel-ficha-baixo);
  }

  .proposta__imagem {
    width: 4rem;
    flex: none;
  }

  .proposta__palavra {
    color: var(--tinta-ficha) !important;
    font-family: var(--fonte-titulo);
    font-size: 1.6rem;
    font-weight: 700;
    letter-spacing: -0.04em;
    line-height: 1;
  }

  .proposta__silabas {
    color: var(--link-ficha) !important;
    font-weight: 700;
  }

  .proposta__frase {
    color: var(--tinta-suave) !important;
  }

  .proposta__opcoes {
    display: flex;
    gap: 0.35rem;
  }

  .proposta__opcoes span {
    display: grid;
    place-items: center;
    width: 3.6rem;
    height: 3rem;
    padding: 0.15rem;
    border: 1.5px solid var(--linha);
    border-radius: 4px;
  }

  .proposta__opcoes span.correta {
    border-color: var(--verde);
    background: var(--verde-fundo);
  }

  .rascunho {
    display: flex;
    align-items: center;
    gap: 0.3rem;
    color: var(--erro) !important;
    font-weight: 700;
  }

  .revisao {
    padding: 0.5rem 0.6rem;
    border-left: 3px solid var(--coral);
    background: var(--coral-fundo);
    color: var(--erro) !important;
  }

  /* Registo ----------------------------------------------------------------- */

  .registo {
    display: grid;
    grid-template-columns: minmax(0, 0.9fr) minmax(0, 1.1fr);
    gap: clamp(1.5rem, 4vw, 4rem);
    align-items: center;
  }

  .registo__texto {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 0.9rem;
  }

  .registo__texto p {
    max-width: 48ch;
    margin: 0;
    color: var(--tinta-suave);
    line-height: 1.55;
  }

  .cita {
    padding-left: 0.8rem;
    border-left: 4px solid var(--coral);
    color: var(--tinta) !important;
    font-family: var(--fonte-titulo);
    font-size: var(--texto-l);
    font-weight: 650;
    line-height: 1.2;
  }

  .cita span {
    display: block;
    margin-top: 0.3rem;
    color: var(--tinta-fraca);
    font-family: var(--fonte-texto);
    font-size: var(--texto-xs);
    font-weight: 400;
  }

  .painel-registo {
    overflow: hidden;
  }

  .painel-registo__corpo {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    padding: 1rem;
  }

  .metrica {
    display: flex;
    flex-direction: column;
    gap: 0.35rem;
  }

  .metrica__rotulo {
    display: flex;
    justify-content: space-between;
    gap: 1rem;
    color: var(--tinta-ficha);
    font-size: var(--texto-s);
  }

  .metrica__rotulo span {
    color: var(--tinta-suave);
  }

  .metrica__rotulo strong {
    font-variant-numeric: tabular-nums;
  }

  .numeros {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 0.5rem;
    margin: 0;
    padding-top: 0.8rem;
    border-top: 1.5px solid var(--linha);
  }

  .numeros div {
    display: flex;
    flex-direction: column;
    gap: 0.1rem;
  }

  .numeros dt {
    color: var(--tinta-fraca);
    font-size: var(--texto-xs);
  }

  .numeros dd {
    margin: 0;
    color: var(--tinta-ficha);
    font-family: var(--fonte-titulo);
    font-size: 1.4rem;
    font-weight: 700;
    line-height: 1;
  }

  .painel-registo__nota {
    margin: 0;
    color: var(--tinta-suave);
    font-size: var(--texto-xs);
    line-height: 1.4;
  }

  /* CTA --------------------------------------------------------------------- */

  .cta {
    background: var(--cobalto);
    color: #fff;
  }

  .cta__interior {
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto;
    gap: 2rem;
    align-items: center;
    padding-block: clamp(2.6rem, 6vw, 4.5rem);
  }

  .cta h2 {
    margin: 0 0 0.5rem;
    color: #fff;
    font-size: clamp(2rem, 1.4rem + 2.5vw, 3.4rem);
  }

  .cta p {
    max-width: 48ch;
    margin: 0;
    color: #e9eeff;
    line-height: 1.5;
  }

  .cta__acoes {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 0.55rem;
  }

  .cta__acoes .botao--fantasma {
    color: #fff;
    border-color: #fff;
  }

  .cta__acoes .botao--fantasma:hover {
    color: var(--tinta-ficha);
    border-color: var(--tinta-ficha);
  }

  .cta__metodo {
    margin-top: 0.2rem;
    color: #fff;
    font-size: var(--texto-s);
    font-weight: 700;
    text-underline-offset: 3px;
  }

  @media (max-width: 1000px) {
    .percurso {
      grid-template-columns: repeat(3, minmax(0, 1fr));
      row-gap: 2rem;
    }

    .percurso li:nth-child(3)::after {
      display: none;
    }

    .estudio {
      grid-template-columns: 1fr 1fr;
    }

    .estudio__passo:nth-child(2) {
      border-right: 0;
    }

    .estudio__passo:nth-child(3) {
      grid-column: 1 / -1;
      border-top: 1.5px solid var(--linha-ficha);
    }
  }

  @media (max-width: 860px) {
    .hero__grade {
      grid-template-columns: 1fr;
    }

    .hero__mesa {
      align-items: stretch;
    }

    .hero__indicacao {
      padding-right: 0;
      text-align: left;
    }

    .areas {
      grid-template-columns: 1fr;
    }

    .registo {
      grid-template-columns: 1fr;
    }

    .cta__interior {
      grid-template-columns: 1fr;
    }

    .cta__acoes {
      flex-direction: row;
      flex-wrap: wrap;
      align-items: center;
    }
  }

  @media (max-width: 620px) {
    .hero::before {
      display: none;
    }

    h1 {
      max-width: 100%;
    }

    .percurso {
      grid-template-columns: 1fr;
      gap: 1.5rem;
    }

    .percurso li {
      display: grid;
      grid-template-columns: 2.1rem minmax(0, 1fr);
      column-gap: 0.8rem;
      padding-left: 0;
    }

    .percurso li::after {
      display: none;
    }

    .percurso__marca {
      grid-row: 1 / span 3;
    }

    .percurso h3,
    .percurso p,
    .percurso .exemplo {
      grid-column: 2;
    }

    .nota-escrita {
      grid-template-columns: auto minmax(0, 1fr);
    }

    .nota-escrita .link {
      grid-column: 2;
    }

    .estudio {
      grid-template-columns: 1fr;
    }

    .estudio__passo {
      border-right: 0;
      border-bottom: 1.5px solid var(--linha-ficha);
    }

    .estudio__passo:last-child {
      border-bottom: 0;
    }

    .estudio__passo:nth-child(3) {
      border-top: 0;
    }

    .cta__acoes {
      flex-direction: column;
      align-items: stretch;
    }

    .numeros {
      grid-template-columns: 1fr;
    }
  }
</style>
