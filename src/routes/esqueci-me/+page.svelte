<!-- Pedido de recuperação de password: a resposta é a mesma quer a conta exista quer não. -->
<script lang="ts">
  import { resolve } from '$app/paths';
  import Icone from '#lib/components/Icone.svelte';
  import { MODO_SERVIDOR } from '#lib/ambiente';

  let email = $state('');
  let mensagem = $state('');
  let erro = $state('');
  let ocupado = $state(false);

  async function pedir(evento: SubmitEvent) {
    evento.preventDefault();
    ocupado = true;
    erro = '';
    mensagem = '';
    try {
      const corpo = new FormData();
      corpo.set('email', email);
      const resposta = await fetch('/api/recuperar?tipo=pedir', { method: 'POST', body: corpo });
      const dados = await resposta.json();
      mensagem = dados.mensagem ?? 'Pedido registado.';
    } catch {
      erro = 'Não foi possível enviar o pedido. Tenta outra vez.';
    } finally {
      ocupado = false;
    }
  }
</script>

<svelte:head>
  <title>Esqueci-me da palavra-passe — Palavra Viva</title>
</svelte:head>

<section class="pagina pagina--ficha">
  <div class="container estreito">
    <p class="migalhas">
      <a href={resolve('/')}>Início</a>
      <span aria-hidden="true">/</span>
      <a href={resolve('/entrar')}>Entrar</a>
      <span aria-hidden="true">/</span>
      <span>Esqueci-me</span>
    </p>
    <p class="contexto"><Icone nome="escudo" tamanho={18} /> Recuperar acesso</p>
    <h1>Esqueci-me da palavra-passe.</h1>
    <p class="intro">
      Escreve o email da conta. Se existir, será criado um pedido de recuperação válido
      durante 30 minutos.
    </p>

    {#if !MODO_SERVIDOR}
      <p class="aviso" role="status">
        A recuperação requer a versão com base de dados. Corre os comandos
        <code>deno task db:seed</code> e <code>deno task start</code> para a usar.
      </p>
    {:else}
      <form onsubmit={pedir}>
        <label for="email-rec">Email</label>
        <input id="email-rec" bind:value={email} type="email" required autocomplete="email" />
        <button type="submit" class="botao botao--primario" disabled={ocupado}>
          {ocupado ? 'A enviar…' : 'Pedir recuperação'}
        </button>
      </form>
      {#if mensagem}<p class="sucesso" role="status">{mensagem}</p>{/if}
      {#if erro}<p class="erro" role="alert">{erro}</p>{/if}
    {/if}

    <p class="voltar"><a class="link" href={resolve('/entrar')}>Voltar a entrar</a></p>
  </div>
</section>

<style>
  .estreito { max-width: 38rem; }
  h1 { margin: 0 0 0.6rem; font-size: clamp(2rem, 1.4rem + 2.5vw, 3rem); }
  .contexto { display: flex; align-items: center; gap: 0.4rem; margin: 0 0 0.6rem; color: var(--cobalto); font-size: var(--texto-s); font-weight: 700; }
  .intro { max-width: 50ch; color: var(--tinta-suave); line-height: 1.5; }
  form { display: grid; gap: 0.4rem; margin-top: 1.5rem; }
  label { font-size: var(--texto-s); font-weight: 700; }
  input { min-height: 48px; padding: 0.6rem 0.7rem; border: 1.5px solid var(--linha-forte); border-radius: var(--raio-ficha); background: var(--papel-alto); color: var(--tinta); font-family: var(--fonte-texto); font-size: var(--texto-m); }
  .botao { margin-top: 0.8rem; justify-self: start; }
  .aviso, .sucesso, .erro { margin: 1rem 0 0; font-size: var(--texto-s); line-height: 1.5; }
  .aviso { color: var(--tinta-suave); }
  .sucesso { color: var(--sucesso); font-weight: 700; }
  .erro { color: var(--erro); font-weight: 700; }
  .voltar { margin-top: 1.4rem; }
</style>
