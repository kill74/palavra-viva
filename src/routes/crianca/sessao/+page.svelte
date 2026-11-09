<script lang="ts">
  import { onMount } from 'svelte';
  import { audioDaSilaba, fonteDaSilaba, obterPalavra } from '#lib/data/palavras';
  import { DESCRICAO_TIPO, NOMES_FASE, NOMES_TIPO, type Recurso, type Resposta } from '#lib/data/tipos';
  import { dados } from '#lib/stores/dados.svelte';
  import { parametroUrl } from '#lib/utils/consulta';
  import { idCurto } from '#lib/utils/formato';
  import { tocarAudio } from '#lib/utils/audio';
  import BotaoAudio from '#lib/components/BotaoAudio.svelte';
  import FichaPalavra from '#lib/components/FichaPalavra.svelte';
  import Icone from '#lib/components/Icone.svelte';
  import Ilustracao from '#lib/components/Ilustracao.svelte';

  type Resultado = 'a-jogar' | 'errado' | 'certo' | 'revelado';

  let criancaId = $state('');
  let recursoPedido = $state<string | null>(null);

  onMount(() => {
    criancaId = parametroUrl('crianca') ?? '';
    recursoPedido = parametroUrl('recurso');
  });

  const crianca = $derived(criancaId ? dados.crianca(criancaId) : undefined);

  const fila = $derived.by(() => {
    if (!crianca) return [];
    const aprovados = dados.recursosDaCrianca(crianca.id);
    if (recursoPedido) {
      const escolhido = aprovados.find((r) => r.id === recursoPedido);
      return escolhido ? [escolhido] : [];
    }
    return aprovados;
  });

  let indice = $state(0);
  let resultado = $state<Resultado>('a-jogar');
  let tentativasAtuais = $state(0);
  let ajudasAtuais = $state(0);
  let usouAudio = $state(false);
  let usouDica = $state(false);
  let dicaVisivel = $state(false);
  let ultimaErrada = $state<string | null>(null);
  let escolhidas = $state<Array<{ silaba: string; origem: number }>>([]);
  let respostas = $state<Resposta[]>([]);
  let inicioAtividade = $state(Date.now());
  let inicioSessao = $state('');
  let terminou = $state(false);
  let guardada = $state(false);
  let atividadeAtualId = $state('');

  const atividade = $derived(fila[indice]);
  const palavra = $derived(
    atividade ? obterPalavra(atividade.palavraId) : obterPalavra('menina')
  );
  const bloqueado = $derived(resultado === 'certo' || resultado === 'revelado');
  const total = $derived(fila.length);

  const chips = $derived.by(() => {
    if (!atividade) return [];
    const itens = [...atividade.silabas, ...atividade.opcoes];
    let semente = 0;
    for (const letra of atividade.id) semente = (semente * 31 + letra.charCodeAt(0)) >>> 0;
    const copia = [...itens];
    for (let i = copia.length - 1; i > 0; i -= 1) {
      semente = (semente * 1664525 + 1013904223) >>> 0;
      const j = semente % (i + 1);
      [copia[i], copia[j]] = [copia[j], copia[i]];
    }
    return copia.map((silaba, origem) => ({ silaba, origem }));
  });

  const imagensOpcao = $derived(
    atividade && (atividade.tipo === 'associacao' || atividade.tipo === 'frase')
      ? atividade.opcoes.map((id) => obterPalavra(id))
      : []
  );

  const instrucao = $derived.by(() => {
    if (!atividade) return '';
    switch (atividade.tipo) {
      case 'cartao':
        return 'Olha, ouve e lê com calma.';
      case 'reconhecimento':
        return 'Qual é a palavra escrita?';
      case 'associacao':
        return 'Ouve a palavra e escolhe a imagem.';
      case 'silabas':
        return 'Constrói a palavra com as sílabas.';
      case 'frase':
        return 'Lê a frase e escolhe a imagem.';
      default:
        return '';
    }
  });

  const dica = $derived.by(() => {
    if (!atividade || !palavra) return '';
    switch (atividade.tipo) {
      case 'reconhecimento':
        return `A palavra certa começa por «${atividade.silabas[0]}» e tem ${atividade.palavra.length} letras.`;
      case 'associacao':
        return `A palavra começa por «${atividade.silabas[0]}». Ouve outra vez e procura a imagem que combina.`;
      case 'silabas':
        return `A primeira sílaba é «${atividade.silabas[0]}». Tenta começar por essa parte.`;
      case 'frase':
        return `A palavra importante da frase é «${atividade.palavra}». Procura a imagem que lhe corresponde.`;
      default:
        return `A palavra é «${atividade.palavra}». Podes ouvir outra vez.`;
    }
  });

  const feedback = $derived.by(() => {
    if (!atividade) return '';
    if (resultado === 'certo') return atividade.feedbackCerto;
    if (resultado === 'errado') return atividade.feedbackErrado;
    if (resultado === 'revelado') return `A resposta certa é «${atividade.palavra}». Vamos ver com calma.`;
    return '';
  });

  $effect(() => {
    if (crianca && fila.length > 0 && !inicioSessao) {
      inicioSessao = new Date().toISOString();
    }
  });

  $effect(() => {
    const atual = fila[indice];
    if (atual && atual.id !== atividadeAtualId) {
      atividadeAtualId = atual.id;
      reiniciarAtividade();
    }
  });

  $effect(() => {
    if (terminou && !guardada && crianca && respostas.length > 0) {
      dados.registarSessao({
        id: `ses-${idCurto()}`,
        criancaId: crianca.id,
        inicio: inicioSessao || new Date().toISOString(),
        fim: new Date().toISOString(),
        respostas: [...respostas]
      });
      guardada = true;
    }
  });

  function reiniciarAtividade() {
    resultado = 'a-jogar';
    tentativasAtuais = 0;
    ajudasAtuais = 0;
    usouAudio = false;
    usouDica = false;
    dicaVisivel = false;
    ultimaErrada = null;
    escolhidas = [];
    inicioAtividade = Date.now();
  }

  function registarAudio() {
    if (bloqueado) return;
    ajudasAtuais += 1;
    usouAudio = true;
  }

  function usarDica() {
    if (bloqueado || dicaVisivel) return;
    ajudasAtuais += 1;
    usouDica = true;
    dicaVisivel = true;
  }

  function finalizar(autonoma: boolean, revelado: boolean) {
    if (!atividade || bloqueado) return;
    const tentativas = Math.max(1, tentativasAtuais);
    respostas = [
      ...respostas,
      {
        recursoId: atividade.id,
        palavra: atividade.palavra,
        tipo: atividade.tipo,
        tentativas,
        ajudas: ajudasAtuais,
        acertouPrimeira: autonoma && ajudasAtuais === 0 && !revelado,
        tempoMs: Math.max(0, Date.now() - inicioAtividade),
        usouAudio,
        usouDica,
        revelou: revelado
      }
    ];
    resultado = revelado ? 'revelado' : 'certo';
  }

  function escolherOpcao(valor: string) {
    if (!atividade || bloqueado) return;
    const certa =
      atividade.tipo === 'reconhecimento'
        ? valor.toLocaleLowerCase('pt-PT') === atividade.palavra.toLocaleLowerCase('pt-PT')
        : valor === atividade.palavraId;

    if (certa) {
      const autonoma = tentativasAtuais === 0 && ajudasAtuais === 0;
      tentativasAtuais += 1;
      finalizar(autonoma, false);
      return;
    }

    tentativasAtuais += 1;
    ultimaErrada = valor;
    if (tentativasAtuais >= 2) {
      finalizar(false, true);
    } else {
      resultado = 'errado';
    }
  }

  function tentarOutraVez() {
    if (bloqueado) return;
    resultado = 'a-jogar';
    ultimaErrada = null;
    if (atividade?.tipo === 'silabas') escolhidas = [];
  }

  function escolherSilaba(silaba: string, origem: number) {
    if (!atividade || bloqueado) return;
    if (escolhidas.length >= atividade.silabas.length) return;
    escolhidas = [...escolhidas, { silaba, origem }];
    if (resultado === 'errado') {
      resultado = 'a-jogar';
      ultimaErrada = null;
    }
    const posicao = atividade.silabas.indexOf(silaba);
    const audio =
      posicao >= 0 ? audioDaSilaba(atividade.palavraId, posicao) : fonteDaSilaba(silaba).audio;
    void tocarAudio(audio);
  }

  function removerSilaba(posicao: number) {
    if (bloqueado) return;
    escolhidas = escolhidas.filter((_, i) => i !== posicao);
  }

  function verificarSilabas() {
    if (!atividade || bloqueado) return;
    if (escolhidas.length !== atividade.silabas.length) return;
    const construida = escolhidas.map((e) => e.silaba).join('');
    const certa =
      construida.toLocaleLowerCase('pt-PT') === atividade.palavra.toLocaleLowerCase('pt-PT');
    if (certa) {
      const autonoma = tentativasAtuais === 0 && ajudasAtuais === 0;
      tentativasAtuais += 1;
      finalizar(autonoma, false);
      return;
    }
    tentativasAtuais += 1;
    if (tentativasAtuais >= 2) {
      finalizar(false, true);
    } else {
      resultado = 'errado';
      escolhidas = [];
    }
  }

  function concluirCartao() {
    if (!atividade || bloqueado) return;
    tentativasAtuais = Math.max(1, tentativasAtuais);
    finalizar(ajudasAtuais === 0, false);
  }

  function avancar() {
    if (indice + 1 >= fila.length) {
      terminou = true;
      return;
    }
    indice += 1;
  }

  function terminar() {
    terminou = true;
  }

  function repetir() {
    respostas = [];
    indice = 0;
    terminou = false;
    guardada = false;
    inicioSessao = new Date().toISOString();
    atividadeAtualId = '';
    reiniciarAtividade();
  }
</script>

<svelte:head>
  <title>Sessão de leitura — Palavra Viva</title>
  <meta
    name="description"
    content="Sessão de leitura do Palavra Viva: ouvir, escolher, construir sílabas e ler uma frase curta."
  />
</svelte:head>

<div class="sessao-app">
  <header class="barra-topo">
    <a class="barra__sair" href={crianca ? `/crianca?crianca=${crianca.id}` : '/crianca'}>
      <Icone nome="seta-esquerda" tamanho={20} /> <span>Sair</span>
    </a>
    <div class="barra__marca">
      <Icone nome="faisca" tamanho={18} />
      <span>Palavra Viva</span>
    </div>
    {#if crianca && !terminou}
      <div class="barra__progresso">
        <span class="barra__contagem">{Math.min(indice + 1, total)} de {total}</span>
        <div class="barra__trilho" role="progressbar" aria-label="Progresso da sessão" aria-valuemin="0" aria-valuemax={total} aria-valuenow={indice + 1}>
          <span style="width: {total ? ((indice + 1) / total) * 100 : 0}%"></span>
        </div>
      </div>
      {#if respostas.length > 0}
        <button type="button" class="barra__terminar" onclick={terminar}>Terminar</button>
      {/if}
    {/if}
  </header>

  {#if !crianca}
    <main class="mensagem">
      <span class="mensagem__icone" aria-hidden="true"><Icone nome="crianca" tamanho={34} /></span>
      <h1>Quem vai ler?</h1>
      <p>Escolhe o teu nome para começar. Se precisares, pede ajuda à professora.</p>
      <a class="botao botao--primario botao--grande" href="/crianca">Escolher o meu nome</a>
    </main>
  {:else if fila.length === 0}
    <main class="mensagem">
      <span class="mensagem__icone" aria-hidden="true"><Icone nome="livro" tamanho={34} /></span>
      <h1>Sem atividades, por agora.</h1>
      <p>
        Olá, {crianca.nome}. A professora ainda não aprovou nenhuma atividade para ti. Podes
        voltar às tuas palavras ou pedir-lhe para preparar uma.
      </p>
      <div class="linha">
        <a class="botao botao--secundario" href="/crianca?crianca={crianca.id}">Voltar</a>
        <a class="botao botao--primario" href="/professor/biblioteca">Ver a biblioteca</a>
      </div>
    </main>
  {:else if terminou}
    {@const autonomias = respostas.filter((r) => r.acertouPrimeira).length}
    <main class="fim">
      <div class="fim__ficha superficie-ficha">
        <div class="fim__topo">
          <span class="fim__marca"><Icone nome="check-circulo" tamanho={28} /></span>
          <p class="fim__contexto">Sessão terminada</p>
          <h1>Muito bem, {crianca.nome}!</h1>
          <p>
            {#if respostas.length > 0}
              Fizeste {respostas.length} {respostas.length === 1 ? 'atividade' : 'atividades'}.
              {autonomias} {autonomias === 1 ? 'foi resolvida' : 'foram resolvidas'} sem ajuda.
            {:else}
              Não chegaste a responder. Podes começar outra vez quando quiseres.
            {/if}
          </p>
        </div>

        {#if respostas.length > 0}
          <ul class="fim__lista">
            {#each respostas as resposta, posicao (resposta.recursoId + posicao)}
              <li>
                <span class="fim__palavra">{resposta.palavra}</span>
                <span class="fim__tipo">{NOMES_TIPO[resposta.tipo]}</span>
                {#if resposta.revelou}
                  <span class="fim__selo fim__selo--aviso">resposta mostrada</span>
                {:else if resposta.acertouPrimeira}
                  <span class="fim__selo fim__selo--ok">sem ajuda</span>
                {:else}
                  <span class="fim__selo fim__selo--info">com apoio</span>
                {/if}
              </li>
            {/each}
          </ul>
          <p class="fim__nota">
            <Icone nome="olho" tamanho={17} /> A professora vê estas tentativas e ajudas. Não é uma nota.
          </p>
        {/if}

        <div class="fim__acoes">
          <a class="botao botao--primario" href="/crianca?crianca={crianca.id}">
            <Icone nome="check" tamanho={18} /> Voltar às atividades
          </a>
          <button type="button" class="botao botao--secundario" onclick={repetir}>
            <Icone nome="refresh" tamanho={18} /> Repetir a sessão
          </button>
        </div>
      </div>
    </main>
  {:else if atividade}
    <main class="palco" aria-labelledby="pergunta">
      <div class="palco__interior">
        <div class="etapa">
          <span class="etapa__numero">{String(indice + 1).padStart(2, '0')}</span>
          <span class="etapa__texto">{NOMES_TIPO[atividade.tipo]} · {NOMES_FASE[atividade.fase]}</span>
          {#if atividade.origem === 'ia-previa'}
            <span class="etapa__selo"><Icone nome="faisca" tamanho={13} /> revisto</span>
          {/if}
        </div>

        <h1 id="pergunta">{instrucao}</h1>
        <p class="sub">{DESCRICAO_TIPO[atividade.tipo]}</p>

        <div class="atividade superficie-ficha" class:atividade--cartao={atividade.tipo === 'cartao'}>
          {#if atividade.tipo === 'cartao'}
            <div class="cartao-area">
              <FichaPalavra
                palavra={palavra}
                etiqueta="Cartão de palavra"
                mostrarFrase
                prioridade
                aoOuvir={registarAudio}
              />
              <div class="cartao-extra">
                <BotaoAudio
                  src={palavra.fraseAudio}
                  rotulo="Ouvir a frase"
                  rotuloAria="Ouvir a frase: {palavra.frase}"
                  variante="fantasma"
                  aoTocar={registarAudio}
                />
                <button type="button" class="botao botao--primario botao--grande" onclick={concluirCartao}>
                  <Icone nome="check" tamanho={20} /> Já conheço esta palavra
                </button>
              </div>
            </div>

          {:else if atividade.tipo === 'reconhecimento'}
            <div class="reconhecimento">
              {#if atividade.apoios.imagem}
                <div class="imagem-alvo"><Ilustracao palavra={palavra} prioridade /></div>
              {/if}
              <div class="opcoes-escritas" role="group" aria-label="Escolhe a palavra escrita">
                {#each atividade.opcoes as opcao (opcao)}
                  <button
                    type="button"
                    class="opcao-palavra"
                    class:errada={ultimaErrada === opcao && resultado === 'errado'}
                    class:certa={bloqueado && opcao.toLocaleLowerCase('pt-PT') === atividade.palavra.toLocaleLowerCase('pt-PT')}
                    disabled={bloqueado}
                    onclick={() => escolherOpcao(opcao)}
                  >
                    {opcao}
                  </button>
                {/each}
              </div>
              {#if atividade.apoios.silabas}
                <p class="silabas-apoio" aria-label="Sílabas da palavra">{atividade.silabas.join(' · ')}</p>
              {/if}
            </div>

          {:else if atividade.tipo === 'associacao'}
            <div class="associacao">
              <div class="palavra-alvo">
                <p class="palavra-alvo__texto">{atividade.palavra}</p>
                {#if atividade.apoios.silabas}
                  <p class="palavra-alvo__silabas">{atividade.silabas.join(' · ')}</p>
                {/if}
                {#if atividade.apoios.audio}
                  <BotaoAudio
                    src={palavra.audio}
                    rotulo="Ouvir a palavra"
                    rotuloAria="Ouvir a palavra {atividade.palavra}"
                    variante="fantasma"
                    tamanho="grande"
                    aoTocar={registarAudio}
                  />
                {/if}
              </div>
              <div class="opcoes-imagens" role="group" aria-label="Escolhe a imagem certa">
                {#each imagensOpcao as opcao (opcao.id)}
                  <button
                    type="button"
                    class="opcao-imagem"
                    class:errada={ultimaErrada === opcao.id && resultado === 'errado'}
                    class:certa={bloqueado && opcao.id === atividade.palavraId}
                    disabled={bloqueado}
                    aria-label="Imagem: {opcao.alt}"
                    onclick={() => escolherOpcao(opcao.id)}
                  >
                    <Ilustracao palavra={opcao} />
                  </button>
                {/each}
              </div>
            </div>

          {:else if atividade.tipo === 'silabas'}
            <div class="silabas-area">
              <div class="silabas-topo">
                <div class="imagem-alvo imagem-alvo--pequena"><Ilustracao palavra={palavra} prioridade /></div>
                <div>
                  <p class="silabas-palavra">{atividade.palavra}</p>
                  <div class="slots" role="group" aria-label="Sílabas escolhidas, por ordem">
                    {#each atividade.silabas as _, posicao (posicao)}
                      <button
                        type="button"
                        class="slot"
                        class:preenchido={Boolean(escolhidas[posicao])}
                        disabled={bloqueado || !escolhidas[posicao]}
                        onclick={() => removerSilaba(posicao)}
                        aria-label={escolhidas[posicao] ? `Remover ${escolhidas[posicao].silaba} da posição ${posicao + 1}` : `Posição ${posicao + 1} vazia`}
                      >
                        {escolhidas[posicao]?.silaba ?? '?'}
                      </button>
                    {/each}
                  </div>
                </div>
              </div>

              <div class="chips" role="group" aria-label="Sílabas disponíveis">
                {#each chips as chip (chip.origem)}
                  <button
                    type="button"
                    class="chip"
                    class:usado={escolhidas.some((e) => e.origem === chip.origem)}
                    class:certa={bloqueado && atividade.silabas.includes(chip.silaba)}
                    disabled={bloqueado || escolhidas.some((e) => e.origem === chip.origem) || escolhidas.length >= atividade.silabas.length}
                    onclick={() => escolherSilaba(chip.silaba, chip.origem)}
                    aria-label="Sílaba {chip.silaba}"
                  >
                    {chip.silaba}
                  </button>
                {/each}
              </div>

              <div class="silabas-acoes">
                <button
                  type="button"
                  class="botao botao--primario botao--grande"
                  disabled={escolhidas.length !== atividade.silabas.length || bloqueado}
                  onclick={verificarSilabas}
                >
                  <Icone nome="check" tamanho={20} /> Verificar
                </button>
                <button type="button" class="botao botao--secundario" onclick={() => (escolhidas = [])} disabled={bloqueado || escolhidas.length === 0}>
                  Limpar
                </button>
              </div>
              <p class="silabas-nota">
                Toca numa sílaba para a ouvir e colocar no lugar. Toca num lugar preenchido para a tirar.
              </p>
            </div>

          {:else if atividade.tipo === 'frase'}
            <div class="frase-area">
              <p class="frase">«{atividade.frase}»</p>
              {#if atividade.apoios.audio}
                <BotaoAudio
                  src={palavra.fraseAudio}
                  rotulo="Ouvir a frase"
                  rotuloAria="Ouvir a frase: {atividade.frase}"
                  variante="fantasma"
                  tamanho="grande"
                  aoTocar={registarAudio}
                />
              {/if}
              <div class="opcoes-imagens" role="group" aria-label="Escolhe a imagem que combina com a frase">
                {#each imagensOpcao as opcao (opcao.id)}
                  <button
                    type="button"
                    class="opcao-imagem"
                    class:errada={ultimaErrada === opcao.id && resultado === 'errado'}
                    class:certa={bloqueado && opcao.id === atividade.palavraId}
                    disabled={bloqueado}
                    aria-label="Imagem: {opcao.alt}"
                    onclick={() => escolherOpcao(opcao.id)}
                  >
                    <Ilustracao palavra={opcao} />
                  </button>
                {/each}
              </div>
            </div>
          {/if}
        </div>

        {#if resultado === 'a-jogar' || resultado === 'errado'}
          <div class="ajudas">
            {#if atividade.tipo === 'reconhecimento'}
              <BotaoAudio
                src="/audio/instrucoes/reconhecimento.mp3"
                rotulo="Ouvir a instrução"
                rotuloAria="Ouvir a instrução: qual é a palavra escrita"
                variante="fantasma"
                tamanho="pequeno"
              />
            {:else if atividade.tipo === 'silabas'}
              <BotaoAudio
                src={palavra.audio}
                rotulo="Ouvir a palavra inteira"
                rotuloAria="Ouvir a palavra {atividade.palavra}"
                variante="fantasma"
                tamanho="pequeno"
                aoTocar={registarAudio}
              />
            {:else if atividade.tipo === 'frase'}
              <BotaoAudio
                src="/audio/instrucoes/frase.mp3"
                rotulo="Ouvir a instrução"
                rotuloAria="Ouvir a instrução: lê a frase e escolhe a imagem"
                variante="fantasma"
                tamanho="pequeno"
              />
            {/if}
            <button type="button" class="botao botao--fantasma botao--pequeno" onclick={usarDica}>
              <Icone nome="faisca" tamanho={16} /> {dicaVisivel ? 'Dica mostrada' : 'Quero uma dica'}
            </button>
          </div>

          {#if dicaVisivel}
            <p class="dica" role="status"><Icone nome="faisca" tamanho={18} /> {dica}</p>
          {/if}
        {/if}

        <div class="resposta" aria-live="assertive">
          {#if resultado === 'errado'}
            <div class="resposta__caixa resposta__caixa--erro">
              <span class="resposta__icone"><Icone nome="x" tamanho={22} /></span>
              <p>{feedback}</p>
              <button type="button" class="botao botao--secundario botao--pequeno" onclick={tentarOutraVez}>
                <Icone nome="refresh" tamanho={16} /> Tentar outra vez
              </button>
            </div>
          {:else if resultado === 'certo'}
            <div class="resposta__caixa resposta__caixa--certo">
              <span class="resposta__icone"><Icone nome="check" tamanho={22} /></span>
              <p>{feedback}</p>
              <button type="button" class="botao botao--primario botao--pequeno" onclick={avancar}>
                {indice + 1 >= total ? 'Ver o fim' : 'Continuar'} <Icone nome="seta" tamanho={16} />
              </button>
            </div>
          {:else if resultado === 'revelado'}
            <div class="resposta__caixa resposta__caixa--aviso">
              <span class="resposta__icone"><Icone nome="olho" tamanho={22} /></span>
              <p>{feedback}</p>
              <button type="button" class="botao botao--secundario botao--pequeno" onclick={avancar}>
                {indice + 1 >= total ? 'Ver o fim' : 'Seguir'} <Icone nome="seta" tamanho={16} />
              </button>
            </div>
          {/if}
        </div>

        <p class="rodape-sessao">
          {#if ajudasAtuais > 0}
            <Icone nome="som" tamanho={15} /> {ajudasAtuais} {ajudasAtuais === 1 ? 'ajuda usada' : 'ajudas usadas'} nesta atividade.
          {:else}
            Sem pressa. Podes ouvir e tentar outra vez.
          {/if}
        </p>
      </div>
    </main>
  {/if}
</div>

<style>
  .sessao-app {
    display: flex;
    flex-direction: column;
    min-height: 100dvh;
    background: var(--papel);
  }

  .barra-topo {
    display: flex;
    align-items: center;
    gap: 0.8rem;
    min-height: 4.4rem;
    padding: 0.5rem clamp(0.7rem, 4vw, 2rem);
    border-bottom: 1.5px solid var(--linha);
    background: var(--papel-alto);
  }

  .barra__sair {
    display: inline-flex;
    align-items: center;
    gap: 0.35rem;
    min-height: 44px;
    padding: 0.35rem 0.6rem;
    border: 1.5px solid var(--linha-forte);
    border-radius: var(--raio-pill);
    color: var(--tinta);
    font-size: var(--texto-s);
    font-weight: 700;
    text-decoration: none;
  }

  .barra__sair:hover {
    background: var(--sol);
    color: var(--tinta-ficha);
  }

  .barra__marca {
    display: flex;
    align-items: center;
    gap: 0.35rem;
    color: var(--link);
    font-family: var(--fonte-titulo);
    font-size: 1.05rem;
    font-weight: 700;
    letter-spacing: -0.03em;
  }

  .barra__progresso {
    display: flex;
    align-items: center;
    gap: 0.6rem;
    margin-left: auto;
    min-width: 0;
  }

  .barra__contagem {
    color: var(--tinta-suave);
    font-size: var(--texto-s);
    font-weight: 700;
    white-space: nowrap;
    font-variant-numeric: tabular-nums;
  }

  .barra__trilho {
    width: clamp(5rem, 20vw, 14rem);
    height: 0.6rem;
    overflow: hidden;
    border: 1.5px solid var(--linha-forte);
    border-radius: var(--raio-pill);
    background: var(--papel);
  }

  .barra__trilho > span {
    display: block;
    height: 100%;
    background: var(--coral);
    transition: width 300ms ease;
  }

  .barra__terminar {
    min-height: 40px;
    padding: 0.35rem 0.7rem;
    border: 1.5px solid var(--linha-forte);
    border-radius: var(--raio-pill);
    background: transparent;
    color: var(--tinta-suave);
    font-size: var(--texto-xs);
    font-weight: 700;
    cursor: pointer;
  }

  .barra__terminar:hover {
    background: var(--coral-fundo);
    color: var(--erro);
    border-color: currentColor;
  }

  .palco,
  .mensagem,
  .fim {
    display: flex;
    flex: 1;
    justify-content: center;
    padding: clamp(1rem, 3vw, 2.4rem) clamp(0.7rem, 4vw, 2rem) 2rem;
  }

  .palco__interior {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    width: min(100%, 58rem);
  }

  .etapa {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 0.45rem;
  }

  .etapa__numero {
    display: grid;
    place-items: center;
    width: 2rem;
    height: 2rem;
    border: 1.5px solid var(--tinta-ficha);
    border-radius: 50%;
    background: var(--sol);
    color: var(--tinta-ficha);
    font-family: var(--fonte-titulo);
    font-size: 0.9rem;
    font-weight: 700;
  }

  .etapa__texto {
    color: var(--tinta-suave);
    font-size: var(--texto-s);
    font-weight: 700;
  }

  .etapa__selo {
    display: inline-flex;
    align-items: center;
    gap: 0.2rem;
    padding: 0.15rem 0.45rem;
    border: 1px solid var(--verde);
    border-radius: var(--raio-pill);
    color: var(--sucesso);
    background: var(--verde-fundo);
    font-size: 0.65rem;
    font-weight: 700;
  }

  .palco h1 {
    max-width: 23ch;
    margin: 0;
    font-size: clamp(2rem, 1.3rem + 3vw, 3.6rem);
    line-height: 1;
  }

  .sub {
    margin: 0;
    color: var(--tinta-suave);
    font-size: var(--texto-m);
    line-height: 1.4;
  }

  .atividade {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    align-items: center;
    margin-top: 0.2rem;
    padding: clamp(0.9rem, 2.5vw, 1.8rem);
    border: 2px solid var(--linha-forte);
    border-radius: var(--raio-ficha);
    background: var(--papel-ficha);
    color: var(--tinta-ficha);
    box-shadow: 6px 6px 0 color-mix(in srgb, var(--cobalto) 20%, transparent);
  }

  .atividade--cartao {
    background: var(--sol-fundo);
  }

  /* Cartão ------------------------------------------------------------------ */

  .cartao-area {
    display: grid;
    grid-template-columns: minmax(0, 1fr) minmax(0, 0.8fr);
    gap: 1.2rem;
    align-items: center;
    width: 100%;
  }

  .cartao-extra {
    display: flex;
    flex-direction: column;
    gap: 0.8rem;
    align-items: flex-start;
  }

  /* Reconhecimento ---------------------------------------------------------- */

  .reconhecimento {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1rem;
    width: 100%;
  }

  .imagem-alvo {
    width: min(100%, 13rem);
    padding: 0.4rem;
    border-radius: 50%;
    background: color-mix(in srgb, var(--sol) 30%, var(--papel-ficha));
  }

  .imagem-alvo--pequena {
    width: 7rem;
    flex: none;
  }

  .opcoes-escritas {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 0.65rem;
    width: 100%;
  }

  .opcao-palavra {
    min-height: 74px;
    min-width: 8rem;
    padding: 0.6rem 1.1rem;
    border: 2.5px solid var(--tinta-ficha);
    border-radius: 7px;
    background: var(--papel-ficha);
    color: var(--tinta-ficha);
    box-shadow: 4px 4px 0 var(--tinta-ficha);
    font-family: var(--fonte-titulo);
    font-size: clamp(1.6rem, 1.2rem + 1.6vw, 2.3rem);
    font-weight: 700;
    letter-spacing: -0.04em;
    line-height: 1;
    cursor: pointer;
    transition: transform var(--transicao), box-shadow var(--transicao), background-color var(--transicao);
  }

  .opcao-palavra:hover:not(:disabled) {
    background: var(--sol-fundo);
    transform: translate(-2px, -2px);
    box-shadow: 6px 6px 0 var(--tinta-ficha);
  }

  .opcao-palavra.errada {
    border-color: var(--erro);
    background: var(--coral-fundo);
    animation: tremer 400ms ease;
  }

  .opcao-palavra.certa {
    border-color: var(--sucesso);
    background: var(--verde-fundo);
    color: var(--sucesso);
  }

  .opcao-palavra:disabled {
    cursor: default;
    box-shadow: none;
    opacity: 0.8;
  }

  .silabas-apoio {
    margin: 0;
    color: var(--link-ficha);
    font-size: var(--texto-l);
    font-weight: 700;
  }

  /* Associação e frase ------------------------------------------------------ */

  .associacao,
  .frase-area {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1rem;
    width: 100%;
  }

  .palavra-alvo {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.4rem;
  }

  .palavra-alvo__texto {
    margin: 0;
    color: var(--tinta-ficha);
    font-family: var(--fonte-titulo);
    font-size: clamp(2.6rem, 1.6rem + 4vw, 4.6rem);
    font-weight: 700;
    letter-spacing: -0.05em;
    line-height: 0.95;
  }

  .palavra-alvo__silabas {
    margin: 0;
    color: var(--link-ficha);
    font-size: var(--texto-l);
    font-weight: 700;
  }

  .opcoes-imagens {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 0.7rem;
    width: 100%;
  }

  .opcao-imagem {
    display: grid;
    place-items: center;
    min-height: 8.6rem;
    padding: 0.5rem;
    border: 2.5px solid var(--tinta-ficha);
    border-radius: 7px;
    background: var(--papel-ficha);
    cursor: pointer;
    transition: transform var(--transicao), box-shadow var(--transicao), background-color var(--transicao);
  }

  .opcao-imagem:hover:not(:disabled) {
    background: var(--sol-fundo);
    transform: translate(-2px, -2px);
    box-shadow: 4px 4px 0 var(--tinta-ficha);
  }

  .opcao-imagem.errada {
    border-color: var(--erro);
    background: var(--coral-fundo);
    animation: tremer 400ms ease;
  }

  .opcao-imagem.certa {
    border-color: var(--sucesso);
    background: var(--verde-fundo);
  }

  .opcao-imagem:disabled {
    cursor: default;
  }

  .opcao-imagem :global(img) {
    max-height: 7rem;
    width: auto;
  }

  .frase {
    max-width: 26ch;
    margin: 0;
    color: var(--tinta-ficha);
    font-family: var(--fonte-titulo);
    font-size: clamp(1.6rem, 1.1rem + 2.2vw, 2.6rem);
    font-weight: 650;
    letter-spacing: -0.035em;
    line-height: 1.2;
    text-align: center;
  }

  /* Sílabas ----------------------------------------------------------------- */

  .silabas-area {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1.1rem;
    width: 100%;
  }

  .silabas-topo {
    display: flex;
    align-items: center;
    gap: 1rem;
    width: 100%;
    justify-content: center;
  }

  .silabas-palavra {
    margin: 0 0 0.4rem;
    color: var(--tinta-ficha);
    font-family: var(--fonte-titulo);
    font-size: clamp(1.6rem, 1.2rem + 2vw, 2.4rem);
    font-weight: 700;
    letter-spacing: -0.04em;
    line-height: 1;
  }

  .slots {
    display: flex;
    flex-wrap: wrap;
    gap: 0.4rem;
  }

  .slot {
    display: grid;
    place-items: center;
    min-width: 3.4rem;
    height: 3.4rem;
    padding: 0.2rem 0.5rem;
    border: 2.5px dashed var(--linha-forte);
    border-radius: 6px;
    background: transparent;
    color: var(--tinta-fraca);
    font-family: var(--fonte-titulo);
    font-size: 1.25rem;
    font-weight: 700;
    cursor: pointer;
  }

  .slot.preenchido {
    border-style: solid;
    border-color: var(--cobalto);
    background: var(--cobalto-fundo);
    color: var(--link-ficha);
  }

  .slot:disabled {
    cursor: default;
  }

  .chips {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 0.5rem;
  }

  .chip {
    display: grid;
    place-items: center;
    min-width: 4rem;
    min-height: 3.2rem;
    padding: 0.3rem 0.8rem;
    border: 2px solid var(--tinta-ficha);
    border-radius: var(--raio-pill);
    background: var(--papel-ficha);
    color: var(--tinta-ficha);
    box-shadow: 3px 3px 0 var(--tinta-ficha);
    font-family: var(--fonte-titulo);
    font-size: 1.3rem;
    font-weight: 700;
    cursor: pointer;
    transition: transform var(--transicao), box-shadow var(--transicao), background-color var(--transicao);
  }

  .chip:hover:not(:disabled) {
    background: var(--sol);
    transform: translate(-1px, -1px);
    box-shadow: 4px 4px 0 var(--tinta-ficha);
  }

  .chip.usado {
    visibility: hidden;
  }

  .chip.certa {
    border-color: var(--sucesso);
    background: var(--verde-fundo);
  }

  .chip:disabled {
    cursor: default;
  }

  .silabas-acoes {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: center;
    gap: 0.6rem;
  }

  .silabas-nota {
    margin: 0;
    color: var(--tinta-fraca);
    font-size: var(--texto-xs);
    text-align: center;
  }

  /* Ajudas, dica, feedback --------------------------------------------------- */

  .ajudas {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
    align-items: center;
  }

  .dica {
    display: flex;
    align-items: flex-start;
    gap: 0.45rem;
    margin: 0;
    padding: 0.65rem 0.8rem;
    border-left: 4px solid var(--sol);
    background: var(--sol-fundo);
    color: var(--tinta-ficha);
    font-size: var(--texto-s);
    line-height: 1.4;
  }

  .dica :global(svg) {
    flex: none;
    margin-top: 0.1rem;
  }

  .resposta {
    min-height: 1px;
  }

  .resposta__caixa {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 0.65rem;
    padding: 0.75rem 0.9rem;
    border: 2px solid currentColor;
    border-radius: var(--raio-ficha);
  }

  .resposta__caixa p {
    flex: 1;
    min-width: 12rem;
    margin: 0;
    font-size: var(--texto-m);
    font-weight: 700;
    line-height: 1.35;
  }

  .resposta__caixa--certo {
    border-color: var(--sucesso);
    background: var(--verde-fundo);
    color: var(--sucesso);
  }

  .resposta__caixa--erro {
    border-color: var(--erro);
    background: var(--coral-fundo);
    color: var(--erro);
  }

  .resposta__caixa--aviso {
    border-color: var(--sol);
    background: var(--sol-fundo);
    color: var(--tinta-ficha);
  }

  .resposta__icone {
    display: grid;
    place-items: center;
    width: 2.2rem;
    height: 2.2rem;
    flex: none;
    border-radius: 50%;
    background: currentColor;
  }

  .resposta__icone :global(svg) {
    color: var(--papel-ficha);
  }

  .resposta__caixa--erro .resposta__icone :global(svg),
  .resposta__caixa--certo .resposta__icone :global(svg) {
    color: #fff;
  }

  .rodape-sessao {
    display: flex;
    align-items: center;
    gap: 0.35rem;
    margin: 0;
    color: var(--tinta-fraca);
    font-size: var(--texto-xs);
  }

  /* Mensagem / fim ---------------------------------------------------------- */

  .mensagem {
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 0.8rem;
    text-align: center;
  }

  .mensagem__icone {
    display: grid;
    place-items: center;
    width: 4.5rem;
    height: 4.5rem;
    border: 2px solid var(--linha-forte);
    border-radius: 50%;
    background: var(--sol-fundo);
    color: var(--tinta-ficha);
  }

  .mensagem h1 {
    margin: 0;
    font-size: clamp(2rem, 1.4rem + 2.6vw, 3.2rem);
  }

  .mensagem p {
    max-width: 48ch;
    margin: 0;
    color: var(--tinta-suave);
    line-height: 1.5;
  }

  .fim {
    align-items: flex-start;
  }

  .fim__ficha {
    display: flex;
    flex-direction: column;
    gap: 1.1rem;
    width: min(100%, 44rem);
    margin-top: clamp(0.5rem, 3vw, 2rem);
    padding: clamp(1.2rem, 3vw, 2rem);
    border: 2px solid var(--linha-forte);
    border-radius: var(--raio-ficha);
    background: var(--papel-ficha);
    box-shadow: 8px 8px 0 color-mix(in srgb, var(--cobalto) 24%, transparent);
  }

  .fim__topo {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.5rem;
    text-align: center;
  }

  .fim__marca {
    display: grid;
    place-items: center;
    width: 4rem;
    height: 4rem;
    border: 2px solid var(--sucesso);
    border-radius: 50%;
    background: var(--verde-fundo);
    color: var(--sucesso);
  }

  .fim__contexto {
    margin: 0;
    color: var(--sucesso);
    font-size: var(--texto-s);
    font-weight: 700;
    letter-spacing: 0.04em;
    text-transform: uppercase;
  }

  .fim h1 {
    margin: 0;
    color: var(--tinta-ficha);
    font-size: clamp(2rem, 1.5rem + 2.6vw, 3.2rem);
  }

  .fim__topo > p:last-child {
    max-width: 46ch;
    margin: 0;
    color: var(--tinta-suave);
    line-height: 1.45;
  }

  .fim__lista {
    display: flex;
    flex-direction: column;
    margin: 0;
    border-top: 1.5px solid var(--linha);
  }

  .fim__lista li {
    display: flex;
    align-items: center;
    gap: 0.6rem;
    padding: 0.5rem 0;
    border-bottom: 1.5px solid var(--linha);
  }

  .fim__palavra {
    color: var(--tinta-ficha);
    font-family: var(--fonte-titulo);
    font-size: 1.25rem;
    font-weight: 700;
    letter-spacing: -0.03em;
  }

  .fim__tipo {
    flex: 1;
    color: var(--tinta-suave);
    font-size: var(--texto-xs);
  }

  .fim__selo {
    padding: 0.15rem 0.45rem;
    border-radius: var(--raio-pill);
    font-size: 0.7rem;
    font-weight: 700;
    white-space: nowrap;
  }

  .fim__selo--ok {
    background: var(--verde-fundo);
    color: var(--sucesso);
  }

  .fim__selo--info {
    background: var(--cobalto-fundo);
    color: var(--link-ficha);
  }

  .fim__selo--aviso {
    background: var(--coral-fundo);
    color: var(--erro);
  }

  .fim__nota {
    display: flex;
    align-items: center;
    gap: 0.35rem;
    margin: 0;
    color: var(--tinta-fraca);
    font-size: var(--texto-s);
    line-height: 1.4;
  }

  .fim__acoes {
    display: flex;
    flex-wrap: wrap;
    gap: 0.6rem;
  }

  @media (max-width: 760px) {
    .barra__marca {
      display: none;
    }

    .opcoes-imagens {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }

    .cartao-area {
      grid-template-columns: 1fr;
    }

    .cartao-extra {
      align-items: stretch;
    }

    .cartao-extra .botao {
      width: 100%;
    }
  }

  @media (max-width: 560px) {
    .barra-topo {
      flex-wrap: wrap;
      gap: 0.45rem;
    }

    .barra__progresso {
      width: 100%;
      margin-left: 0;
    }

    .barra__trilho {
      flex: 1;
      width: auto;
    }

    .silabas-topo {
      flex-direction: column;
    }

    .fim__lista li {
      flex-wrap: wrap;
    }

    .fim__tipo {
      flex: 1 1 100%;
      order: 3;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .opcao-palavra.errada,
    .opcao-imagem.errada {
      animation: none;
    }
  }
</style>
