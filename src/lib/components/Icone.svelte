<script lang="ts">
  type Nome =
    | 'livro'
    | 'som'
    | 'seta'
    | 'seta-esquerda'
    | 'check'
    | 'x'
    | 'sol'
    | 'lua'
    | 'mais'
    | 'lapis'
    | 'olho'
    | 'silabas'
    | 'frase'
    | 'cartao'
    | 'professor'
    | 'crianca'
    | 'menu'
    | 'fechar'
    | 'faisca'
    | 'escudo'
    | 'impressora'
    | 'descarregar'
    | 'voltar'
    | 'definir'
    | 'play'
    | 'refresh'
    | 'lupa'
    | 'alerta'
    | 'check-circulo';

  let {
    nome,
    tamanho = 24,
    traco = 2
  }: { nome: Nome; tamanho?: number; traco?: number } = $props();
</script>

<svg
  width={tamanho}
  height={tamanho}
  viewBox="0 0 24 24"
  fill="none"
  stroke="currentColor"
  stroke-width={traco}
  stroke-linecap="round"
  stroke-linejoin="round"
  aria-hidden="true"
  focusable="false"
>
  {#if nome === 'livro'}
    <path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v15H6.5A2.5 2.5 0 0 0 4 20.5V5.5Z" />
    <path d="M4 20.5A2.5 2.5 0 0 1 6.5 18H20" />
    <path d="M8 7h8M8 10.5h5" />
  {:else if nome === 'som'}
    <path d="M4 9h3l4-4v14l-4-4H4Z" />
    <path d="M15 8.5a5 5 0 0 1 0 7M18 6a8.5 8.5 0 0 1 0 12" />
  {:else if nome === 'seta'}
    <path d="M4 12h15M14 6l6 6-6 6" />
  {:else if nome === 'seta-esquerda'}
    <path d="M20 12H5M10 6l-6 6 6 6" />
  {:else if nome === 'check'}
    <path d="m4 12.5 5 5L20 6.5" />
  {:else if nome === 'x'}
    <path d="M6 6l12 12M18 6 6 18" />
  {:else if nome === 'sol'}
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
  {:else if nome === 'lua'}
    <path d="M20 15.2A8.7 8.7 0 0 1 8.8 4a8.7 8.7 0 1 0 11.2 11.2Z" />
  {:else if nome === 'mais'}
    <path d="M12 5v14M5 12h14" />
  {:else if nome === 'lapis'}
    <path d="m4 20 4.3-1 10.6-10.6a2.1 2.1 0 0 0-3-3L5.3 15.9 4 20Z" />
    <path d="m14.5 6.8 3 3" />
  {:else if nome === 'olho'}
    <path d="M2.5 12s3.5-6 9.5-6 9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6Z" />
    <circle cx="12" cy="12" r="2.8" />
  {:else if nome === 'silabas'}
    <rect x="3" y="4" width="8" height="7" rx="2" />
    <rect x="13" y="4" width="8" height="7" rx="2" />
    <rect x="3" y="13" width="8" height="7" rx="2" />
    <rect x="13" y="13" width="8" height="7" rx="2" />
  {:else if nome === 'frase'}
    <path d="M4 5h16v11H9l-5 4V5Z" />
    <path d="M8 9h8M8 12h5" />
  {:else if nome === 'cartao'}
    <rect x="3" y="5" width="18" height="14" rx="2" />
    <path d="M7 10h6M7 13h4M16 10v4M14 14h4" />
  {:else if nome === 'professor'}
    <circle cx="12" cy="6" r="3" />
    <path d="M5 21v-5a4 4 0 0 1 4-4h6a4 4 0 0 1 4 4v5M8 21v-4M16 21v-4" />
  {:else if nome === 'crianca'}
    <circle cx="12" cy="6" r="3" />
    <path d="M5 21v-4a4 4 0 0 1 4-4h6a4 4 0 0 1 4 4v4M9 21l1-6M15 21l-1-6" />
  {:else if nome === 'menu'}
    <path d="M4 7h16M4 12h16M4 17h16" />
  {:else if nome === 'fechar'}
    <path d="M6 6l12 12M18 6 6 18" />
  {:else if nome === 'faisca'}
    <path d="M12 3l1.7 5.3L19 10l-5.3 1.7L12 17l-1.7-5.3L5 10l5.3-1.7L12 3Z" />
    <path d="M19 16l.8 2.2L22 19l-2.2.8L19 22l-.8-2.2L16 19l2.2-.8L19 16Z" />
  {:else if nome === 'escudo'}
    <path d="M12 2.5 20 5v6c0 5-3.2 8.5-8 10.5C7.2 19.5 4 16 4 11V5l8-2.5Z" />
    <path d="m8.5 11.5 2.3 2.3 4.8-5" />
  {:else if nome === 'impressora'}
    <path d="M7 8V3h10v5M7 17H4V9h16v8h-3" />
    <path d="M7 14h10v7H7z" />
  {:else if nome === 'descarregar'}
    <path d="M12 3v12M7 10l5 5 5-5M4 20h16" />
  {:else if nome === 'voltar'}
    <path d="M9 5 2 12l7 7M2 12h20" />
  {:else if nome === 'definir'}
    <path d="M4 6h16M4 12h16M4 18h16" />
    <circle cx="8" cy="6" r="2" fill="currentColor" stroke="none" />
    <circle cx="16" cy="12" r="2" fill="currentColor" stroke="none" />
    <circle cx="10" cy="18" r="2" fill="currentColor" stroke="none" />
  {:else if nome === 'play'}
    <path d="M8 5v14l11-7L8 5Z" fill="currentColor" stroke="none" />
  {:else if nome === 'refresh'}
    <path d="M20 5v6h-6M4 19v-6h6" />
    <path d="M6.1 9a7 7 0 0 1 11.4-2.6L20 11M4 13l2.5 4.6A7 7 0 0 0 17.9 15" />
  {:else if nome === 'lupa'}
    <circle cx="10.5" cy="10.5" r="6.5" />
    <path d="m15.5 15.5 5 5" />
  {:else if nome === 'alerta'}
    <path d="M12 3 2.5 20h19L12 3Z" />
    <path d="M12 9v5M12 17.5v.1" />
  {:else if nome === 'check-circulo'}
    <circle cx="12" cy="12" r="9" />
    <path d="m8 12 2.5 2.5L16.5 8" />
  {/if}
</svg>
