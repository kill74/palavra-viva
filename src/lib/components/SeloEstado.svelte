<script lang="ts">
  import type { EstadoRecurso } from '#lib/data/tipos';
  import Icone from './Icone.svelte';

  let { estado }: { estado: EstadoRecurso } = $props();
</script>

{#if estado === 'aprovado'}
  <span class="etiqueta etiqueta--ok"><Icone nome="check-circulo" tamanho={14} /> Aprovado</span>
{:else}
  <span class="etiqueta etiqueta--aviso"><Icone nome="alerta" tamanho={14} /> Por aprovar</span>
{/if}
