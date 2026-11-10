<script lang="ts">
  import { resolve } from '$app/paths';
  import { PALAVRAS_NUCLEARES, obterPalavra } from '#lib/data/palavras';
  import { FASES, NOMES_FASE } from '#lib/data/tipos';
  import { RECURSOS_DEMO } from '#lib/data/demo';
  import {
    DECISOES,
    LIMITES,
    NOTA_SEQUENCIA,
    REFERENCIAS,
    VALIDACAO_PASSOS
  } from '#lib/data/metodo';
  import { EXEMPLO_IA, MODELO_IA, PROMPT_VALIDACAO, TESTES } from '#lib/data/prompts';
  import { dados } from '#lib/stores/dados.svelte';
  import BotaoAudio from '#lib/components/BotaoAudio.svelte';
  import Icone from '#lib/components/Icone.svelte';
  import Ilustracao from '#lib/components/Ilustracao.svelte';
  import ListaValidacao from '#lib/components/ListaValidacao.svelte';

  const galinha = obterPalavra('galinha');
  const exemplo = $derived(
    dados.recurso('rec-alice-galinha') ??
      RECURSOS_DEMO.find((r) => r.id === 'rec-alice-galinha')!
  );

  const secoes = [
    { id: 'palavra', texto: 'A palavra primeiro' },
    { id: 'sequencia', texto: 'As 28 palavras' },
    { id: 'fases', texto: 'As fases' },
    { id: 'ia', texto: 'IA e validação' },
    { id: 'escrita', texto: 'Escrita à mão' },
    { id: 'desenho', texto: 'Decisões de design' },
    { id: 'testes', texto: 'Testes' },
    { id: 'limites', texto: 'Limites' },
    { id: 'referencias', texto: 'Referências' }
  ];
</script>

<svelte:head>
  <title>Método, IA e limites — Palavra Viva</title>
  <meta
    name="description"
    content="Metodologia do Palavra Viva: sequência das 28 palavras, fases de aprendizagem, prompts, validação de recursos, acessibilidade, testes e limites da IA."
  />
</svelte:head>

<section class="metodo-hero">
  <div class="container metodo-hero__interior">
    <div>
      <p class="migalhas metodo-hero__migalhas">
        <a href={resolve('/')}>Início</a>
        <span aria-hidden="true">/</span>
        <span>Método</span>
      </p>
      <p class="contexto"><Icone nome="livro" tamanho={18} /> Relatório do protótipo</p>
      <h1>Uma palavra com sentido antes de uma letra isolada.</h1>
      <p class="metodo-hero__intro">
        O Palavra Viva segue o método das 28 palavras: reconhecer a palavra inteira, analisar as
        suas partes, voltar a combiná-las e ler frases curtas. A IA prepara recursos; a professora
        revê, corrige e aprova.
      </p>
      <div class="metodo-hero__acoes">
        <a class="botao botao--primario" href={resolve('/professor')}>Abrir a área do professor</a>
        <a class="botao botao--fantasma" href={resolve('/crianca')}>Ver a área da criança</a>
      </div>
    </div>
    <div class="metodo-hero__ficha ficha" aria-hidden="true">
      <p class="ficha__topo">Sequência adotada · 01–28</p>
      <p class="metodo-hero__palavra">menina</p>
      <p class="metodo-hero__silabas">me · ni · na</p>
      <p class="metodo-hero__frase">«A menina lê o livro.»</p>
      <span class="etiqueta etiqueta--ok"><Icone nome="check" tamanho={14} /> revista</span>
    </div>
  </div>
</section>

<div class="container metodo">
  <nav class="indice" aria-label="Índice do relatório">
    <p class="indice__titulo">Neste documento</p>
    <ol>
      {#each secoes as secao, posicao (secao.id)}
        <li><a href="#{secao.id}"><span aria-hidden="true">{String(posicao + 1).padStart(2, '0')}</span> {secao.texto}</a></li>
      {/each}
    </ol>
    <p class="indice__nota">
      Relatório individual do Trabalho Prático 1 · Design de Sistemas Interativos · 2026
    </p>
  </nav>

  <article class="relatorio">
    <section id="palavra" class="bloco">
      <p class="bloco__numero">01</p>
      <h2>A palavra primeiro</h2>
      <p class="entrada">
        O método das 28 palavras parte de uma palavra com significado, não de uma letra. A criança
        vê a palavra, ouve-a e relaciona-a com o que representa. Só depois a divide em sílabas e
        volta a juntá-las para descobrir outras palavras.
      </p>
      <p>
        Esta ordem importa. Se a criança começa por letras soltas, perde o referente e a leitura
        torna-se decifração sem sentido. Se começa pela palavra, encontra desde o início uma forma
        escrita que corresponde a algo que já conhece. O protótipo procura preservar essa
        progressão em todas as atividades.
      </p>

      <div class="triade" aria-label="Reconhecimento, análise e síntese">
        <div>
          <span class="triade__numero">1</span>
          <h3>Reconhecer</h3>
          <p>A palavra inteira, com imagem e som. «menina».</p>
        </div>
        <div>
          <span class="triade__numero">2</span>
          <h3>Analisar</h3>
          <p>As partes orais e escritas. «me · ni · na».</p>
        </div>
        <div>
          <span class="triade__numero">3</span>
          <h3>Recombinar</h3>
          <p>Partes conhecidas noutra palavra. «pa + to → pato».</p>
        </div>
      </div>

      <p class="destaque">
        «As 28 palavras constituem uma base de trabalho para descobrir o funcionamento da escrita,
        não um limite ao vocabulário a aprender.»
        <span>Enunciado do projeto, com base em [1] e [2]</span>
      </p>
    </section>

    <section id="sequencia" class="bloco">
      <p class="bloco__numero">02</p>
      <h2>A sequência adotada</h2>
      <p>
        Seguimos a sequência indicada no enunciado, com «mamã» e «gema». É a mesma ordem ao longo de
        todo o protótipo: no mural, no estúdio, na biblioteca e nos registos.
      </p>

      <ol class="sequencia">
        {#each PALAVRAS_NUCLEARES as palavra (palavra.id)}
          <li>
            <span class="sequencia__ordem">{String(palavra.ordem).padStart(2, '0')}</span>
            <span class="sequencia__palavra">{palavra.palavra}</span>
            <span class="sequencia__silabas">{palavra.silabas.join(' · ')}</span>
            <BotaoAudio
              src={palavra.audio}
              rotulo="Ouvir"
              rotuloAria="Ouvir a palavra {palavra.palavra}"
              tamanho="pequeno"
              variante="fantasma"
              mostrarTexto={false}
            />
          </li>
        {/each}
      </ol>

      <p class="nota">{NOTA_SEQUENCIA}</p>
      <p class="nota">
        Além das 28 palavras nucleares, o léxico inclui seis derivadas para a recombinação e para as
        frases: mesa, pato, nave, bola, gato e mala. São apresentadas como «palavra derivada», nunca
        como parte da sequência numerada.
      </p>
    </section>

    <section id="fases" class="bloco">
      <p class="bloco__numero">03</p>
      <h2>As fases de aprendizagem</h2>
      <p>
        A fase não é um ano escolar. É o nível de apoio que a atividade oferece. A professora pode
        manter uma criança numa fase durante várias palavras ou avançar assim que a observação
        justificar.
      </p>

      <div class="fases">
        {#each FASES as fase (fase.numero)}
          <article class="fase">
            <div class="fase__topo">
              <span class="fase__numero">{fase.numero}</span>
              <h3>{fase.nome}</h3>
            </div>
            <p>{fase.descricao}</p>
            <p class="fase__exemplo">{fase.exemplo}</p>
          </article>
        {/each}
      </div>

      <p class="nota">
        A fase 6 (escrita) não é substituída por um ecrã. O protótipo gera uma ficha de cópia em
        papel e permite à professora registar a conclusão na área de registos.
      </p>
    </section>

    <section id="ia" class="bloco">
      <p class="bloco__numero">04</p>
      <h2>A IA propõe, a professora decide</h2>
      <p>
        O pedido é pequeno e explícito: criança, palavra, fase, tipo de atividade, número de opções
        e apoios. A proposta é composta a partir do léxico revisto, com opções próximas na forma e
        uma frase curta. O prompt e os critérios de verificação ficam registados.
      </p>

      <div class="aviso aviso--info">
        <Icone nome="escudo" tamanho={22} />
        <p>
          <strong>Geração prévia, sem API em tempo de execução.</strong> {MODELO_IA} O enunciado
          permite explicitamente esta abordagem. Assim, o protótipo é estático, rápido e não envia
          dados de crianças para terceiros.
        </p>
      </div>

      <h3 class="sub-titulo">O pedido que dá origem à proposta</h3>
      <div class="pedido-exemplo">
        <dl>
          <div><dt>Criança</dt><dd>{EXEMPLO_IA.pedido.crianca}, fase {EXEMPLO_IA.pedido.fase}</dd></div>
          <div><dt>Palavra</dt><dd>{EXEMPLO_IA.pedido.palavra}</dd></div>
          <div><dt>Atividade</dt><dd>{EXEMPLO_IA.pedido.tipo}</dd></div>
          <div><dt>Opções</dt><dd>{EXEMPLO_IA.pedido.numeroOpcoes}</dd></div>
        </dl>
        <p class="pedido-exemplo__prompt">«{EXEMPLO_IA.prompt}»</p>
      </div>

      <h3 class="sub-titulo">A proposta devolvida</h3>
      <div class="proposta-exemplo">
        <div class="proposta-exemplo__ficha superficie-ficha">
          <div class="proposta-exemplo__imagem"><Ilustracao palavra={galinha} /></div>
          <div>
            <p class="proposta-exemplo__palavra">{galinha.palavra}</p>
            <p class="proposta-exemplo__silabas">{galinha.silabas.join(' · ')}</p>
            <p class="proposta-exemplo__frase">«{galinha.frase}»</p>
          </div>
          <BotaoAudio src={galinha.audio} rotulo="Ouvir" rotuloAria="Ouvir a galinha" tamanho="pequeno" />
        </div>
        <div class="proposta-exemplo__opcoes" aria-label="Opções de imagem da proposta">
          {#each exemplo.opcoes as id (id)}
            {@const p = obterPalavra(id)}
            <span class:correta={id === exemplo.palavraId}><Ilustracao palavra={p} /></span>
          {/each}
        </div>
      </div>

      <h3 class="sub-titulo">A revisão humana</h3>
      <p class="revisao-caixa">
        <Icone nome="lapis" tamanho={19} /> {EXEMPLO_IA.revisao}
      </p>
      <ListaValidacao itens={exemplo.validacao} titulo="Verificações da proposta exemplo" />

      <h3 class="sub-titulo">O que é verificado</h3>
      <ul class="validacao-passos">
        {#each VALIDACAO_PASSOS as passo, i (passo.titulo)}
          <li>
            <span class="validacao-passos__numero" aria-hidden="true">{i + 1}</span>
            <div>
              <h4>{passo.titulo}</h4>
              <p>{passo.texto}</p>
              <p class="validacao-passos__exemplo">{passo.exemplo}</p>
            </div>
          </li>
        {/each}
      </ul>

      <details class="prompt-caixa">
        <summary><Icone nome="olho" tamanho={17} /> Ver o prompt completo e o pedido de verificação</summary>
        <div>
          <p class="prompt-caixa__rotulo">Prompt de criação</p>
          <pre>{exemplo.prompt}</pre>
          <p class="prompt-caixa__rotulo">Prompt de verificação</p>
          <pre>{PROMPT_VALIDACAO}</pre>
        </div>
      </details>

      <p class="nota">
        A validação automática não substitui a professora. Se uma verificação falha, a aprovação
        fica bloqueada até o campo ser corrigido. Se a professora altera a frase sem gravar novo
        áudio, a verificação assinala a incoerência.
      </p>
    </section>

    <section id="escrita" class="bloco">
      <p class="bloco__numero">05</p>
      <h2>A escrita à mão não desaparece</h2>
      <div class="escrita-bloco">
        <div>
          <p>
            Uma atividade digital de arrastar sílabas não substitui o treino da escrita manual. O
            protótipo imprime uma ficha com a palavra, as sílabas, a frase e três linhas para
            copiar. A professora registra depois se a criança concluiu a tarefa e o que observou.
          </p>
          <p>
            Este registo fica separado dos acertos digitais. Uma coisa é reconhecer uma palavra no
            ecrã; outra é produzi-la com lápis e papel.
          </p>
          <a class="botao botao--secundario" href={resolve('/professor/biblioteca')}>
            <Icone nome="impressora" tamanho={18} /> Abrir a biblioteca e imprimir
          </a>
        </div>
        <div class="ficha-escrita superficie-ficha" aria-hidden="true">
          <p class="ficha-escrita__topo">Ficha de cópia</p>
          <p class="ficha-escrita__palavra">sapato</p>
          <p class="ficha-escrita__silabas">sa · pa · to</p>
          <p class="ficha-escrita__frase">«O menino usa o sapato.»</p>
          <div class="ficha-escrita__linha"></div>
          <div class="ficha-escrita__linha"></div>
          <div class="ficha-escrita__linha"></div>
        </div>
      </div>
    </section>

    <section id="desenho" class="bloco">
      <p class="bloco__numero">06</p>
      <h2>Decisões de design</h2>
      <p>
        A interface foi pensada para duas pessoas diferentes. A professora precisa de densidade,
        filtros e registos. A criança precisa de poucas escolhas, alvos grandes e uma instrução de
        cada vez. O mesmo sistema visual serve as duas, com ritmos distintos.
      </p>

      <div class="decisoes">
        {#each DECISOES as decisao, i (decisao.titulo)}
          <article>
            <span class="decisoes__numero" aria-hidden="true">{String(i + 1).padStart(2, '0')}</span>
            <h3>{decisao.titulo}</h3>
            <p>{decisao.texto}</p>
          </article>
        {/each}
      </div>

      <h3 class="sub-titulo">Acessibilidade e desempenho</h3>
      <ul class="acessibilidade">
        <li><Icone nome="check" tamanho={17} /> <span>Tipografia Atkinson Hyperlegible no texto e Bricolage Grotesque nos títulos, com fontes self-hosted e <code>font-display: swap</code>.</span></li>
        <li><Icone nome="check" tamanho={17} /> <span>Alvos de toque com pelo menos 44 px, foco visível e navegação completa por teclado.</span></li>
        <li><Icone nome="check" tamanho={17} /> <span>Modo claro e escuro com persistência e respeito pela preferência do sistema.</span></li>
        <li><Icone nome="check" tamanho={17} /> <span>Áudio repetível em todas as atividades, com botão de texto e rótulo acessível.</span></li>
        <li><Icone nome="check" tamanho={17} /> <span>Movimento reduzido: as animações decorativas desligam com <code>prefers-reduced-motion</code>; as transições usam apenas transformação e opacidade.</span></li>
        <li><Icone nome="check" tamanho={17} /> <span>HTML semântico, um <code>h1</code> por página, tabelas com cabeçalhos e estados vazios explicados.</span></li>
        <li><Icone nome="check" tamanho={17} /> <span>SVG próprios, sem terceiros em tempo de execução; dados fictícios guardados apenas em <code>localStorage</code>.</span></li>
      </ul>
    </section>

    <section id="testes" class="bloco">
      <p class="bloco__numero">07</p>
      <h2>Evidências dos testes funcionais</h2>
      <p>
        Os testes abaixo foram feitos no protótipo com a turma fictícia. Não são um estudo com
        crianças: são verificações funcionais e de acessibilidade.
      </p>
      <div class="tabela-envolvente">
        <table class="tabela">
          <caption>Casos de teste, comportamento esperado e resultado observado.</caption>
          <thead>
            <tr>
              <th scope="col">Caso</th>
              <th scope="col">Esperado</th>
              <th scope="col">Resultado</th>
            </tr>
          </thead>
          <tbody>
            {#each TESTES as teste (teste.caso)}
              <tr>
                <th scope="row">{teste.caso}</th>
                <td>{teste.esperado}</td>
                <td>{teste.resultado}</td>
              </tr>
            {/each}
          </tbody>
        </table>
      </div>
    </section>

    <section id="limites" class="bloco">
      <p class="bloco__numero">08</p>
      <h2>Limites e discussão crítica</h2>
      <p>
        O protótipo demonstra o percurso, mas não substitui a professora nem prova aprendizagem a
        longo prazo. Estes limites são parte do desenho, não detalhes escondidos.
      </p>
      <div class="limites">
        {#each LIMITES as limite, i (limite.titulo)}
          <article>
            <span class="limites__numero" aria-hidden="true">{i + 1}</span>
            <div>
              <h3>{limite.titulo}</h3>
              <p>{limite.texto}</p>
            </div>
          </article>
        {/each}
      </div>
      <p class="destaque">
        «Uma resposta correta isolada não demonstra domínio da leitura.»
        <span>Enunciado do projeto</span>
      </p>
    </section>

    <section id="referencias" class="bloco">
      <p class="bloco__numero">09</p>
      <h2>Conclusão e referências</h2>
      <p>
        O Palavra Viva mostra como a IA generativa pode apoiar a preparação de recursos sem retirar
        a decisão pedagógica à professora. A criança encontra poucas escolhas, áudio repetível e
        feedback concreto; a professora encontra validação, revisão e registos. O próximo passo
        seria testar o protótipo com crianças e professores reais, com consentimento e recolha de
        evidências qualitativas.
      </p>
      <h3 class="sub-titulo">Referências</h3>
      <ol class="referencias">
        {#each REFERENCIAS as referencia (referencia.id)}
          <li>
            <span class="referencias__id">{referencia.id}</span>
            <span>{referencia.texto}</span>
          </li>
        {/each}
      </ol>
      <p class="nota">
        Nota sobre a sequência: {NOMES_FASE[1].toLowerCase()} a {NOMES_FASE[6].toLowerCase()} são
        fases do percurso, não uma escala de avaliação.
      </p>
    </section>

    <div class="fim-doc superficie-ficha">
      <div>
        <h2>Ver o protótipo a funcionar</h2>
        <p>Prepara um recurso, revê a proposta e entra na sessão da criança.</p>
      </div>
      <div class="linha">
        <a class="botao botao--primario" href={resolve('/professor/criar')}>Criar um recurso</a>
        <a class="botao botao--secundario" href={resolve('/professor/biblioteca')}>Abrir a biblioteca</a>
        <a class="botao botao--fantasma" href={resolve('/crianca')}>Entrar como criança</a>
      </div>
    </div>
  </article>
</div>

<style>
  .metodo-hero {
    background: var(--papel-alto);
    border-bottom: 1.5px solid var(--linha);
  }

  .metodo-hero__interior {
    display: grid;
    grid-template-columns: minmax(0, 1.12fr) minmax(0, 0.88fr);
    gap: clamp(1.5rem, 4vw, 4rem);
    align-items: center;
    padding-block: clamp(2.4rem, 6vw, 5rem);
  }

  .metodo-hero__migalhas {
    margin-bottom: 1.5rem;
  }

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

  .metodo-hero h1 {
    max-width: 18ch;
    margin: 0;
    font-size: clamp(2.5rem, 1.4rem + 4.2vw, 4.8rem);
    line-height: 0.95;
  }

  .metodo-hero__intro {
    max-width: 52ch;
    margin: 1rem 0 0;
    color: var(--tinta-suave);
    font-size: var(--texto-l);
    line-height: 1.5;
  }

  .metodo-hero__acoes {
    display: flex;
    flex-wrap: wrap;
    gap: 0.6rem;
    margin-top: 1.2rem;
  }

  .metodo-hero__ficha {
    position: relative;
    padding: 1.4rem;
    background: var(--papel-ficha);
    color: var(--tinta-ficha);
    box-shadow: 9px 9px 0 var(--sombra-ficha);
    transform: rotate(1.4deg);
  }

  .metodo-hero__ficha .ficha__topo {
    padding: 0 0 0.7rem;
    color: var(--tinta-fraca);
    font-size: var(--texto-xs);
    letter-spacing: 0.06em;
    text-transform: uppercase;
  }

  .metodo-hero__palavra {
    margin: 0.6rem 0 0;
    color: var(--tinta-ficha);
    font-family: var(--fonte-titulo);
    font-size: clamp(3rem, 2rem + 4vw, 5rem);
    font-weight: 700;
    letter-spacing: -0.055em;
    line-height: 0.9;
  }

  .metodo-hero__silabas {
    margin: 0.3rem 0 0;
    color: var(--link-ficha);
    font-size: var(--texto-l);
    font-weight: 700;
  }

  .metodo-hero__frase {
    margin: 0.6rem 0 1rem;
    color: var(--tinta-suave);
    font-size: var(--texto-s);
    line-height: 1.45;
  }

  .metodo {
    display: grid;
    grid-template-columns: minmax(0, 14rem) minmax(0, 1fr);
    gap: clamp(1.5rem, 4vw, 4rem);
    padding-block: clamp(2rem, 4vw, 3.5rem) clamp(3rem, 6vw, 6rem);
    align-items: start;
  }

  .indice {
    position: sticky;
    top: 5.8rem;
    padding: 1rem;
    border: 1.5px solid var(--linha);
    border-radius: var(--raio-ficha);
    background: var(--papel-alto);
  }

  .indice__titulo {
    margin: 0 0 0.6rem;
    color: var(--tinta-fraca);
    font-size: var(--texto-xs);
    font-weight: 700;
    letter-spacing: 0.06em;
    text-transform: uppercase;
  }

  .indice ol {
    display: flex;
    flex-direction: column;
    gap: 0.1rem;
    margin: 0;
  }

  .indice a {
    display: flex;
    gap: 0.4rem;
    padding: 0.32rem 0.2rem;
    border-radius: 4px;
    color: var(--tinta-suave);
    font-size: var(--texto-s);
    font-weight: 700;
    line-height: 1.25;
    text-decoration: none;
  }

  .indice a span {
    color: var(--tinta-fraca);
    font-variant-numeric: tabular-nums;
  }

  .indice a:hover {
    background: var(--sol-fundo);
    color: var(--tinta);
  }

  .indice__nota {
    margin: 0.9rem 0 0;
    padding-top: 0.7rem;
    border-top: 1.5px solid var(--linha);
    color: var(--tinta-fraca);
    font-size: var(--texto-xs);
    line-height: 1.4;
  }

  .relatorio {
    display: flex;
    flex-direction: column;
    gap: clamp(2.5rem, 6vw, 5rem);
    min-width: 0;
  }

  .bloco {
    scroll-margin-top: 6rem;
  }

  .bloco__numero {
    margin: 0 0 0.3rem;
    color: var(--coral-texto);
    font-family: var(--fonte-titulo);
    font-size: var(--texto-s);
    font-weight: 700;
    letter-spacing: 0.08em;
  }

  .bloco h2 {
    margin: 0 0 1rem;
    font-size: clamp(1.9rem, 1.3rem + 2.4vw, 3rem);
  }

  .bloco > p {
    max-width: 68ch;
    margin: 0 0 0.8rem;
    color: var(--tinta-suave);
    line-height: 1.65;
  }

  .bloco .entrada {
    color: var(--tinta);
    font-size: var(--texto-l);
    line-height: 1.55;
  }

  .bloco h3 {
    margin: 1.8rem 0 0.6rem;
    font-size: var(--texto-l);
    letter-spacing: -0.02em;
  }

  .bloco code {
    padding: 0.1rem 0.3rem;
    border: 1px solid var(--linha);
    border-radius: 3px;
    background: var(--papel-alto);
    font-size: 0.85em;
  }

  .triade {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 0.7rem;
    margin: 1.4rem 0;
  }

  .triade > div {
    padding: 1rem;
    border: 1.5px solid var(--linha);
    border-radius: var(--raio-ficha);
    background: var(--papel-alto);
  }

  .triade__numero {
    display: inline-grid;
    place-items: center;
    width: 1.8rem;
    height: 1.8rem;
    margin-bottom: 0.5rem;
    border: 1.5px solid var(--tinta-ficha);
    border-radius: 50%;
    background: var(--sol);
    color: var(--tinta-ficha);
    font-family: var(--fonte-titulo);
    font-size: 0.85rem;
    font-weight: 700;
  }

  .triade h3 {
    margin: 0 0 0.2rem;
    font-size: 1.2rem;
  }

  .triade p {
    margin: 0;
    color: var(--tinta-suave);
    font-size: var(--texto-s);
    line-height: 1.45;
  }

  .destaque {
    margin: 1.4rem 0 0 !important;
    padding: 0.9rem 1rem;
    border-left: 5px solid var(--coral);
    background: var(--papel-alto);
    color: var(--tinta) !important;
    font-family: var(--fonte-titulo);
    font-size: var(--texto-l);
    font-weight: 650;
    line-height: 1.3;
  }

  .destaque span {
    display: block;
    margin-top: 0.3rem;
    color: var(--tinta-fraca);
    font-family: var(--fonte-texto);
    font-size: var(--texto-xs);
    font-weight: 400;
  }

  /* Sequência --------------------------------------------------------------- */

  .sequencia {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 0.28rem;
    margin: 1rem 0 1.2rem;
  }

  .sequencia li {
    display: flex;
    align-items: center;
    gap: 0.45rem;
    padding: 0.35rem 0.5rem;
    border: 1px solid var(--linha);
    border-radius: 4px;
    background: var(--papel-alto);
  }

  .sequencia__ordem {
    color: var(--tinta-fraca);
    font-size: 0.68rem;
    font-variant-numeric: tabular-nums;
  }

  .sequencia__palavra {
    color: var(--tinta);
    font-family: var(--fonte-titulo);
    font-size: 1.05rem;
    font-weight: 700;
    letter-spacing: -0.02em;
    line-height: 1;
  }

  .sequencia__silabas {
    flex: 1;
    color: var(--tinta-suave);
    font-size: 0.72rem;
  }

  .sequencia :global(.audio) {
    flex: none;
  }

  .nota {
    max-width: 68ch;
    margin: 0.8rem 0 0 !important;
    color: var(--tinta-fraca) !important;
    font-size: var(--texto-s) !important;
    line-height: 1.5 !important;
  }

  /* Fases ------------------------------------------------------------------- */

  .fases {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 0.65rem;
    margin-top: 1.2rem;
  }

  .fase {
    padding: 0.9rem;
    border: 1.5px solid var(--linha);
    border-radius: var(--raio-ficha);
    background: var(--papel-alto);
  }

  .fase__topo {
    display: flex;
    align-items: center;
    gap: 0.45rem;
    margin-bottom: 0.3rem;
  }

  .fase__numero {
    display: grid;
    place-items: center;
    width: 1.8rem;
    height: 1.8rem;
    flex: none;
    border: 1.5px solid var(--linha-forte);
    border-radius: 50%;
    background: var(--papel-ficha);
    color: var(--tinta-ficha);
    font-family: var(--fonte-titulo);
    font-size: 0.85rem;
    font-weight: 700;
  }

  .fase h3 {
    margin: 0;
    font-size: 1.1rem;
  }

  .fase p {
    margin: 0;
    color: var(--tinta-suave);
    font-size: var(--texto-s);
    line-height: 1.45;
  }

  .fase__exemplo {
    margin-top: 0.4rem !important;
    color: var(--link) !important;
    font-size: var(--texto-xs) !important;
    font-weight: 700;
  }

  /* IA ---------------------------------------------------------------------- */

  .pedido-exemplo {
    margin: 0.8rem 0 1.2rem;
    padding: 0.9rem;
    border: 1.5px solid var(--linha-forte);
    border-radius: var(--raio-ficha);
    background: var(--papel-alto);
  }

  .pedido-exemplo dl {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 0.3rem 1rem;
    margin: 0 0 0.6rem;
  }

  .pedido-exemplo dl div {
    display: flex;
    gap: 0.35rem;
    font-size: var(--texto-s);
  }

  .pedido-exemplo dt {
    color: var(--tinta-fraca);
    font-weight: 700;
  }

  .pedido-exemplo dd {
    margin: 0;
    color: var(--tinta);
  }

  .pedido-exemplo__prompt {
    margin: 0;
    padding: 0.55rem 0.65rem;
    border-left: 3px solid var(--cobalto);
    background: var(--cobalto-fundo);
    color: var(--tinta);
    font-size: var(--texto-s);
    font-style: italic;
    line-height: 1.45;
  }

  .proposta-exemplo {
    display: grid;
    grid-template-columns: minmax(0, 1fr) minmax(0, 0.8fr);
    gap: 0.8rem;
    align-items: center;
    padding: 0.8rem;
    border: 2px solid var(--linha-forte);
    border-radius: var(--raio-ficha);
    background: var(--papel-ficha);
    color: var(--tinta-ficha);
    box-shadow: 5px 5px 0 var(--sombra-ficha);
  }

  .proposta-exemplo__ficha {
    display: flex;
    align-items: center;
    gap: 0.6rem;
  }

  .proposta-exemplo__imagem {
    width: 4.6rem;
    flex: none;
    padding: 0.2rem;
    border-radius: 50%;
    background: var(--sol-fundo);
  }

  .proposta-exemplo__palavra {
    margin: 0;
    color: var(--tinta-ficha);
    font-family: var(--fonte-titulo);
    font-size: 1.7rem;
    font-weight: 700;
    letter-spacing: -0.04em;
    line-height: 1;
  }

  .proposta-exemplo__silabas {
    margin: 0.1rem 0 0;
    color: var(--link-ficha);
    font-size: var(--texto-s);
    font-weight: 700;
  }

  .proposta-exemplo__frase {
    margin: 0.15rem 0 0;
    color: var(--tinta-suave);
    font-size: var(--texto-xs);
  }

  .proposta-exemplo__opcoes {
    display: flex;
    justify-content: flex-end;
    gap: 0.35rem;
  }

  .proposta-exemplo__opcoes span {
    display: grid;
    place-items: center;
    width: 3.4rem;
    height: 3.2rem;
    padding: 0.15rem;
    border: 1.5px solid var(--linha);
    border-radius: 5px;
    background: var(--papel-ficha);
  }

  .proposta-exemplo__opcoes span.correta {
    border-color: var(--verde);
    background: var(--verde-fundo);
  }

  .revisao-caixa {
    display: flex;
    align-items: flex-start;
    gap: 0.45rem;
    margin: 0 0 0.8rem !important;
    padding: 0.7rem 0.8rem;
    border-left: 4px solid var(--coral);
    background: var(--coral-fundo);
    color: var(--erro) !important;
    font-size: var(--texto-s) !important;
    line-height: 1.5 !important;
  }

  .revisao-caixa :global(svg) {
    flex: none;
    margin-top: 0.1rem;
  }

  .validacao-passos {
    display: flex;
    flex-direction: column;
    gap: 0.7rem;
    margin: 0.8rem 0 1.4rem;
  }

  .validacao-passos li {
    display: grid;
    grid-template-columns: 2rem minmax(0, 1fr);
    gap: 0.7rem;
    align-items: start;
  }

  .validacao-passos__numero {
    display: grid;
    place-items: center;
    width: 1.8rem;
    height: 1.8rem;
    border: 1.5px solid var(--linha-forte);
    border-radius: 50%;
    background: var(--sol-fundo);
    color: var(--tinta-ficha);
    font-size: 0.75rem;
    font-weight: 700;
  }

  .validacao-passos h4 {
    margin: 0;
    font-size: 1rem;
  }

  .validacao-passos p {
    margin: 0.1rem 0 0;
    color: var(--tinta-suave);
    font-size: var(--texto-s);
    line-height: 1.45;
  }

  .validacao-passos__exemplo {
    color: var(--tinta-fraca) !important;
    font-size: var(--texto-xs) !important;
  }

  .prompt-caixa {
    margin-top: 1rem;
    border: 1.5px solid var(--linha);
    border-radius: var(--raio-ficha);
    background: var(--papel-alto);
  }

  .prompt-caixa summary {
    display: flex;
    align-items: center;
    gap: 0.4rem;
    padding: 0.75rem 0.9rem;
    color: var(--tinta-suave);
    font-size: var(--texto-s);
    font-weight: 700;
    cursor: pointer;
  }

  .prompt-caixa > div {
    padding: 0 0.9rem 0.9rem;
  }

  .prompt-caixa__rotulo {
    margin: 0.5rem 0 0.25rem;
    color: var(--tinta-fraca);
    font-size: var(--texto-xs);
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.04em;
  }

  .prompt-caixa pre {
    max-height: 26rem;
    margin: 0;
    overflow: auto;
    padding: 0.65rem;
    border: 1.5px solid var(--linha);
    border-radius: 4px;
    background: var(--papel-ficha);
    color: var(--tinta-ficha);
    font-family: ui-monospace, 'SFMono-Regular', Consolas, monospace;
    font-size: 0.72rem;
    line-height: 1.45;
    white-space: pre-wrap;
  }

  /* Escrita ----------------------------------------------------------------- */

  .escrita-bloco {
    display: grid;
    grid-template-columns: minmax(0, 1fr) minmax(0, 0.75fr);
    gap: 1.4rem;
    align-items: center;
    margin-top: 1rem;
  }

  .escrita-bloco p {
    margin: 0 0 0.8rem;
    color: var(--tinta-suave);
    line-height: 1.6;
  }

  .ficha-escrita {
    padding: 1.1rem;
    border: 2px solid var(--tinta-ficha);
    border-radius: var(--raio-ficha);
    background: var(--papel-ficha);
    color: var(--tinta-ficha);
    box-shadow: 6px 6px 0 var(--sombra-ficha);
    transform: rotate(-0.7deg);
  }

  .ficha-escrita__topo {
    margin: 0 0 0.8rem !important;
    padding-bottom: 0.4rem;
    border-bottom: 1.5px solid var(--linha-ficha);
    color: var(--tinta-fraca) !important;
    font-size: var(--texto-xs) !important;
    font-weight: 700;
    letter-spacing: 0.06em;
    text-transform: uppercase;
  }

  .ficha-escrita__palavra {
    margin: 0 !important;
    color: var(--tinta-ficha) !important;
    font-family: var(--fonte-titulo);
    font-size: 2.5rem;
    font-weight: 700;
    letter-spacing: -0.05em;
    line-height: 1;
  }

  .ficha-escrita__silabas {
    margin: 0.2rem 0 0.5rem !important;
    color: var(--link-ficha) !important;
    font-weight: 700;
  }

  .ficha-escrita__frase {
    margin: 0 0 1rem !important;
    color: var(--tinta-suave) !important;
    font-size: var(--texto-s) !important;
  }

  .ficha-escrita__linha {
    height: 2.8rem;
    border-bottom: 1px solid var(--linha-forte);
  }

  /* Decisões ---------------------------------------------------------------- */

  .decisoes {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 0.7rem;
    margin: 1rem 0 1.4rem;
  }

  .decisoes article {
    padding: 0.9rem;
    border: 1.5px solid var(--linha);
    border-radius: var(--raio-ficha);
    background: var(--papel-alto);
  }

  .decisoes__numero {
    color: var(--coral-texto);
    font-size: var(--texto-xs);
    font-weight: 700;
    letter-spacing: 0.08em;
  }

  .decisoes h3 {
    margin: 0.2rem 0 0.3rem;
    font-size: 1.1rem;
  }

  .decisoes p {
    margin: 0;
    color: var(--tinta-suave);
    font-size: var(--texto-s);
    line-height: 1.45;
  }

  .acessibilidade {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    margin: 0.7rem 0 0;
  }

  .acessibilidade li {
    display: flex;
    align-items: flex-start;
    gap: 0.45rem;
    color: var(--tinta-suave);
    font-size: var(--texto-s);
    line-height: 1.5;
  }

  .acessibilidade li :global(svg) {
    flex: none;
    margin-top: 0.18rem;
    color: var(--sucesso);
  }

  /* Limites ----------------------------------------------------------------- */

  .limites {
    display: flex;
    flex-direction: column;
    gap: 0.7rem;
    margin: 1rem 0;
  }

  .limites article {
    display: grid;
    grid-template-columns: 2rem minmax(0, 1fr);
    gap: 0.7rem;
    padding: 0.8rem 0.9rem;
    border: 1.5px solid var(--linha);
    border-radius: var(--raio-ficha);
    background: var(--papel-alto);
  }

  .limites__numero {
    display: grid;
    place-items: center;
    width: 1.7rem;
    height: 1.7rem;
    border: 1.5px solid var(--coral);
    border-radius: 50%;
    color: var(--erro);
    font-size: 0.75rem;
    font-weight: 700;
  }

  .limites h3 {
    margin: 0 0 0.15rem;
    font-size: 1.02rem;
  }

  .limites p {
    margin: 0;
    color: var(--tinta-suave);
    font-size: var(--texto-s);
    line-height: 1.5;
  }

  .referencias {
    display: flex;
    flex-direction: column;
    gap: 0.6rem;
    margin: 0.7rem 0 1rem;
    padding: 0;
  }

  .referencias li {
    display: grid;
    grid-template-columns: 2.5rem minmax(0, 1fr);
    gap: 0.5rem;
    color: var(--tinta-suave);
    font-size: var(--texto-s);
    line-height: 1.5;
  }

  .referencias__id {
    color: var(--tinta-fraca);
    font-weight: 700;
  }

  .fim-doc {
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto;
    gap: 1.3rem;
    align-items: center;
    padding: 1.2rem;
    border: 2px solid var(--linha-forte);
    border-radius: var(--raio-ficha);
    background: var(--papel-ficha);
    color: var(--tinta-ficha);
    box-shadow: 6px 6px 0 var(--sombra-ficha);
  }

  .fim-doc h2 {
    margin: 0;
    color: var(--tinta-ficha);
    font-size: var(--texto-xl);
  }

  .fim-doc p {
    margin: 0.2rem 0 0;
    color: var(--tinta-suave);
    font-size: var(--texto-s);
  }

  @media (max-width: 1000px) {
    .metodo {
      grid-template-columns: 1fr;
    }

    .indice {
      position: static;
    }

    .indice ol {
      display: grid;
      grid-template-columns: repeat(3, minmax(0, 1fr));
    }
  }

  @media (max-width: 820px) {
    .metodo-hero__interior {
      grid-template-columns: 1fr;
    }

    .metodo-hero__ficha {
      transform: none;
    }

    .fases,
    .decisoes {
      grid-template-columns: 1fr;
    }

    .escrita-bloco {
      grid-template-columns: 1fr;
    }

    .fim-doc {
      grid-template-columns: 1fr;
    }
  }

  @media (max-width: 620px) {
    .sequencia {
      grid-template-columns: 1fr;
    }

    .triade {
      grid-template-columns: 1fr;
    }

    .pedido-exemplo dl {
      grid-template-columns: 1fr;
    }

    .proposta-exemplo {
      grid-template-columns: 1fr;
    }

    .proposta-exemplo__opcoes {
      justify-content: flex-start;
    }

    .indice ol {
      grid-template-columns: 1fr 1fr;
    }
  }

  @media (max-width: 420px) {
    .indice ol {
      grid-template-columns: 1fr;
    }
  }
</style>
