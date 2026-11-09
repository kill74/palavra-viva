<script lang="ts">
  let { compacta = false }: { compacta?: boolean } = $props();
</script>

<span class="marca" class:compacta>
  <svg viewBox="0 0 64 64" width="38" height="38" aria-hidden="true" focusable="false">
    <rect x="4" y="6" width="32" height="38" rx="5" fill="#2457e6" stroke="#1b2a4a" stroke-width="3.5" />
    <rect x="22" y="16" width="34" height="38" rx="5" fill="#f6c445" stroke="#1b2a4a" stroke-width="3.5" />
    <circle cx="39" cy="35" r="7" fill="#f05a47" stroke="#1b2a4a" stroke-width="3.5" />
    <path d="M12 44 L7 55 L22 50" fill="#2457e6" stroke="#1b2a4a" stroke-width="3.5" stroke-linejoin="round" />
  </svg>
  {#if !compacta}
    <span class="marca__texto">palavra <span>viva</span></span>
  {/if}
</span>

<style>
  .marca {
    display: inline-flex;
    align-items: center;
    gap: 0.55rem;
    color: currentColor;
    line-height: 1;
  }

  .marca svg {
    flex: none;
  }

  .marca__texto {
    font-family: var(--fonte-titulo);
    font-size: 1.35rem;
    font-weight: 700;
    letter-spacing: -0.045em;
    white-space: nowrap;
  }

  .marca__texto span {
    color: var(--coral-texto);
  }

  .compacta .marca__texto {
    display: none;
  }
</style>
