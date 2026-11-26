<script lang="ts">
  import { invalidateAll } from '$app/navigation';
  import { resolve } from '$app/paths';
  import Icone from '#lib/components/Icone.svelte';
  import { dados } from '#lib/stores/dados.svelte';
  import { sessao } from '#lib/stores/sessao.svelte';
  import { dataLonga, percentagem, hora } from '#lib/utils/formato';
  import { resumoCrianca } from '#lib/utils/recomendacao';
  import { MODO_SERVIDOR } from '#lib/ambiente';

  let { data } = $props();
  let mensagem = $state('');

  let segredo = $state('');
  let uri = $state('');
  let codigo2fa = $state('');
  let recuperacoes = $state<string[]>([]);
  let erro2fa = $state('');

  async function action2fa(acao: string, corpo?: object) {
    erro2fa = '';
    const resposta = await fetch('/api/2fa', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ acao, ...corpo })
    });
    const dados = await resposta.json();
    if (!resposta.ok) { erro2fa = dados.erro ?? 'Não foi possível concluir.'; return; }
    return dados;
  }

  async function comecar2fa() {
    const dados = await action2fa('gerar');
    if (dados) { segredo = dados.secret; uri = dados.uri; }
  }

  async function confirmar2fa() {
    const dados = await action2fa('ativar', { secret: segredo, codigo: codigo2fa });
    if (dados?.recuperacoes) { recuperacoes = dados.recuperacoes; segredo = ''; codigo2fa = ''; }
  }

  async function parar2fa() {
    if (!window.confirm('Desativar a verificação em dois passos?')) return;
    await action2fa('desativar');
    recuperacoes = [];
    await invalidateAll();
  }

  async function terminarSessoes() {
    if (!window.confirm('Terminar todas as sessões? Vais ser desligado.')) return;
    await fetch('/api/sessoes', { method: 'POST' });
    window.location.href = '/entrar/';
  }

  const stats = $derived(dados.estatisticas());
  const alunos = $derived(
    dados.criancas.map((c) => ({ crianca: c, resumo: resumoCrianca(dados.sessoes, c.id) }))
  );
</script>

<svelte:head>
  <title>O meu perfil — Palavra Viva</title>
  <meta name="description" content="Perfil da professora e resumo da turma no Palavra Viva." />
</svelte:head>

<section class="pagina pagina--ficha">
  <div class="container">
    <p class="migalhas">
      <a href={resolve('/')}>Início</a>
      <span aria-hidden="true">/</span>
      <span>O meu perfil</span>
    </p>

    <div class="cabeca">
      <div>
        <p class="contexto"><Icone nome="professor" tamanho={18} /> Conta da professora</p>
        <h1>O meu perfil.</h1>
      </div>
      <div>
        <p>Os dados da tua conta e um resumo do trabalho feito com a turma.</p>
        <div class="pagina__acao">
          <a class="botao botao--primario" href={resolve('/professor')}>
            <Icone nome="seta" tamanho={18} /> Ir para o painel
          </a>
        </div>
      </div>
    </div>

    <div class="cartao">
      <div class="avatar" aria-hidden="true">
        {sessao.perfil === 'professor' ? 'P' : 'C'}
      </div>
      <div>
        <h2>Professora</h2>
        <p>Perfil ligado a este browser. Sessão de demonstração.</p>
        <dl class="dados">
          <div><dt>Perfil</dt><dd>Professora</dd></div>
          <div><dt>Sessão</dt><dd>{sessao.perfil ?? 'Não iniciada'}</dd></div>
          <div><dt>Turma</dt><dd>{dados.criancas.length} crianças</dd></div>
        </dl>
      </div>
    </div>

    <div class="resumos" aria-label="Resumo da turma">
      <div><span>Sessões</span><strong>{stats.sessoes}</strong></div>
      <div><span>Respostas</span><strong>{stats.respostas}</strong></div>
      <div><span>Autonomia</span><strong>{stats.percentagemAutonoma}%</strong></div>
      <div><span>Ajudas</span><strong>{stats.ajudas}</strong></div>
    </div>

    <section class="bloco" aria-labelledby="alunos-titulo">
      <div class="bloco__cabeca">
        <h2 id="alunos-titulo">Crianças acompanhadas</h2>
        <p> Resume de cada percurso; a fase indica o apoio, não uma nota.</p>
      </div>
      <ul class="alunos">
        {#each alunos as { crianca, resumo } (crianca.id)}
          <li>
            <a href={resolve('/professor/crianca') + '?crianca=' + crianca.id}>
              <span class="alunos__inicial" aria-hidden="true">{crianca.nome.charAt(0)}</span>
              <span>
                <strong>{crianca.nome}</strong>
                <small>Fase {crianca.fase} · {resumo.sessoes} sessões · {percentagem(resumo.autonomas, resumo.respostas)}% autónomas</small>
              </span>
              <Icone nome="seta" tamanho={18} />
            </a>
          </li>
        {/each}
      </ul>
    </section>

    {#if MODO_SERVIDOR && data?.sessoes && data.sessoes.length > 0}
      <section class="bloco sessoes" aria-labelledby="sessoes-titulo">
        <div class="bloco__cabeca">
          <h2 id="sessoes-titulo">Sessões ativas</h2>
          <p>{data.sessoes.length} {data.sessoes.length === 1 ? 'sessão' : 'sessões'}</p>
        </div>
        <ul>
          {#each data.sessoes as sessao (sessao.id)}
            <li>
              <Icone nome="escudo" tamanho={16} />
              <span>{dataLonga(sessao.criadoEm)} às {hora(sessao.criadoEm)}</span>
              <small>Expira a {dataLonga(sessao.expiraEm)}</small>
            </li>
          {/each}
        </ul>
        <button type="button" class="botao botao--perigo botao--pequeno" onclick={terminarSessoes}>
          Terminar todas as sessões
        </button>
      </section>
    {/if}

    {#if MODO_SERVIDOR && data?.doisFatores}
      <section class="bloco" aria-labelledby="2fa-titulo">
        <div class="bloco__cabeca">
          <h2 id="2fa-titulo">Verificação em dois passos</h2>
          <p>{data.doisFatores?.ativo ? 'Ativa' : 'Não configurada'}</p>
        </div>

        {#if data.doisFatores?.ativo}
          <p class="dica-2fa">A tua conta pede um código da app de autenticação ao entrar.</p>
          <button type="button" class="botao botao--perigo botao--pequeno" onclick={parar2fa}>
            Desativar verificação
          </button>
        {:else if segredo}
          <ol class="passos-2fa">
            <li>Abre a app de autenticação e adiciona esta conta.</li>
            <li>Usa este código secreto: <code>{segredo}</code></li>
            <li>Ou abre <a href={uri} class="link">esta ligação</a> na app.</li>
            <li>Depois escreve o código de 6 dígitos para confirmar.</li>
          </ol>
          <div class="campo-2fa">
            <label for="codigo-2fa">Código da app</label>
            <input id="codigo-2fa" bind:value={codigo2fa} inputmode="numeric" maxlength="6" autocomplete="one-time-code" />
            <button type="button" class="botao botao--primario botao--pequeno" onclick={confirmar2fa}>Confirmar</button>
          </div>
        {:else}
          <button type="button" class="botao botao--secundario botao--pequeno" onclick={comecar2fa}>
            Configurar verificação
          </button>
        {/if}

        {#if recuperacoes.length > 0}
          <div class="recuperacoes">
            <p><strong>Guarda estes códigos de recuperação</strong> — cada um só pode ser usado uma vez:</p>
            <ul>{#each recuperacoes as codigo (codigo)}<li><code>{codigo}</code></li>{/each}</ul>
          </div>
        {/if}
        {#if erro2fa}<p class="erro-2fa" role="alert">{erro2fa}</p>{/if}
      </section>
    {/if}

    <p class="nota-final">
      <Icone nome="escudo" tamanho={16} />
      Os registos são fictícios e ficam apenas neste browser.
    </p>
  </div>
</section>

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

  .cartao {
    display: flex;
    align-items: center;
    gap: 1.2rem;
    padding: clamp(1.1rem, 2.5vw, 1.8rem);
    border: 1.5px solid var(--linha);
    border-radius: var(--raio-ficha);
    background: var(--papel-alto);
  }

  .avatar {
    display: grid;
    place-items: center;
    flex: none;
    width: 4.5rem;
    height: 4.5rem;
    border: 2px solid var(--linha-forte);
    border-radius: var(--raio-circulo);
    background: var(--cobalto-fundo);
    color: var(--cobalto);
    font-family: var(--fonte-titulo);
    font-size: var(--texto-grande);
    font-weight: 800;
  }

  h2 {
    margin: 0;
    font-size: var(--texto-xl);
  }

  .cartao p {
    margin: 0.25rem 0 0;
    color: var(--tinta-suave);
    font-size: var(--texto-s);
  }

  .dados {
    display: flex;
    flex-wrap: wrap;
    gap: 0.8rem 2rem;
    margin: 0.8rem 0 0;
  }

  .dados div {
    display: grid;
  }

  .dados dt {
    color: var(--tinta-fraca);
    font-size: var(--texto-mini);
    text-transform: uppercase;
    letter-spacing: 0.04em;
  }

  .dados dd {
    margin: 0;
    font-weight: 700;
  }

  .resumos {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 0.8rem;
    margin: 1.4rem 0;
  }

  .resumos div {
    display: grid;
    gap: 0.2rem;
    padding: 1rem;
    border: 1.5px solid var(--linha);
    border-radius: var(--raio-ficha);
    background: var(--papel-alto);
  }

  .resumos span {
    color: var(--tinta-fraca);
    font-size: var(--texto-mini);
    text-transform: uppercase;
    letter-spacing: 0.04em;
  }

  .resumos strong {
    font-family: var(--fonte-titulo);
    font-size: var(--texto-dado);
  }

  .bloco {
    padding: clamp(1.1rem, 2.5vw, 1.8rem);
    border: 1.5px solid var(--linha);
    border-radius: var(--raio-ficha);
    background: var(--papel-alto);
  }

  .bloco__cabeca {
    display: flex;
    flex-wrap: wrap;
    align-items: baseline;
    justify-content: space-between;
    gap: 0.5rem 1.5rem;
    margin-bottom: 1rem;
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

  .alunos {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 0.6rem;
    margin: 0;
    padding: 0;
    list-style: none;
  }

  .alunos a {
    display: flex;
    align-items: center;
    gap: 0.7rem;
    min-height: 64px;
    padding: 0.6rem 0.8rem;
    border: 1.5px solid var(--linha);
    border-radius: var(--raio-ficha);
    color: var(--tinta);
    text-decoration: none;
    transition: background-color var(--transicao), transform var(--transicao);
  }

  .alunos a:hover {
    background: var(--sol-fundo);
    transform: translate(-2px, -2px);
  }

  .alunos__inicial {
    display: grid;
    place-items: center;
    flex: none;
    width: 2.6rem;
    height: 2.6rem;
    border: 1.5px solid var(--linha-forte);
    border-radius: var(--raio-circulo);
    font-family: var(--fonte-titulo);
    font-weight: 800;
  }

  .alunos strong,
  .alunos small {
    display: block;
  }

  .alunos small {
    color: var(--tinta-fraca);
    font-size: var(--texto-mini);
  }

  .alunos a :global(svg) {
    margin-left: auto;
  }

  .dica-2fa {
    color: var(--tinta-suave);
    font-size: var(--texto-s);
  }

  .passos-2fa {
    max-width: 55ch;
    margin: 0 0 1rem;
    padding-left: 1.2rem;
    color: var(--tinta-suave);
    font-size: var(--texto-s);
    line-height: 1.6;
  }

  .campo-2fa {
    display: flex;
    flex-wrap: wrap;
    align-items: end;
    gap: 0.6rem;
  }

  .campo-2fa label {
    display: grid;
    gap: 0.3rem;
    font-size: var(--texto-s);
    font-weight: 700;
  }

  .campo-2fa input {
    min-height: 46px;
    padding: 0.5rem 0.7rem;
    border: 1.5px solid var(--linha-forte);
    border-radius: var(--raio-ficha);
    background: var(--papel-alto);
    color: var(--tinta);
    font-family: var(--fonte-texto);
  }

  .recuperacoes {
    margin-top: 1rem;
    padding: 0.8rem;
    border: 2px solid var(--sol);
    border-radius: var(--raio-ficha);
    background: var(--sol-fundo);
  }

  .recuperacoes p {
    margin: 0 0 0.5rem;
    font-size: var(--texto-s);
  }

  .recuperacoes ul {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 0.3rem;
    margin: 0;
    padding: 0;
    list-style: none;
  }

  .erro-2fa {
    margin: 0.8rem 0 0;
    color: var(--erro);
    font-size: var(--texto-s);
    font-weight: 700;
  }

  .sessoes {
    margin-top: 1.4rem;
  }

  .sessoes ul {
    display: grid;
    gap: 0.5rem;
    margin: 0 0 1rem;
    padding: 0;
    list-style: none;
  }

  .sessoes li {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 0.4rem 0.8rem;
    padding: 0.6rem 0;
    border-bottom: 1px solid var(--linha);
  }

  .sessoes li small {
    margin-left: auto;
    color: var(--tinta-fraca);
    font-size: var(--texto-mini);
  }

  .nota-final {
    display: flex;
    align-items: center;
    gap: 0.4rem;
    margin: 1.2rem 0 0;
    color: var(--tinta-fraca);
    font-size: var(--texto-s);
  }

  :global(html[data-tema='escuro']) .contexto {
    color: var(--link);
  }

  @media (max-width: 760px) {
    .cabeca,
    .alunos {
      grid-template-columns: minmax(0, 1fr);
    }

    .resumos {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
  }
</style>
