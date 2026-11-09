<script lang="ts">
  import Marca from './Marca.svelte';
</script>

<footer class="rodape">
  <div class="container rodape__interior">
    <div class="rodape__marca">
      <Marca />
      <p>Uma palavra com sentido antes de uma letra isolada. O percurso completo, com a professora a rever cada passo.</p>
    </div>

    <div class="rodape__colunas">
      <div>
        <h2>Percurso</h2>
        <ul>
          <li><a href="/">Início</a></li>
          <li><a href="/metodo">Método e validação</a></li>
          <li><a href="/professor">Área do professor</a></li>
          <li><a href="/crianca">Área da criança</a></li>
        </ul>
      </div>
      <div>
        <h2>Projeto</h2>
        <ul>
          <li><a href="/metodo#sequencia">As 28 palavras</a></li>
          <li><a href="/metodo#ia">Como a IA entra</a></li>
          <li><a href="/metodo#testes">Testes funcionais</a></li>
          <li><a href="/metodo#referencias">Referências</a></li>
        </ul>
      </div>
    </div>
  </div>

  <div class="container rodape__fim">
    <p>Protótipo académico de Design de Sistemas Interativos · 2026</p>
    <p>Turma, nomes e registos são fictícios. Os dados ficam apenas neste browser.</p>
  </div>
</footer>

<style>
  .rodape {
    border-top: 6px solid var(--cobalto);
    background: var(--rodape-fundo);
    color: var(--rodape-texto);
    --coral-texto: #ffb3a6;
  }

  .rodape__interior {
    display: grid;
    grid-template-columns: minmax(0, 1.2fr) minmax(0, 0.9fr);
    gap: 2rem;
    padding-block: clamp(2.5rem, 6vw, 4.5rem);
  }

  .rodape__marca {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    max-width: 42ch;
  }

  .rodape__marca p {
    margin: 0;
    color: #c7d1e5;
    font-size: var(--texto-s);
    line-height: 1.55;
  }

  .rodape__colunas {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 1.5rem;
  }

  h2 {
    margin: 0 0 0.6rem;
    color: var(--rodape-texto);
    font-family: var(--fonte-texto);
    font-size: var(--texto-s);
    font-weight: 700;
    letter-spacing: 0;
  }

  ul {
    display: flex;
    flex-direction: column;
    gap: 0.35rem;
    margin: 0;
  }

  a {
    color: #e8edf7;
    font-size: var(--texto-s);
    text-decoration: none;
    text-underline-offset: 3px;
  }

  a:hover {
    color: var(--rodape-fundo);
    background: var(--sol);
    text-decoration: underline;
  }

  .rodape__fim {
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
    gap: 0.5rem 1.5rem;
    padding-block: 1rem 1.3rem;
    border-top: 1px solid rgba(244, 239, 227, 0.22);
  }

  .rodape__fim p {
    margin: 0;
    color: #b9c4d9;
    font-size: var(--texto-xs);
  }

  @media (max-width: 760px) {
    .rodape__interior {
      grid-template-columns: 1fr;
    }
  }

  @media (max-width: 460px) {
    .rodape__colunas {
      grid-template-columns: 1fr;
    }
  }
</style>
