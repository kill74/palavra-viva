<script lang="ts">
  import { goto } from '$app/navigation';
  import { resolve } from '$app/paths';
  import { onMount } from 'svelte';
  import Icone from '#lib/components/Icone.svelte';
  import { MODO_SERVIDOR } from '#lib/ambiente';
  import { parametroUrl } from '#lib/utils/consulta';

  let token = $state('');
  let password = $state('');
  let confirmacao = $state('');
  let mensagem = $state('');
  let erro = $state('');
  let ocupado = $state(false);

  onMount(() => { token = parametroUrl('token') ?? ''; });

  async function redefinir(evento: SubmitEvent) {
    evento.preventDefault();
    erro = '';
    if (password !== confirmacao) {
      erro = 'As palavras-passe não coincidem.';
      return;
    }
    ocupado = true;
    try {
      const corpo = new FormData();
      corpo.set('token', token);
      corpo.set('password', password);
      const resposta = await fetch('/api/recuperar?tipo=redefinir', { method: 'POST', body: corpo });
      const dados = await resposta.json();
      if (!resposta.ok) {
        erro = dados.erro ?? 'Não foi possível redefinir a palavra-passe.';
        return;
      }
      mensagem = 'Palavra-passe redefinida. Podes entrar agora.';
      setTimeout(() => void goto(resolve('/entrar')), 1200);
    } catch {
      erro = 'Não foi possível concluir. Tenta outra vez.';
    } finally {
      ocupado = false;
    }
  }
</script>

<svelte:head>
  <title>Redefinir palavra-passe — Palavra Viva</title>
</svelte:head>

<section class="pagina pagina--ficha">
  <div class="container estreito">
    <p class="migalhas">
      <a href={resolve('/')}>Início</a>
      <span aria-hidden="true">/</span>
      <span>Redefinir palavra-passe</span>
    </p>
    <p class="contexto"><Icone nome="escudo" tamanho={18} /> Nova palavra-passe</p>
    <h1>Redefinir palavra-passe.</h1>

    {#if !MODO_SERVIDOR}
      <p class="aviso">Esta página requer a versão com base de dados.</p>
    {:else if !token}
      <p class="erro" role="alert">Falta o código de recuperação no endereço.</p>
    {:else}
      <form onsubmit={redefinir}>
        <label for="nova-pass">Nova palavra-passe</label>
        <input id="nova-pass" bind:value={password} type="password" required minlength="10" autocomplete="new-password" />
        <label for="conf-pass">Confirmar palavra-passe</label>
        <input id="conf-pass" bind:value={confirmacao} type="password" required minlength="10" autocomplete="new-password" />
        <p class="dica">Pelo menos 10 caracteres, com maiúscula, minúscula e número.</p>
        <button type="submit" class="botao botao--primario" disabled={ocupado}>
          {ocupado ? 'A guardar…' : 'Guardar nova palavra-passe'}
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
  form { display: grid; gap: 0.4rem; margin-top: 1.5rem; }
  label { font-size: var(--texto-s); font-weight: 700; }
  input { min-height: 48px; padding: 0.6rem 0.7rem; border: 1.5px solid var(--linha-forte); border-radius: var(--raio-ficha); background: var(--papel-alto); color: var(--tinta); font-family: var(--fonte-texto); font-size: var(--texto-m); }
  .dica, .aviso { color: var(--tinta-suave); font-size: var(--texto-s); }
  .botao { margin-top: 0.8rem; justify-self: start; }
  .sucesso, .erro { margin: 1rem 0 0; font-size: var(--texto-s); font-weight: 700; }
  .sucesso { color: var(--sucesso); }
  .erro { color: var(--erro); }
  .voltar { margin-top: 1.4rem; }
</style>
