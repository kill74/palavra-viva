<script lang="ts">
  import { MODO_SERVIDOR } from '#lib/ambiente';
  import type { Crianca, Fase } from '#lib/data/tipos';
  import { FASES, NOMES_COR } from '#lib/data/tipos';
  import { idCurto } from '#lib/utils/formato';
  import Icone from './Icone.svelte';

  let {
    crianca,
    onguardar,
    onfechar
  }: {
    crianca?: Crianca;
    onguardar: (c: Crianca, credenciais?: { email: string; password: string }) => void;
    onfechar: () => void;
  } = $props();

  // O modal é montado de novo em cada abertura: estas são intencionalmente
  // fotografias do valor inicial, não valores reativos.
  const inicial = () => $state.snapshot(crianca);
  const dadosIniciais = inicial();

  let nome = $state(dadosIniciais?.nome ?? '');
  let idade = $state(dadosIniciais?.idade ?? 6);
  let fase = $state<Fase>(dadosIniciais?.fase ?? 1);
  let cor = $state<Crianca['cor']>(dadosIniciais?.cor ?? 'coral');
  let nota = $state(dadosIniciais?.nota ?? '');
  let email = $state('');
  let password = $state('');
  let erro = $state('');

  const novo = $derived(!crianca);

  let modal = $state<HTMLDivElement>();
  let campoNome = $state<HTMLInputElement>();
  let anteriorFoco: HTMLElement | null = null;

  $effect(() => {
    // O modal é montado em cada abertura: guardamos o foco anterior e levamos
    // o utilizador diretamente ao primeiro campo.
    anteriorFoco = document.activeElement as HTMLElement | null;
    queueMicrotask(() => campoNome?.focus());
    return () => anteriorFoco?.focus();
  });

  const selecionaveis = () =>
    Array.from(
      modal?.querySelectorAll<HTMLElement>(
        'button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), a[href]'
      ) ?? []
    ).filter(
      (el) => el.offsetParent !== null || (el instanceof HTMLInputElement && el.type === 'radio')
    );

  function teclado(event: KeyboardEvent) {
    if (event.key === 'Escape') {
      event.preventDefault();
      onfechar();
      return;
    }
    if (event.key !== 'Tab') return;

    const itens = selecionaveis();
    if (itens.length === 0) return;
    const primeiro = itens[0];
    const ultimo = itens[itens.length - 1];
    const atual = document.activeElement;

    if (event.shiftKey && (atual === primeiro || !modal?.contains(atual))) {
      event.preventDefault();
      ultimo.focus();
    } else if (!event.shiftKey && (atual === ultimo || !modal?.contains(atual))) {
      event.preventDefault();
      primeiro.focus();
    }
  }

  function guardar() {
    const nomeLimpo = nome.trim();
    if (nomeLimpo.length < 2) {
      erro = 'Escreve o nome da criança (pelo menos duas letras).';
      return;
    }
    if (!Number.isInteger(idade) || idade < 3 || idade > 12) {
      erro = 'A idade deve estar entre 3 e 12 anos.';
      return;
    }
    const emailLimpo = email.trim();
    if (Boolean(emailLimpo) !== Boolean(password)) {
      erro = 'Preenche o email e a palavra-passe para criar o login da criança.';
      return;
    }
    if (MODO_SERVIDOR && !emailLimpo) {
      erro = 'No servidor, cada criança precisa de email e palavra-passe para entrar.';
      return;
    }
    if (emailLimpo && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(emailLimpo)) {
      erro = 'Escreve um email válido para a criança.';
      return;
    }
    if (password && (password.length < 10 || !/[A-ZÀ-Ú]/.test(password) ||
      !/[a-zà-ú]/.test(password) || !/\d/.test(password))) {
      erro = 'A palavra-passe deve ter 10 caracteres, maiúscula, minúscula e número.';
      return;
    }
    erro = '';
    onguardar({
      id: crianca?.id ?? `crianca-${idCurto()}`,
      nome: nomeLimpo,
      idade,
      fase,
      cor,
      nota: nota.trim(),
      palavrasTrabalhadas: crianca?.palavrasTrabalhadas ?? []
    }, emailLimpo ? { email: emailLimpo, password } : undefined);
  }
</script>

<svelte:window onkeydown={teclado} />

<div class="veu" role="presentation" onclick={onfechar}></div>
<div class="modal" role="dialog" aria-modal="true" aria-labelledby="editor-titulo" bind:this={modal}>
  <div class="modal__topo">
    <div>
      <p class="contexto"><Icone nome="lapis" tamanho={16} /> {novo ? 'Nova criança' : 'Editar criança'}</p>
      <h2 id="editor-titulo">{novo ? 'Registar uma criança' : `Editar ${dadosIniciais?.nome ?? ''}`}</h2>
    </div>
    <button type="button" class="fechar" aria-label="Fechar" onclick={onfechar}>
      <Icone nome="fechar" tamanho={20} />
    </button>
  </div>

  <div class="campos">
    <label>
      <span>Nome</span>
      <input id="nome" bind:this={campoNome} bind:value={nome} maxlength="40" autocomplete="off" />
    </label>
    <label>
      <span>Idade</span>
      <input bind:value={idade} type="number" min="3" max="12" step="1" />
    </label>
    <label>
      <span>Fase atual</span>
      <select bind:value={fase}>
        {#each FASES as f (f.numero)}
          <option value={f.numero}>{f.numero} — {f.nome}</option>
        {/each}
      </select>
    </label>
    <fieldset>
      <legend>Cor identificadora</legend>
      <div class="cores">
        {#each Object.entries(NOMES_COR) as [valor, nomeCor] (valor)}
          <label class="cor" class:selecionada={cor === valor}>
            <input type="radio" name="cor" value={valor} bind:group={cor} />
            <span class="cor__amostra" style="background: var(--{valor === 'cobalto' ? 'cobalto' : valor});" aria-hidden="true"></span>
            {nomeCor}
          </label>
        {/each}
      </div>
    </fieldset>
    <label>
      <span>Nota da professora</span>
      <textarea bind:value={nota} rows="3" maxlength="240" placeholder="O que observaste nas sessões?"></textarea>
    </label>
    <fieldset class="login-campos">
      <legend>Login da criança <span>({MODO_SERVIDOR ? 'obrigatório' : 'opcional'})</span></legend>
      <label>
        <span>Email</span>
        <input id="email-crianca" bind:value={email} type="email" autocomplete="off" placeholder="crianca@palavraviva.pt" />
      </label>
      <label>
        <span>Palavra-passe</span>
        <input id="password-crianca" bind:value={password} type="password" autocomplete="new-password" minlength="10" />
      </label>
      <p class="ajuda-login">Se preencheres ambos, a criança pode entrar com esta conta.</p>
    </fieldset>
  </div>

  {#if erro}
    <p class="erro" role="alert" aria-live="assertive"><Icone nome="alerta" tamanho={17} /> {erro}</p>
  {/if}

  <div class="acoes">
    <button type="button" class="botao botao--fantasma" onclick={onfechar}>Cancelar</button>
    <button type="button" class="botao botao--primario" onclick={guardar}>
      <Icone nome="check" tamanho={18} /> Guardar
    </button>
  </div>
</div>

<style>
  .veu {
    position: fixed;
    inset: 0;
    z-index: 70;
    background: var(--veu-imagem);
  }

  .modal {
    position: fixed;
    top: 50%;
    left: 50%;
    z-index: 71;
    width: min(100% - 2rem, 34rem);
    max-height: min(90vh, 46rem);
    overflow-y: auto;
    padding: clamp(1.2rem, 3vw, 1.8rem);
    border: 2px solid var(--linha-forte);
    border-radius: var(--raio-ficha);
    background: var(--papel-ficha);
    color: var(--tinta-ficha);
    box-shadow: 8px 8px 0 var(--sombra-ficha);
    transform: translate(-50%, -50%);
  }

  .modal__topo {
    display: flex;
    align-items: start;
    justify-content: space-between;
    gap: 1rem;
    margin-bottom: 1.3rem;
  }

  .contexto {
    display: flex;
    align-items: center;
    gap: 0.35rem;
    margin: 0 0 0.3rem;
    color: var(--cobalto);
    font-size: var(--texto-mini);
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.04em;
  }

  h2 {
    margin: 0;
    font-size: var(--texto-xl);
  }

  .fechar {
    display: grid;
    place-items: center;
    flex: none;
    width: 44px;
    height: 44px;
    border: 1.5px solid var(--linha-ficha);
    border-radius: var(--raio-circulo);
    background: transparent;
    color: var(--tinta-ficha);
    cursor: pointer;
  }

  .fechar:hover {
    background: var(--coral-fundo-ficha);
  }

  .campos {
    display: grid;
    gap: 0.9rem;
  }

  label,
  fieldset {
    display: grid;
    gap: 0.3rem;
    font-size: var(--texto-s);
    font-weight: 700;
  }

  input,
  select,
  textarea {
    width: 100%;
    min-height: 46px;
    padding: 0.55rem 0.7rem;
    border: 1.5px solid var(--linha-ficha);
    border-radius: var(--raio-ficha);
    background: var(--papel-ficha);
    color: var(--tinta-ficha);
    font-family: var(--fonte-texto);
    font-size: var(--texto-m);
    font-weight: 400;
  }

  textarea {
    resize: vertical;
  }

  input::placeholder,
  textarea::placeholder {
    color: var(--tinta-fraca-ficha);
    opacity: 1;
  }

  fieldset {
    margin: 0;
    padding: 0;
    border: 0;
  }

  legend {
    margin-bottom: 0.3rem;
    font-size: var(--texto-s);
    font-weight: 700;
  }

  .cores {
    display: flex;
    flex-wrap: wrap;
    gap: 0.4rem;
  }

  .cor {
    display: inline-flex;
    align-items: center;
    gap: 0.35rem;
    min-height: 40px;
    padding: 0.3rem 0.6rem;
    border: 1.5px solid var(--linha-ficha);
    border-radius: var(--raio-pill);
    font-weight: 700;
    cursor: pointer;
  }

  .cor.selecionada {
    border-color: var(--cobalto);
    background: var(--cobalto-fundo-ficha);
  }

  .cor input {
    position: absolute;
    opacity: 0;
    width: 1px;
    height: 1px;
  }

  .cor:focus-within {
    outline: 3px solid var(--foco);
    outline-offset: 2px;
  }

  .cor__amostra {
    width: 0.9rem;
    height: 0.9rem;
    border: 1px solid var(--linha-ficha);
    border-radius: var(--raio-circulo);
  }

  .login-campos {
    display: grid;
    gap: 0.5rem;
    margin: 0;
    padding: 0.8rem;
    border: 1.5px dashed var(--linha-ficha);
    border-radius: var(--raio-ficha);
  }

  .login-campos legend {
    font-size: var(--texto-s);
    font-weight: 700;
  }

  .login-campos legend span,
  .ajuda-login {
    color: var(--tinta-fraca-ficha);
    font-size: var(--texto-mini);
    font-weight: 400;
  }

  .ajuda-login {
    margin: 0;
    line-height: 1.4;
  }

  .erro {
    display: flex;
    align-items: center;
    gap: 0.4rem;
    margin: 0.9rem 0 0;
    color: var(--erro-ficha);
    font-size: var(--texto-s);
    font-weight: 700;
  }

  .acoes {
    display: flex;
    flex-wrap: wrap;
    justify-content: flex-end;
    gap: 0.6rem;
    margin-top: 1.3rem;
  }

  @media (max-width: 480px) {
    .modal {
      box-shadow: 4px 4px 0 var(--sombra-ficha);
    }

    .acoes :global(.botao) {
      flex: 1 1 8rem;
    }
  }
</style>
