# Correções ao relatório após a integração

Este ficheiro regista, de forma revisável, as diferenças entre o relatório original
(`relatorio/Relatorio_Palavra_Viva_Detalhado.docx`, versão 16/11/2026) e o estado atual
do código. O `.docx` foi atualizado em simultâneo; aqui ficam as evidências.

## 1. Bugs e funcionalidades corrigidas no código

| Achado original | Correção | Evidência |
| --- | --- | --- |
| Editar a palavra num recurso de `silabas`/`ordem` mantinha a resposta antiga | `mudarPalavra()` atualiza `respostaCorreta` e as sílabas extra | `src/lib/components/CamposRecurso.svelte` |
| `textoDasOpcoes()` chamava `tiposPalavra` antes da inicialização (erro em runtime) | Constantes e funções declaradas antes dos estados | `src/lib/components/CamposRecurso.svelte` |
| Ditado ignorava o nº de opções pedido (sempre 4) | `slice(0, quantidade)` em `distratoresFonicos()` | `src/lib/utils/gerador.ts` |
| Sílabas extra podiam gerar apenas 1 opção e falhar a validação | Mínimo de 2 sílabas extra | `src/lib/utils/gerador.ts` |
| Fallback de rima misturava `Palavra` e `string` | Fallback tipado a partir do catálogo | `src/lib/utils/gerador.ts` |
| Rima com apenas 1 opção e vogais finais acentuadas sem assonância | Mínimo 2 opções e `ultimaVogal()` sem diacriticos | `src/lib/utils/gerador.ts`, `src/lib/utils/similaridade.ts` |
| `uva` em ditado e `funil` em rima geravam propostas inválidas (sem parónimos/rimas no léxico) | O estúdio não oferece essas combinações; a validação continua a bloqueá-las | `src/routes/professor/criar/+page.svelte` |
| Seed incluía `Date.now()` — o "determinismo" era falso | Seed sem timestamp | `src/lib/utils/gerador.ts` |
| `recursoValido`, `aprovarRecurso`, `devolverARascunho` e `palavraSegueSequencia` eram código morto | Passaram a ser usados na aprovação, na store e no aviso de sequência | `src/lib/utils/validacao.ts`, `src/lib/stores/dados.svelte.ts`, `src/routes/professor/{criar,biblioteca}/+page.svelte` |
| Reconhecimento prometia áudio após a resposta e não o tinha | Botão de áudio da palavra após a primeira tentativa | `src/routes/crianca/sessao/+page.svelte` |
| 7 dos 9 áudios de instrução nunca eram usados | Mapa por formato + feedback e ecrã final | `src/routes/crianca/sessao/+page.svelte`, `src/routes/professor/sessoes/+page.svelte` |
| Oficina de sílabas não permitia arrastar | `draggable` + `dragstart`/`drop`, mantendo o toque | `src/lib/components/MesaSilabas.svelte` |
| Cartões de criança não mostravam `NOMES_TIPO` | Tipo da primeira atividade aprovada no cartão | `src/routes/crianca/+page.svelte` |
| `repor()` não tinha interface | Botão «Repor demonstração» no painel | `src/routes/professor/+page.svelte` |
| Erro de texto em `DESCRICAO_TIPO.ordem` | «colocar» em vez de «colocas» | `src/lib/data/tipos.ts` |
| 28 botões do mural falhavam `label-content-name-mismatch` | Rótulo passou a incluir o número visível | `src/lib/components/MuralPalavras.svelte` |
| README dizia que o áudio na associação não revelava a solução | Corrigido: é a pista principal | `README.md` |

## 2. Números recalculados (com convenção declarada)

| Afirmação original | Valor corrigido | Convenção |
| --- | --- | --- |
| 47 ficheiros de código e configuração | 56 | 43 em `src/` + 5 scripts executáveis + 2 workflows + 6 ficheiros de raiz; `axe.min.js` é vendor, não código |
| 13 839 linhas de código | 14 772 | `src/`, scripts executáveis, workflows, `deno.json`, `package.json`, `tsconfig.json`, `vite.config.ts` e `README.md` |
| 36/36 categorias Lighthouse "nos dois temas" | 64 combinações, 63 a 100 e 1 a 94 | 8 rotas × 4 categorias × 2 perfis; erro verificado por axe/testes; a exceção é o LCP mobile simulado da sessão |
| 29 ícones SVG | 28 | removeu-se o ícone «faisca» na fase de UI |
| quatro tarefas em `deno.json` | cinco | `dev`, `sync`, `check`, `build`, `preview` |

## 3. Evidências versionadas

- `scripts/testes-funcionais.mjs` → `docs/verificacao/testes-funcionais.json` (10/10 casos).
- `scripts/auditar-acessibilidade.mjs` → `docs/verificacao/axe-core.json` (18 combinações, 0 violações).
- `scripts/auditar-desempenho.mjs` → `docs/verificacao/lighthouse.json` (64 pontuações).
  A página de erro foi excluída da matriz Lighthouse: um 404 correto é `noindex`, o que o
  Lighthouse penaliza em SEO (63). Ela continua coberta por axe-core e testes funcionais.

Para reproduzir:

```sh
npx vite build
node scripts/testes-funcionais.mjs      # com vite preview em :4173
node scripts/auditar-acessibilidade.mjs # com vite preview em :4173
CHROME_PATH=/usr/bin/chromium node scripts/auditar-desempenho.mjs
```

O `axe.min.js` está vendorizado em `scripts/vendor/` para a auditoria não depender de rede.
O Lighthouse é invocado via `npx` e não é dependência do projeto.
