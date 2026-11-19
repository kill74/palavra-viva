# Decisões de design — Palavra Viva

Redesign **de aperto**, não de substituição. O projeto já tem um sistema visual
deliberado (caderno de trabalho: papel, fichas, carimbos, sílabas móveis). Esta
fase documenta o que fica, o que muda e porquê.

- Objeto da mudança: **camada visual e copy**. Lógica, rotas, dados e comportamento intactos.
- Escopo de amplitude: aperto focado. Identidade «papel + sombras deslocadas +
  Bricolage/Atkinson» mantida. Auditoria de copy nas 9 rotas.

---

## 1. Paleta

Seis cores com nome, mais estados à parte. Não há preto puro nem branco puro
fora da impressão; os neutros têm ligeiro tom quente (claro) ou azulado (escuro),
coerente com o acento.

| Papel | Token | Claro | Escuro |
| --- | --- | --- | --- |
| fundo | `--papel` | `#f4efe3` | `#101827` |
| superfície | `--papel-alto` | `#fbf8f0` | `#172136` |
| superfície de ficha | `--papel-ficha` | `#fffdf7` | `#fffdf7` (sempre clara) |
| texto | `--tinta` | `#1b2a4a` | `#f5f0e4` |
| texto secundário | `--tinta-suave` / `--tinta-fraca` | `#485773` / `#5c6980` | `#c1c8d8` / `#9da8c0` |
| borda | `--linha` / `--linha-forte` | `#c9c0b0` / `#1b2a4a` | `#3b4864` / `#8392b1` |
| **acento** | `--cobalto` | `#2457e6` | `#2d5be8` (hover do primário) |

**Acento único:** cobalto. O sol (`#f6c445`) e o coral (`#f05a47`) não são
decoração — são marcadores funcionais já existentes: sol = contexto/destaque
de instrução, coral = atenção. O verde (`#3e7c6a`) é sucesso. Esta distinção
é o que impede a paleta de virar «arco-íris por cartão».

**Estados** (baixa saturação, nunca usados como cor de marca):

| Estado | Token claro | Token escuro |
| --- | --- | --- |
| erro | `--erro #a52a1f` | `#ff9d8e` |
| sucesso | `--sucesso #1a6047` | `#8bdbbd` |
| aviso | `--sol-fundo #fff0c2` | `#3a2e12` |
| foco | `--foco #1746c9` | `#ffd86b` |

**Contraste:** AA verificado no baseline (axe-core, 9 rotas × 2 temas). Qualquer
valor novo entra com esta verificação. A ficha permanece clara no tema escuro —
é a decisão que preserva a metáfora de papel e o contraste; por isso existe um
conjunto de tokens `-ficha` e não um `!important` por componente.

**Limpeza:** `--rosa` e `--sombra-suave` não tinham usos e saíram na Fase 2.
`--menta` tem um uso pontual nas letras decorativas da área da criança: foi
avaliado na Fase 4 e **mantido**, porque não é um estado nem uma ação — fundi-lo
com `--verde` retiraria a variedade às fichas de letras.

---

## 2. Tipografia

Duas famílias, papéis distintos, ambas self-hosted com licença OFL incluída.
Nenhuma fonte nova é necessária.

| Papel | Família | Pesos usados |
| --- | --- | --- |
| títulos e números | Bricolage Grotesque (variável) | 650 nos títulos, 700 em etiquetas/números |
| texto corrido, botões, campos | Atkinson Hyperlegible | 400, 700 |

Escala (tokens existentes, `rem`):

`--texto-xs` 0.78 · `--texto-s` 0.9 · `--texto-m` 1.0625 · `--texto-l` 1.25 ·
`--texto-xl` 1.45–2.15 (fluido) · `--display-s` 2–3.4 (fluido) ·
`--display` 2.7–5.1 (fluido)

Regras: entrelinha 1.45–1.6 em texto corrido, 0.94–1.05 nos títulos; medida
máxima `--medida: 64ch`; **números tabulares** (`font-variant-numeric:
tabular-nums`) onde houver contagens. Os `font-size` literais soltos nos
componentes passam a esta escala na Fase 2.

---

## 3. Espaçamento, raios, sombras, movimento

**Espaçamento** — base 4 px, tokens `--esp-1` … `--esp-9`
(0.25 / 0.5 / 0.75 / 1 / 1.5 / 2 / 3 / 4 / 6 rem). Densidade de ferramenta
de trabalho, não de landing page: o espaço é Corte onde agrupa, não onde enche.

**Raios** — três níveis, por função:

| Nível | Token | Valor |
| --- | --- | --- |
| campo / pastilha / ilustração pequena | `--raio-botao` / `--raio-pill` | 8 px / 999 px |
| cartão / ficha | `--raio-ficha` | 6 px |
| modal / painel grande | (sem modal no projeto) | — |

Os `border-radius: 4px` e `5px` soltos são unificados nos tokens acima.

**Sombras** — regra: **sombra deslocada sólida = superfície que se pode pegar**
(ficha, cartão elevado, botão). Não há sombra difusa/decorativa em superfícies
normais; borda fina ou nenhuma. Onde existir sombra, é `Npx Npx 0
var(--sombra-ficha)`, com N coerente com o tamanho do objeto (2 px botão,
3–6 px ficha, 7–9 px painel). `--sombra-suave` é removida por não ter uso.

**Movimento** — `--transicao: 180ms cubic-bezier(0.2, 0.7, 0.3, 1)`. Só
transições que respondem a ação (hover, press, abrir menu, áudio a tocar).
Uma animação orquestrada no carregamento, no hero, reduzida a 1–2 elementos.
`prefers-reduced-motion` já desativa tudo, incluindo View Transitions — mantido.

---

## 4. Conceito de layout por ecrã

Uma frase cada. O elemento primário deve ser óbvio em < 3 s.

| Ecrã | Conceito |
| --- | --- |
| `/` | Uma manchede à esquerda e, à direita, a Oficina de sílabas a funcionar — o texto explica, a demonstração prova. |
| `/metodo` | Um índice fixo à esquerda e texto corrido com medida curta à direita; a sequência das palavras é a âncora. |
| `/professor` | Três resumos no topo, fila de revisão em seguida; a ação «criar» é o único botão primário. |
| `/professor/criar` | Formulário curto à esquerda, proposta ao vivo à direita; o botão de aprovar fica junto à validação. |
| `/professor/biblioteca` | Filtros em linha, lista à esquerda, pré-visualização à direita; aprovar é a ação final. |
| `/professor/sessoes` | Tabela de registos com números tabulares; exportar CSV é discreto, não primário. |
| `/crianca` | Uma lista curta de crianças em cartões grandes — escolher e entrar. |
| `/crianca/sessao` | Ecrã imersivo, uma pergunta, uma imagem, poucas opções; sem navegação à volta. |
| `+error` | Explicação curta e dois caminhos de saída, alinhados à esquerda. |

### Wireframes (3 ecrãs principais)

**`/` — início**

```
┌─ cabeçalho: marca ─────────── Início Método Professor Criança ─ (tema) ┐
│                                                                        │
│  │ Para o 1.º ciclo...        ┌─ Oficina de sílabas ───────┐          │
│  LER COMEÇA                  │ [img]  ? ? ?  / ni na sa me │          │
│  Numa palavra                │        constrói a palavra  │          │
│  que a criança já            └────────────────────────────┘          │
│  conhece.                    Experimenta: escolhe e constrói.         │
│  texto curto (47ch)                                                   │
│  [ Preparar uma aula ]  [ Entrar como criança ]                       │
│  protótipo com dados fictícios                                        │
├─ Duas áreas, o mesmo cuidado ─────────────────────────────────────────┤
│  [ Professora ]         [ Criança ]                                   │
├─ A palavra inteira vem primeiro ──────────────────────────────────────┤
│  (1)──(2)──(3)──(4)──(5)   percurso real, não decoração              │
└─ CTA: preparar / entrar ──────────────────────────────────────────────┘
```

**`/professor/biblioteca` — revisão**

```
┌─ Início / Professor / Biblioteca ─────────────────────────────────────┐
│  Biblioteca de recursos        Texto de contexto curto               │
│  REVER ANTES                   [ + Criar recurso ] [ Exportar CSV ]   │
│  DE MOSTRAR.                                                          │
├───────────────────────────────────────────────────────────────────────┤
│  [Procurar] [Criança] [Estado] [Tipo]                                │
│  9 recursos       1 por aprovar                                       │
│  ┌ galinha · Por aprovar ┐   ┌─ ASSOCIAR SOM E IMAGEM ───────────┐  │
│  │ menina  · Aprovado    │   │ galinha          [×]             │  │
│  │ menino  · Aprovado    │   │ Como a criança vai ver            │  │
│  │ chave   · Aprovado    │   │  ...pré-visualização...           │  │
│  └───────────────────────┘   └───────────────────────────────────┘  │
└───────────────────────────────────────────────────────────────────────┘
```

**`/crianca/sessao` — atividade (mobile)**

```
┌ [← Sair]                                  ┐
│ 1 de 2  ▓▓▓▓▓▓░░░░                        │
│ (01) Reconhecer a palavra · Sem apoio     │
│ QUAL É A PALAVRA ESCRITA?                 │
│ Escolher a palavra certa entre várias.    │
│ ┌──────────────────────────────────────┐  │
│ │            [ ilustração ]            │  │
│ │   [ menina ] [ menino ]              │  │
│ │        [ uva ]                       │  │
│ └──────────────────────────────────────┘  │
│ [Ouvir a instrução] [Quero uma dica]      │
│ Sem pressa. Podes ouvir e tentar outra vez│
└───────────────────────────────────────────┘
```

---

## 5. Revisão contra a lista de sinais de IA

Feita antes de escrever os tokens. O que estava prestes a ser «a escolha
por defeito de qualquer projeto parecido» e o que mudou:

| Sinal da lista | Estado no baseline | Decisão |
| --- | --- | --- |
| Gradientes decorativos / texto com gradiente / manchas | Grelha `linear-gradient` em `body::after` | **Removida** (Fase 2) — padrão de fundo sem função |
| Roxo/índigo por defeito; creme+serifa+terracota; quase-preto+néon | Ausente. Cobalto em vez de índigo; Atkinson/Bricolage, não serifa; coral e sol com papel funcional | **Manter** — é a identidade, não cliché |
| Glassmorphism sem função | `backdrop-filter: blur(12px)` no cabeçalho | **Removido** (Fase 2) — fundo sólido `var(--papel)` mantém a legibilidade ao scroll |
| Todos os cartões iguais, mesma sombra suave | Sombras deslocadas com N variável; fichas claras | **Manter** — N varia com o tamanho do objeto; `--sombra-suave` sem uso sai |
| Ícones em círculos coloridos / emojis / ✨ | Botões de tema e menu circulares (funcionais); sem emojis, mas o ícone «faisca» (✨) aparecia em 9 sítios | **Removido** o faisca na Fase 5 (substituído por livro/check/olho/lápis conforme o papel); mantidos os botões circulares e os círculos numerados, que são sequências reais |
| Etiquetas MAIÚSCULAS sobre cada título | Só em cabeçalho de tabela | **Manter** — não é etiqueta decorativa sobre título |
| Uma palavra destacada por título | Ausente | **Não introduzir** |
| Numeração 01/02/03 em não-sequência | 1–5 e 1–3, ambos sequências reais | **Manter** |
| Fade+slide em todas as secções | Hero com 6 elementos escalonados | **Reduzido** (Fase 4) ao título, um só elemento |
| Hero genérico (número + stats + gradiente) | Hero com demonstração interativa | **Manter** — é o ponto memorável |
| Tudo centrado | Alinhamento à esquerda por defeito | **Manter** |
| Copy de marketing / setas em todos os botões | Ausente; `→` só em notação `pa + to → pato` | **Manter** a notação; copy auditada na Fase 5 |

**O que mudou em relação ao plano original:** o plano pedia uma paleta de
«4 a 6 cores com um acento». O sistema tem cobalto como acento único e sol/coral
como marcadores funcionais — fundir estes último no acento destruiria a
diferenciação entre «dica», «atenção» e «ação». A regra registada é: acento
para ação, marcadores para estado, nada de cor por decoração.

---

## 6. Ficheiros a tocar

**Fundações:** `src/app.css` (tokens, base, textura, header via
`Cabecalho.svelte`), `src/app.html` (sem alteração prevista).

**Componentes:** `Cabecalho.svelte`, `Rodape.svelte`, `BotaoAudio.svelte`,
`EstadoVazio.svelte`, `SeloEstado.svelte`, e os restantes conforme necessário.

**Ecrãs:** `src/routes/+page.svelte` (maior concentração de dívida), `+layout.svelte`,
`+error.svelte`, `metodo/+page.svelte`, `professor/{,criar,biblioteca,sessoes}/+page.svelte`,
`crianca/{,sessao}/+page.svelte`.

**Docs:** este ficheiro, `before/` (4 capturas existentes), `after/`.
