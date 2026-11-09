<script lang="ts">
  import type { Palavra } from '#lib/data/palavras';

  let {
    palavra,
    prioridade = false,
    decorativa = false,
    classe = ''
  }: {
    palavra: Palavra;
    prioridade?: boolean;
    decorativa?: boolean;
    classe?: string;
  } = $props();
</script>

<img
  class={classe}
  src={palavra.imagem}
  alt={decorativa ? '' : palavra.alt}
  width="240"
  height="180"
  loading={prioridade ? 'eager' : 'lazy'}
  fetchpriority={prioridade ? 'high' : 'auto'}
  decoding="async"
/>
