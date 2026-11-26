<script lang="ts">
  import { goto } from '$app/navigation';
  import { resolve } from '$app/paths';
  import { onMount } from 'svelte';
  import EstadoVazio from '#lib/components/EstadoVazio.svelte';
  import Icone from '#lib/components/Icone.svelte';
  import { CODIGO_DEMONSTRACAO, sessao, type Perfil } from '#lib/stores/sessao.svelte';
  import { dados } from '#lib/stores/dados.svelte';
  import { parametroUrl } from '#lib/utils/consulta';
  import { MODO_SERVIDOR } from '#lib/ambiente';
  import FormularioConta from '#lib/components/FormularioConta.svelte';


  let etapa = $state<'escolha' | 'professor' | 'crianca'>('escolha');
  let codigo = $state('');
  let erro = $state('');
  let registado = $state(false);
  let erroUrl = $state('');
  let destino = $state('');
  let campoCodigo = $state<HTMLInputElement>();

  onMount(() => {
    destino = parametroUrl('destino') ?? '';
    registado = parametroUrl('registado') === '1';
    erroUrl = parametroUrl('erro') ?? '';
    const perfil = parametroUrl('perfil');
    if (perfil === 'professor') {
      etapa = 'professor';
      queueMicrotask(() => campoCodigo?.focus());
    } else if (perfil === 'crianca') {
      etapa = 'crianca';
    }
  });

  /**
   * Só aceitamos caminhos internos que comecem por uma barra e não contenham
   * barras invertidas (que alguns browsers tratam como equivalente a `/`).
   * Isto impede que um `destino` manipulado abra um site externo.
   */
  const destinoSeguro = $derived(
    destino.startsWith('/') && !destino.startsWith('//') && !destino.includes('\\')
      ? destino
      : ''
  );

  /**
   * Devolve o destino pedido, desde que seja uma rota interna protegida do
   * perfil escolhido. Aceita query strings (ex.: a biblioteca de uma criança),
   * mas recusa URLs absolutas, esquemas estranhos e a própria página de entrada.
   */
  function destinoPara(perfil: Perfil): string {
    const prefixo = perfil === 'professor' ? '/professor' : '/crianca';
    if (destinoSeguro.startsWith(prefixo) && !destinoSeguro.startsWith('/entrar')) {
      return destinoSeguro;
    }
    return prefixo;
  }

  function escolherProf() {
    etapa = 'professor';
    erro = '';
    codigo = '';
    queueMicrotask(() => campoCodigo?.focus());
  }

  function abrirEscolhaCrianca() {
    etapa = 'crianca';
    erro = '';
  }

  function digitar(event: KeyboardEvent) {
    if (event.key === 'Enter') verificarCodigo();
  }

  function verificarCodigo() {
    if (codigo.trim() !== CODIGO_DEMONSTRACAO) {
      erro = 'Esse código não está certo. Tenta outra vez.';
      campoCodigo?.focus();
      return;
    }
    erro = '';
    sessao.entrarComoProfessor();
    void goto(destinoPara('professor'));
  }

  function escolherCrianca(id: string) {
    if (!sessao.entrarComoCrianca(id)) {
      erro = 'Não encontrei essa criança na turma.';
      return;
    }
    void goto(destinoPara('crianca'));
  }

  function voltar() {
    etapa = 'escolha';
    erro = '';
  }
</script>

<svelte:head>
  <title>Entrar — Palavra Viva</title>
  <meta
    name="description"
    content="Entrar no Palavra Viva como professora ou como criança. Demonstração com dados fictícios guardados apenas neste browser."
  />
</svelte:head>

<section class="entrar" aria-labelledby="entrar-titulo">
  <div class="container entrar__interior">
    <div class="entrar__texto">
      <p class="entrar__contexto">
        <Icone nome="escudo" tamanho={18} /> Área reservada · dados fictícios
      </p>
      <h1 id="entrar-titulo">Quem vai usar o Palavra Viva hoje?</h1>
      <p class="entrar__intro">
        A professora prepara as atividades e acompanha a turma. A criança entra com o seu nome e
        encontra só o que já foi aprovado.
      </p>
      <p class="entrar__nota">
        <Icone nome="alerta" tamanho={16} />
        Isto é uma demonstração: o código está aqui ao lado e nada sai deste computador.
      </p>
    </div>

    <div class="entrar__cartao">
      {#if registado}
        <p class="sucesso" role="status"><Icone nome="check-circulo" tamanho={17} /> Conta criada. Podes entrar agora.</p>
      {/if}
      {#if etapa === 'escolha'}
        <div class="escolha">
          <h2>Escolhe o teu percurso</h2>
          <p class="ajuda">Toca num dos dois cartões para continuar.</p>

          <div class="opcoes">
            <button type="button" class="opcao opcao--professor" onclick={escolherProf}>
              <span class="opcao__icone" aria-hidden="true"><Icone nome="professor" tamanho={34} /></span>
              <span class="opcao__corpo">
                <strong>Sou professora</strong>
                <span>Preparo as atividades e acompanho a turma.</span>
              </span>
              <Icone nome="seta" tamanho={20} />
            </button>

            <button type="button" class="opcao opcao--crianca" onclick={abrirEscolhaCrianca}>
              <span class="opcao__icone" aria-hidden="true"><Icone nome="crianca" tamanho={34} /></span>
              <span class="opcao__corpo">
                <strong>Sou criança</strong>
                <span>Vou escolher o meu nome e ler uma palavra.</span>
              </span>
              <Icone nome="seta" tamanho={20} />
            </button>
          </div>
        </div>
      {:else if etapa === 'professor'}
        <div class="passo">
          <button type="button" class="voltar" onclick={voltar}>
            <Icone nome="seta-esquerda" tamanho={18} /> Voltar
          </button>
          <h2>Área da professora</h2>
          <p class="ajuda">
            {MODO_SERVIDOR
              ? 'Entra com a tua conta para aceder ao painel da turma.'
              : 'Escreve o código de demonstração para entrar no painel.'}
          </p>

          {#if erroUrl}
            <p class="erro" role="alert" aria-live="assertive">
              <Icone nome="alerta" tamanho={17} /> {erroUrl}
            </p>
          {/if}

          {#if MODO_SERVIDOR}
            <FormularioConta {destino} />
          {:else}
          <label class="rotulo" for="codigo">Código de 4 dígitos</label>
          <input
            bind:this={campoCodigo}
            bind:value={codigo}
            id="codigo"
            class="codigo"
            class:com-erro={erro}
            type="text"
            inputmode="numeric"
            autocomplete="off"
            maxlength="4"
            placeholder="····"
            aria-invalid={Boolean(erro)}
            aria-describedby={erro ? 'erro-codigo' : 'dica-codigo'}
            onkeydown={digitar}
          />
          <p id="dica-codigo" class="dica">Nesta demonstração, o código é <strong>1234</strong>.</p>
          {#if erro}
            <p id="erro-codigo" class="erro" role="alert" aria-live="assertive">
              <Icone nome="alerta" tamanho={17} /> {erro}
            </p>
          {/if}

          <button type="button" class="botao botao--primario botao--bloco" onclick={verificarCodigo}>
            <Icone nome="check" tamanho={19} /> Entrar no painel
          </button>
          {/if}
        </div>
      {:else}
        <div class="passo">
          <button type="button" class="voltar" onclick={voltar}>
            <Icone nome="seta-esquerda" tamanho={18} /> Voltar
          </button>
          <h2>Quem está a ler?</h2>
          <p class="ajuda">Toca no teu nome. A professora já preparou as atividades.</p>

          {#if dados.criancas.length === 0}
            <EstadoVazio
              titulo="Ainda não há crianças"
              texto="A professora precisa de as registar no painel primeiro."
              icone="crianca"
            />
          {:else}
            <ul class="criancas">
              {#each dados.criancas as crianca (crianca.id)}
                <li>
                  <button
                    type="button"
                    class="crianca crianca--{crianca.cor}"
                    onclick={() => escolherCrianca(crianca.id)}
                  >
                    <span class="crianca__letra" aria-hidden="true">{crianca.nome.charAt(0)}</span>
                    <span>
                      <strong>{crianca.nome}</strong>
                      <small>{crianca.idade} anos · fase {crianca.fase}</small>
                    </span>
                    <Icone nome="seta" tamanho={18} />
                  </button>
                </li>
              {/each}
            </ul>
          {/if}
          {#if erro}
            <p class="erro" role="alert" aria-live="assertive">
              <Icone nome="alerta" tamanho={17} /> {erro}
            </p>
          {/if}
        </div>
      {/if}
    </div>
  </div>
</section>

<section class="voltar-site" aria-label="Voltar ao site">
  <div class="container">
    <a class="link" href={resolve('/')}><Icone nome="seta-esquerda" tamanho={16} /> Voltar ao início</a>
  </div>
</section>

<style>
  .entrar {
    padding-block: clamp(2.5rem, 6vw, 5rem);
    background: var(--papel-alto);
    border-bottom: 1.5px solid var(--linha);
  }

  .entrar__interior {
    display: grid;
    grid-template-columns: minmax(0, 1fr) minmax(0, 0.92fr);
    gap: clamp(2rem, 5vw, 5rem);
    align-items: center;
  }

  .entrar__contexto {
    display: flex;
    align-items: center;
    gap: 0.45rem;
    margin: 0 0 1rem;
    color: var(--coral-texto);
    font-size: var(--texto-s);
    font-weight: 700;
    letter-spacing: 0.03em;
    text-transform: uppercase;
  }

  h1 {
    max-width: 15ch;
    margin: 0 0 1rem;
    font-size: var(--display-s);
    line-height: 1.05;
  }

  .entrar__intro {
    max-width: 46ch;
    margin: 0;
    color: var(--tinta-suave);
    font-size: var(--texto-l);
    line-height: 1.5;
  }

  .entrar__nota {
    display: flex;
    align-items: flex-start;
    gap: 0.45rem;
    max-width: 48ch;
    margin: 1.4rem 0 0;
    color: var(--tinta-fraca);
    font-size: var(--texto-s);
    line-height: 1.45;
  }

  .entrar__nota :global(svg) {
    flex: none;
    margin-top: 0.15rem;
  }

  .entrar__cartao {
    padding: clamp(1.4rem, 3vw, 2.2rem);
    border: 2px solid var(--linha-forte);
    border-radius: var(--raio-ficha);
    background: var(--papel-ficha);
    color: var(--tinta-ficha);
    box-shadow: 7px 7px 0 var(--sombra-ficha);
  }

  .sucesso {
    display: flex;
    align-items: center;
    gap: 0.4rem;
    margin: 0 0 1rem;
    color: var(--sucesso-ficha);
    font-size: var(--texto-s);
    font-weight: 700;
  }

  .entrar__cartao h2 {
    margin: 0 0 0.3rem;
    font-size: var(--texto-xl);
    line-height: 1.15;
  }

  .ajuda {
    margin: 0 0 1.4rem;
    color: var(--tinta-suave-ficha);
    font-size: var(--texto-s);
  }

  .opcoes {
    display: grid;
    gap: 0.8rem;
  }

  .opcao {
    display: flex;
    align-items: center;
    gap: 0.9rem;
    width: 100%;
    min-height: 88px;
    padding: 0.9rem 1rem;
    border: 2px solid var(--linha-ficha);
    border-radius: var(--raio-ficha);
    background: var(--papel-alto);
    color: var(--tinta);
    font-family: var(--fonte-texto);
    text-align: left;
    cursor: pointer;
    transition:
      transform var(--transicao),
      border-color var(--transicao),
      background-color var(--transicao),
      box-shadow var(--transicao);
  }

  :global(html[data-tema='escuro']) .opcao {
    border-color: var(--linha);
  }

  .opcao:hover {
    transform: translate(-2px, -2px);
    box-shadow: 4px 4px 0 var(--sombra-ficha);
  }

  .opcao :global(svg:last-child) {
    flex: none;
    margin-left: auto;
  }

  .opcao__icone {
    display: grid;
    place-items: center;
    flex: none;
    width: 3.4rem;
    height: 3.4rem;
    border: 2px solid currentColor;
    border-radius: var(--raio-circulo);
  }

  .opcao--professor .opcao__icone {
    color: var(--cobalto);
    background: var(--cobalto-fundo);
  }

  .opcao--crianca .opcao__icone {
    color: var(--coral-texto);
    background: var(--coral-fundo);
  }

  .opcao__corpo {
    display: grid;
    gap: 0.15rem;
  }

  .opcao__corpo strong {
    font-size: var(--texto-destaque);
    line-height: 1.2;
  }

  .opcao__corpo span {
    color: var(--tinta-suave);
    font-size: var(--texto-s);
    line-height: 1.35;
  }

  .passo {
    display: grid;
  }

  .voltar {
    display: inline-flex;
    align-items: center;
    align-self: start;
    gap: 0.35rem;
    min-height: 40px;
    margin-bottom: 1rem;
    padding: 0.2rem 0.4rem 0.2rem 0;
    border: 0;
    background: transparent;
    color: var(--link-ficha);
    font-family: var(--fonte-texto);
    font-size: var(--texto-s);
    font-weight: 700;
    cursor: pointer;
  }

  .voltar:hover {
    text-decoration: underline;
    text-decoration-thickness: 2px;
    text-underline-offset: 3px;
  }

  .rotulo {
    display: block;
    margin: 0 0 0.4rem;
    font-size: var(--texto-s);
    font-weight: 700;
  }

  .codigo {
    width: min(100%, 12rem);
    min-height: 64px;
    padding: 0.5rem 0.8rem;
    border: 2px solid var(--linha-ficha);
    border-radius: var(--raio-ficha);
    background: var(--papel-alto);
    color: var(--tinta);
    font-family: var(--fonte-titulo);
    font-size: 2rem;
    font-weight: 700;
    letter-spacing: 0.45em;
    text-align: center;
  }

  .codigo::placeholder {
    color: var(--tinta-fraca);
    opacity: 1;
  }

  .codigo.com-erro {
    border-color: var(--erro-ficha);
    background: var(--coral-fundo-ficha);
  }

  .dica {
    margin: 0.55rem 0 0;
    color: var(--tinta-suave-ficha);
    font-size: var(--texto-s);
  }

  .erro {
    display: flex;
    align-items: center;
    gap: 0.4rem;
    margin: 0.8rem 0;
    color: var(--erro-ficha);
    font-size: var(--texto-s);
    font-weight: 700;
  }

  .erro :global(svg) {
    flex: none;
  }

  .passo .botao {
    margin-top: 1.2rem;
  }

  .criancas {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 0.6rem;
    margin: 0;
    padding: 0;
    list-style: none;
  }

  .crianca {
    display: flex;
    align-items: center;
    gap: 0.65rem;
    width: 100%;
    min-height: 70px;
    padding: 0.6rem 0.7rem;
    border: 2px solid var(--linha-ficha);
    border-radius: var(--raio-ficha);
    background: var(--papel-alto);
    color: var(--tinta);
    font-family: var(--fonte-texto);
    text-align: left;
    cursor: pointer;
    transition: transform var(--transicao), box-shadow var(--transicao);
  }

  :global(html[data-tema='escuro']) .crianca {
    border-color: var(--linha);
  }

  .crianca:hover {
    transform: translate(-2px, -2px);
    box-shadow: 4px 4px 0 var(--sombra-ficha);
  }

  .crianca :global(svg:last-child) {
    flex: none;
    margin-left: auto;
  }

  .crianca__letra {
    display: grid;
    place-items: center;
    flex: none;
    width: 2.5rem;
    height: 2.5rem;
    border: 2px solid currentColor;
    border-radius: var(--raio-circulo);
    font-family: var(--fonte-titulo);
    font-size: var(--texto-destaque);
    font-weight: 800;
  }

  .crianca--coral .crianca__letra { color: var(--coral-texto); background: var(--coral-fundo); }
  .crianca--cobalto .crianca__letra { color: var(--cobalto); background: var(--cobalto-fundo); }
  .crianca--verde .crianca__letra { color: var(--sucesso); background: var(--verde-fundo); }
  .crianca--sol .crianca__letra { color: var(--tinta-ficha); background: var(--sol-fundo); }

  .crianca strong,
  .crianca small {
    display: block;
  }

  .crianca strong {
    font-size: var(--texto-s);
  }

  .crianca small {
    color: var(--tinta-suave-ficha);
    font-size: var(--texto-mini);
  }

  .voltar-site {
    padding-block: 1.2rem;
  }

  @media (max-width: 860px) {
    .entrar__interior {
      grid-template-columns: minmax(0, 1fr);
    }

    h1 {
      max-width: 24ch;
    }
  }

  @media (max-width: 480px) {
    .criancas {
      grid-template-columns: minmax(0, 1fr);
    }

    .entrar__cartao {
      box-shadow: 4px 4px 0 var(--sombra-ficha);
    }
  }
</style>
