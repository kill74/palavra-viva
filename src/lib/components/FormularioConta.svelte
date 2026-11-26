<script lang="ts">
  import Icone from './Icone.svelte';

  let { destino = '' }: { destino?: string } = $props();
  let modo = $state<'entrar' | 'registar'>('entrar');
</script>

<div class="formulario">
  <div class="separador" role="tablist" aria-label="Entrar ou criar conta">
    <button
      type="button"
      role="tab"
      aria-selected={modo === 'entrar'}
      class:ativo={modo === 'entrar'}
      onclick={() => (modo = 'entrar')}
    >
      Entrar
    </button>
    <button
      type="button"
      role="tab"
      aria-selected={modo === 'registar'}
      class:ativo={modo === 'registar'}
      onclick={() => (modo = 'registar')}
    >
      Criar conta de professora
    </button>
  </div>

  {#if modo === 'entrar'}
    <form
      method="POST"
      action="/api/entrar?tipo=entrar"
    >
      <input type="hidden" name="destino" value={destino} />
      <label for="email-conta">Email</label>
      <input
        id="email-conta"
        name="email"
        type="email"
        autocomplete="email"
        required
        placeholder="professora@palavraviva.pt"
      />
      <label for="password-conta">Palavra-passe</label>
      <input
        id="password-conta"
        name="password"
        type="password"
        autocomplete="current-password"
        required
        minlength="10"
      />
      <button type="submit" class="botao botao--primario botao--bloco">
        <Icone nome="seta" tamanho={18} /> Entrar
      </button>
    </form>
    <p class="dica">Conta de demonstração: <strong>professora@palavraviva.pt</strong> / <strong>professora2026!</strong>.</p>
  {:else}
    <form
      method="POST"
      action="/api/entrar?tipo=registar"
    >
      <input type="hidden" name="papel" value="professora" />
      <label for="nome-conta">Nome</label>
      <input id="nome-conta" name="nome" type="text" required minlength="2" autocomplete="name" />
      <label for="email-registo">Email</label>
      <input id="email-registo" name="email" type="email" required autocomplete="email" />
      <label for="password-registo">Palavra-passe</label>
      <input
        id="password-registo"
        name="password"
        type="password"
        required
        minlength="10"
        autocomplete="new-password"
      />
      <p class="dica">Pelo menos 10 caracteres, com maiúscula, minúscula e número.</p>
      <button type="submit" class="botao botao--primario botao--bloco">
        <Icone nome="check" tamanho={18} /> Criar conta
      </button>
    </form>
  {/if}
</div>

<style>
  .formulario {
    display: grid;
    gap: 0.9rem;
  }

  .separador {
    display: flex;
    gap: 0.35rem;
    padding: 0.25rem;
    border: 1.5px solid var(--linha-ficha);
    border-radius: var(--raio-pill);
    background: var(--papel);
  }

  .separador button {
    flex: 1;
    min-height: 40px;
    padding: 0.35rem 0.6rem;
    border: 0;
    border-radius: var(--raio-pill);
    background: transparent;
    color: var(--tinta-ficha);
    font-family: var(--fonte-texto);
    font-size: var(--texto-mini);
    font-weight: 700;
    cursor: pointer;
  }

  .separador button.ativo {
    background: var(--cobalto);
    color: var(--sobre-acento);
  }

  form {
    display: grid;
    gap: 0.35rem;
  }

  label {
    margin-top: 0.4rem;
    font-size: var(--texto-s);
    font-weight: 700;
  }

  input {
    width: 100%;
    min-height: 48px;
    padding: 0.6rem 0.7rem;
    border: 1.5px solid var(--linha-ficha);
    border-radius: var(--raio-ficha);
    background: var(--papel-ficha);
    color: var(--tinta-ficha);
    font-family: var(--fonte-texto);
    font-size: var(--texto-m);
  }

  .dica {
    margin: 0.3rem 0 0;
    color: var(--tinta-suave-ficha);
    font-size: var(--texto-mini);
    line-height: 1.4;
  }

  .botao {
    margin-top: 0.9rem;
  }
</style>
