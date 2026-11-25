# Prompt para o Claude — Apresentação PowerPoint «Palavra Viva»

> **Como usar:** anexe ao Claude o ficheiro `relatorio/Relatorio_Palavra_Viva_Detalhado.docx` e, se possível, as capturas `docs/screenshots/home-escuro.webp`, `home-claro.webp`, `biblioteca.webp` e `sessao-mobile.webp`. Cole todo o conteúdo deste ficheiro numa nova conversa. O Claude deve devolver um `.pptx` editável; se não tiver ferramenta para gerar o ficheiro, deve devolver o guião completo e um script `python-pptx` executável.
>
> **Resultado esperado:** 14 slides, 16:9, em português europeu, com notas do orador, identidade visual do projeto e números exatamente iguais aos do relatório.

---

## 1. Papel e missão

Assume o papel de designer de apresentações e comunicador científico. A tua missão é criar, de raiz, uma apresentação em PowerPoint sobre o projeto **Palavra Viva**, a partir do relatório técnico anexado. A apresentação destina-se à defesa do Trabalho Prático 1 da disciplina de Design de Sistemas Interativos (DSI).

Não faças um resumo corrido do relatório. Constrói uma narrativa de 10 a 12 minutos, com uma mensagem por slide, evidência verificável e um fio condutor claro: **problema → princípio → método → arquitetura → produto → evidência → limites → conclusão**.

## 2. Fontes e regra de verdade

1. Lê o relatório anexado de início ao fim, com especial atenção ao resumo executivo, às secções 1 a 12 e aos anexos A, B, D e F.
2. Usa o relatório como **única fonte de conteúdo**. Podes usar as capturas de ecrã fornecidas como apoio visual.
3. **Não inventes** números, funcionalidades, citações, resultados ou nomes. Se um dado não estiver no relatório, não o apresentes.
4. O quadro «Factos verificáveis» (secção 6) serve de controlo rápido. Se houver conflito com o relatório, prevalece o relatório; assinala a divergência no fim.
5. Se o relatório não estiver anexado, **interrompe e pede-o**. Não construas a apresentação de memória.
6. Todos os nomes, turmas e sessões do relatório são fictícios. Não os apresentes como dados reais.

## 3. Parâmetros da apresentação

| Parâmetro | Definição |
|---|---|
| Título | Palavra Viva — Sistema interativo de aprendizagem da leitura pelo Método das 28 Palavras |
| Autor | Guilherme Sales |
| Disciplina | Design de Sistemas Interativos (DSI) |
| Trabalho | Trabalho Prático 1 — Protótipo funcional |
| Data | Novembro de 2026 (relatório emitido a 16 de novembro de 2026) |
| Público | Docente e colegas da turma de DSI |
| Duração | 10 a 12 minutos; cerca de 40 a 50 segundos por slide |
| Idioma | Português europeu (pt-PT), do início ao fim |
| Formato | 16:9, 13,333 × 7,5 polegadas (1 280 × 720 px a 96 dpi) |
| Número de slides | 14, incluindo capa e conclusão |
| Tema | Claro, com fundo de papel; capa e eventuais separadores em tinta escura |
| Ficheiro | `Palavra_Viva_Apresentacao_TP1.pptx` |
| Estilo | Académico, sóbrio, editorial, confiante; sem linguagem de marketing |

**Assunções:** não faças perguntas de clarificação, exceto se o relatório faltar. Se o pedido do utilizador for ambíguo, assume a interpretação mais conservadora e regista a assunção no fim.

**Adaptação:** se o utilizador indicar uma duração diferente, mantém a ordem narrativa e ajusta o número de slides (entre 8 e 14), condensando ou fundindo os slides de produto e de limites. Não alteres os factos.

## 4. Fio narrativo e princípios de conteúdo

O arco da apresentação é:

1. **Problema** (slide 2): o rigor necessário e o custo de produzir materiais à mão.
2. **Princípio** (slide 3): a IA propõe, a professora decide, a criança aprende.
3. **Método** (slide 4): a sequência das 28 palavras e as seis fases.
4. **Arquitetura e fluxo** (slides 5 e 6): offline-first e o ponto de controlo humano.
5. **Produto** (slides 7 a 10): validação, área da professora, área da criança, identidade e acessibilidade.
6. **Evidência** (slide 11): testes, acessibilidade e Lighthouse.
7. **Limites e ética** (slides 12 e 13).
8. **Conclusão** (slide 14): requisitos, diferenciais e princípio final.

Princípios obrigatórios:

- **Um slide, uma ideia.** O título deve afirmar a ideia, não apenas nomear o tema.
- **O texto visível apoia a fala;** não a duplica. Máximo de 6 bullets por slide e cerca de 12 palavras por bullet.
- **Cada afirmação relevante tem um número, um exemplo ou um artefacto** do relatório.
- **Prefere diagramas a paredes de texto.** Usa formas nativas, setas e etiquetas curtas.
- **Nada de dados inventados.** Se um número não estiver no quadro da secção 6 nem no relatório, não aparece.
- **Fecha cada slide com uma transição** para o seguinte, nas notas do orador.

## 5. Guião slide a slide

**Nota:** os bullets abaixo são a substância de cada slide. No ficheiro final, sintetiza-os em frases curtas — idealmente até 12 palavras — e reserva os detalhes para as notas do orador. Não copies os bullets longos para o slide.

### Slide 1 — Capa

**Título:** Palavra Viva
**Subtítulo:** Sistema interativo de aprendizagem da leitura pelo Método das 28 Palavras
**Etiqueta:** IA generativa com revisão humana · Protótipo funcional offline-first
**Autor:** Guilherme Sales · Design de Sistemas Interativos · TP1 · Novembro de 2026
**Links (pequenos, no fundo):** `https://kill74.github.io/palavra-viva/` · `github.com/kill74/palavra-viva`

**Visual:** fundo de papel `#f4efe3`; marca «palavra viva»; três peças com as sílabas «me», «ni» e «na» como elemento gráfico; sem captura de ecrã. A capa deve ser limpa e respirar.

**Notas do orador (60 a 90 palavras):** cumprimentar; apresentar o projeto numa frase; dizer o percurso da apresentação; não ler o subtítulo. Sugestão de abertura: «Uma criança que aprende a ler não pode depender de um modelo que inventa. Foi por isso que construí o Palavra Viva: a IA propõe, a professora decide e a criança aprende.»

### Slide 2 — O problema

**Título:** Ensinar a ler exige materiais que não podem falhar
**Mensagem-chave:** O rigor pedagógico e a produção manual criam um estrangulamento real.

**Conteúdo de apoio (4 bullets):**
- Uma palavra mal segmentada, uma imagem ambígua ou uma frase com vocabulário desconhecido comprometem a aprendizagem.
- Produzir fichas, imagens, frases e áudios à mão é lento para a professora.
- É preciso conciliar rapidez, rigor pedagógico e simplicidade para crianças de seis anos.
- O contexto é o 1.º ciclo do ensino básico, com o Método das 28 Palavras e crianças com dificuldades.

**Visual:** triângulo de três tensões — «Rapidez», «Rigor», «Simplicidade» — com um ponto de interrogação no centro; um destaque lateral com o exemplo «me · ni · na» versus «meni · na».

**Notas do orador (90 a 110 palavras):** explicar por que razão o erro é caro nesta fase; dar o exemplo da segmentação silábica; referir a carga de trabalho da professora; terminar na tensão que o projeto teve de resolver.

### Slide 3 — O princípio

**Título:** A IA propõe. A professora decide. A criança aprende.
**Mensagem-chave:** Geração prévia com revisão humana obrigatória — o princípio que organiza todo o sistema.

**Conteúdo de apoio (4 bullets):**
- A professora pede; a IA compõe uma proposta a partir de um léxico validado.
- Seis verificações automáticas e a decisão final da professora funcionam como barreira.
- Só os recursos aprovados chegam à criança; a barreira é aplicada no modelo de dados.
- Não há backend nem chamadas a APIs em tempo de execução; os dados ficam no navegador.

**Visual:** fluxo horizontal em quatro passos — «Professora pede» → «IA compõe + 6 verificações» → «Aprovação humana» → «Criança aprende» — com um cadeado no ponto de aprovação. Destacar a frase «a IA propõe, a professora decide, a criança aprende».

**Notas do orador (90 a 110 palavras):** este é o slide que a audiência deve reter; explicar que a IA não fala diretamente com a criança; sublinhar que a barreira não é uma convenção de interface, está no estado do recurso; antecipar a arquitetura do slide 5.

### Slide 4 — O método

**Título:** Uma sequência testada, fase a fase
**Mensagem-chave:** O método define o léxico, as fases e o tipo de ajuda — e a aplicação respeita-o em todas as camadas.

**Conteúdo de apoio (4 bullets):**
- 28 palavras nucleares + 6 derivadas; cada uma com sílabas, ilustração SVG, áudio em pt-PT e frase de referência.
- Exemplo: «menina» → `me · ni · na` → «A menina lê o livro.»
- Seis fases: palavra inteira → sem apoio → sílabas → novas palavras → frases → escrita.
- O catálogo é finito e validado; as variantes do método não se misturam.

**Visual:** tira horizontal com as primeiras palavras da sequência; escada de seis degraus com os nomes das fases; um cartão de palavra com imagem, sílabas e botão de áudio.

**Notas do orador (100 a 120 palavras):** explicar a progressão do método; usar «menina» como exemplo concreto; justificar por que razão o catálogo é finito; referir que a escrita manual em papel continua prevista na fase 6.

### Slide 5 — Arquitetura

**Título:** Offline-first: simples por fora, rigoroso por dentro
**Mensagem-chave:** Uma aplicação estática, sem backend, que mantém privacidade, robustez e desempenho.

**Conteúdo de apoio (5 bullets):**
- Aplicação pré-renderizada; sem servidor, contas ou base de dados remota.
- Stack: Deno 2.9+, SvelteKit 3.1.1, Svelte 5.57.3, TypeScript 6.0.3 strict, Vite 8.3.6, adapter-static 4.0.1.
- Dados em `localStorage` (`palavra-viva:dados:v1`); tema claro/escuro persistente.
- 56 ficheiros de código e configuração; 14 772 linhas.
- Separação de responsabilidades: o gerador compõe, a validação verifica, a store persiste e os componentes apresentam.

**Visual:** diagrama em camadas — «UI Svelte» → «Stores» → «Léxico / Gerador / Validação» → «Assets estáticos (SVG, MP3, WOFF2)» — com setas a indicar a direção das dependências e uma etiqueta «sem servidor».

**Notas do orador (100 a 120 palavras):** explicar as consequências do offline-first: privacidade, robustez e desempenho; reconhecer a limitação do catálogo finito; referir a CI e o build estático; não entrar em detalhes de código.

### Slide 6 — Do pedido à criança

**Título:** Um ponto de controlo entre dois percursos
**Mensagem-chave:** O estado do recurso é a barreira de segurança entre a professora e a criança.

**Conteúdo de apoio (5 bullets):**
- Percurso da professora: painel → estúdio → biblioteca → sessões.
- Percurso da criança: escolha de perfil → sessão com oito atividades → ecrã final e registo.
- `Recurso` tem estado `rascunho` ou `aprovado`; `recursosDaCrianca(id, true)` filtra a barreira.
- A aprovação exige 6/6 verificações; qualquer edição revalida imediatamente.
- A seed determinística — palavra, criança, fase, tipo e número de opções, sem timestamp — torna a proposta reproduzível.

**Visual:** duas faixas paralelas, «Professora» e «Criança», a convergir num portão central com «6/6 → Aprovar»; mostrar a transição `rascunho → aprovado`; incluir o pequeno excerto `recursosDaCrianca(id, true)`.

**Notas do orador (100 a 120 palavras):** percorrer o fluxo em voz alta; explicar que um recurso em rascunho nunca entra na fila da sessão; dar o exemplo da edição de uma palavra que revalida tudo; explicar a seed determinística como apoio à revisão e aos testes.

### Slide 7 — IA e validação

**Título:** Seis verificações antes de qualquer aprovação
**Mensagem-chave:** A qualidade não depende da confiança no modelo: depende de regras verificáveis.

**Conteúdo de apoio (5 bullets):**
- Prompt em quatro blocos: criança, pedido, onze regras e verificação pedida.
- Gerador determinístico com FNV-1a e mulberry32; o mesmo pedido produz sempre a mesma proposta.
- Similaridade fonética escolhe distratores próximos, em vez de opções aleatórias.
- Verificações: ortografia, divisão silábica, palavra–imagem, pronúncia, opções e frase.
- A aprovação fica bloqueada enquanto uma verificação falhar.

**Visual:** lista de verificação de seis linhas com marcas verdes e a etiqueta «6/6»; botão «Aprovar» bloqueado até ao último visto; exemplo pequeno de ditado de «sapato» com parónimos «pato», «rato» e «gato».

**Notas do orador (100 a 120 palavras):** explicar o que cada verificação impede; usar o ditado como exemplo de distratores fonéticos; referir a rima de «gato» com «rato»; sublinhar que a validação é recalculada em todos os pontos de mutação.

### Slide 8 — Área da professora

**Título:** A professora mantém o controlo pedagógico
**Mensagem-chave:** O sistema acelera a preparação, mas não retira a decisão à professora.

**Conteúdo de apoio (5 bullets):**
- Painel: fase, palavras trabalhadas, autonomia e fila de revisão.
- Estúdio: criança, palavra, fase, tipo, opções e apoios → proposta editável com pré-visualização.
- Biblioteca: pesquisa, filtros, aprovar/devolver, imprimir, eliminar e exportar CSV.
- Sessões: tentativas, ajudas, áudio, dica, tempo e autonomia; registo de fichas de escrita manual.
- A edição de campos atualiza o recurso e recalcula as verificações de imediato.

**Visual:** captura `biblioteca.webp` em grande, com dois destaques: «pré-visualização» e «aprovar/devolver»; à direita, uma coluna estreita com os ícones do painel, estúdio e sessões.

**Notas do orador (100 a 120 palavras):** mostrar o circuito de trabalho da professora; explicar que a pré-visualização mostra exatamente o que a criança verá; referir a exportação CSV e os registos; reforçar que a decisão final é sempre humana.

### Slide 9 — Área da criança

**Título:** Oito formas de aprender, sempre com feedback
**Mensagem-chave:** Variedade sem perda de rigor: cada formato treina um passo diferente da leitura.

**Conteúdo de apoio (5 bullets):**
- Cartão, reconhecimento, associação, sílabas, frase, rima, ditado e ordem.
- Áudio repetível; opções grandes; o erro dá uma pista concreta e permite nova tentativa.
- Distratores escolhidos por similaridade fonética; no ditado, a imagem fica escondida.
- Registo de autonomia — «sem ajuda», «com apoio» ou «resposta mostrada» — nunca convertido em nota.
- Oficina de sílabas na página inicial: peças que se arrastam, se ouvem e se recompõem.

**Visual:** oito etiquetas com os nomes dos formatos, cada uma com um ícone simples; à direita, a captura `sessao-mobile.webp`; destacar a Oficina de sílabas como elemento memorável.

**Notas do orador (100 a 120 palavras):** colocar a audiência no lugar da criança; explicar a diferença entre reconhecimento e associação; referir a pista concreta no erro; sublinhar que a autonomia é informação pedagógica e não avaliação.

### Slide 10 — Identidade e acessibilidade

**Título:** Uma oficina de papel, acessível a todos
**Mensagem-chave:** A identidade visual e a acessibilidade foram requisitos de projeto, não um acabamento.

**Conteúdo de apoio (5 bullets):**
- Metáfora de uma oficina de papel: fichas, carimbos e sílabas móveis; linguagem próxima, sem infantilizar.
- Paleta: papel `#f4efe3`, tinta `#1b2a4a`, cobalto `#2457e6`, coral `#f05a47`, sol `#f6c445`, verde `#3e7c6a`.
- Tipografia: Bricolage Grotesque nos títulos e Atkinson Hyperlegible no texto, auto-alojadas em WOFF2.
- WCAG 2.1 AA: zero violações em 9 rotas × 2 temas; teclado, foco visível, contraste e `prefers-reduced-motion`.
- Alvos grandes (mínimo 74 px nas opções escritas), HTML semântico, `aria-live` e texto alternativo descritivo.

**Visual:** amostras da paleta em quadrados; espécime tipográfico com o título e um parágrafo; duas miniaturas das capturas `home-claro.webp` e `home-escuro.webp`; selo «WCAG 2.1 AA · 0 violações».

**Notas do orador (100 a 120 palavras):** explicar a metáfora e por que razão funciona para crianças e professoras; justificar a escolha tipográfica; dar exemplos de decisões de acessibilidade; referir que o tema escuro mantém as fichas claras para preservar contraste.

### Slide 11 — Resultados

**Título:** Verificação independente, resultados reprodutíveis
**Mensagem-chave:** Os resultados não são declarações: são artefactos versionados e repetíveis.

**Conteúdo de apoio (5 bullets):**
- 10 testes funcionais Playwright: tema, sessão, resposta certa e errada, ajuda, aprovação, CSV e 404.
- axe-core: 18 combinações (9 rotas × 2 temas), zero violações de acessibilidade.
- Lighthouse: 64 pontuações; 63 a 100; mínimo 94 na sessão mobile, com LCP de 3,0 s em Slow 4G simulado.
- `deno task check`: 0 erros, 0 avisos; `deno task build` concluído; CI a correr no GitHub Actions.
- 12 recursos de demonstração, cobrindo os oito formatos e as seis verificações.

**Visual:** número grande «63/64»; gráfico de barras com 100 e 94; tabela compacta «10 testes · 18 combinações axe · 0 violações · 0 erros/0 avisos»; rodapé com o link dos resultados em `docs/verificacao/`.

**Notas do orador (100 a 120 palavras):** apresentar os testes como evidência, não como vaidade; ser transparente sobre a única pontuação 94 e explicar o LCP simulado; referir que a página de erro é excluída do Lighthouse por ser `noindex`; terminar na reprodutibilidade.

### Slide 12 — Privacidade e ética

**Título:** Nenhum dado da criança sai do navegador
**Mensagem-chave:** Privacidade por arquitetura e ética pedagógica desde o primeiro dia.

**Conteúdo de apoio (5 bullets):**
- Sem contas, cookies, analítica ou chamadas externas em tempo de execução.
- Dados em `localStorage`; o botão «Repor demonstração» restaura o estado inicial.
- Contexto com menores: uma versão real exigiria consentimento, retenção e proteção de dados.
- A autonomia é informação pedagógica, não uma nota; evita a rotulagem precoce.
- A revisão humana das propostas geradas é obrigatória, não opcional.

**Visual:** janela de navegador com um cadeado e a etiqueta «apenas local»; três princípios em coluna — «sem contas», «sem rastreio», «sem chamadas externas»; citação curta da secção 10.

**Notas do orador (90 a 110 palavras):** explicar que a privacidade resulta da arquitetura, não de uma promessa; referir a chave de armazenamento e o botão de reposição; abordar o contexto de menores com maturidade; sublinhar a distinção entre autonomia e nota.

### Slide 13 — Limitações e trabalho futuro

**Título:** O que fica por fazer — e porquê
**Mensagem-chave:** Conhecer os limites é parte do rigor; o trabalho futuro está priorizado.

**Conteúdo de apoio (5 bullets):**
- Catálogo finito de 34 palavras e geração prévia; não há API em tempo real.
- Sem reconhecimento de leitura oral; a oralidade continua a ser observada pela professora.
- Dados apenas locais; não há sincronização entre dispositivos.
- Voz sintetizada consistente em pt-PT, mas sem a entoação e o afeto humanos.
- Próximos passos: CI com testes e auditorias, PWA offline, expansão lexical, importação/exportação e histórico de versões.

**Visual:** duas colunas — «Hoje» e «Próximo» — com uma seta de percurso; usar ícones simples; não transformar a lista numa parede de texto.

**Notas do orador (90 a 110 palavras):** assumir os limites sem defensividade; explicar por que razão a expansão lexical exige novos assets validados; priorizar os próximos passos; ligar ao slide 14.

### Slide 14 — Conclusão

**Título:** Tecnologia que apoia, não substitui
**Mensagem-chave:** O Palavra Viva cumpre o enunciado e demonstra um modelo de IA responsável na educação.

**Conteúdo de apoio (5 bullets):**
- Requisitos cumpridos: geração assistida, revisão humana, oito formatos, validação e registo.
- Três diferenciais: qualidade técnica, coerência metodológica e expansão pedagógica.
- 63 das 64 pontuações Lighthouse a 100; zero violações de acessibilidade nas auditorias axe-core.
- Princípio final: a IA propõe, a professora decide, a criança aprende.
- Demonstração e repositório; obrigado e perguntas.

**Visual:** frase final em tipografia grande sobre fundo de tinta; três números em destaque — «63/64», «0 violações», «8 formatos»; links e, se possível, um código QR discreto para a demonstração.

**Notas do orador (70 a 90 palavras):** fechar o ciclo com o problema do slide 2; repetir o princípio; convidar a audiência a experimentar a demonstração; agradecer e abrir as perguntas. Sugestão de fecho: «O Palavra Viva não substitui a professora. Dá-lhe tempo, variedade e tranquilidade para fazer o que só ela sabe fazer: ensinar a ler.»

## 6. Factos verificáveis (controlo rápido)

| Indicador | Valor |
|---|---|
| Ficheiros de código e configuração | 56 |
| Linhas de código | 14 772 |
| Palavras do catálogo | 34 (28 nucleares + 6 derivadas) |
| Ilustrações SVG originais | 34 |
| Ficheiros de áudio | 160 (palavras, frases, sílabas e instruções em pt-PT) |
| Formatos de atividade | 8 (cartão, reconhecimento, associação, sílabas, frase, rima, ditado, ordem) |
| Verificações automáticas | 6 (ortografia, sílabas, imagem, pronúncia, opções, frase) |
| Fases de aprendizagem | 6 |
| Crianças na demonstração | 4 (Alice, Benjamim, Clara e Duarte) |
| Recursos na demonstração | 12 |
| Testes funcionais | 10 casos Playwright |
| Combinações axe-core | 18 (9 rotas × 2 temas); zero violações |
| Pontuações Lighthouse | 64 (8 rotas × 4 categorias × 2 perfis); 63 a 100; mínimo 94 |
| Verificação estática | `deno task check`: 0 erros, 0 avisos; `build` concluído |
| Stack | Deno 2.9+, SvelteKit 3.1.1, Svelte 5.57.3, TypeScript 6.0.3, Vite 8.3.6, adapter-static 4.0.1 |
| Demonstração | https://kill74.github.io/palavra-viva/ |
| Repositório | github.com/kill74/palavra-viva |
| Versão do projeto | 1.0.0 |

**Cuidados de precisão — não distorças estes pontos:**

- **Escreve «63 das 64 pontuações a 100»**, nunca «64/64 a 100». A exceção é o desempenho mobile da sessão, com 94 e LCP de 3,0 s.
- Diz **«zero violações nas auditorias axe-core»**, não «certificação WCAG» nem «conformidade total garantida».
- Diz **«geração prévia»** e **«sem chamadas a APIs em tempo de execução»**; não digas «IA em tempo real» nem «modelo a correr no browser».
- Diz **«protótipo funcional»**, não «produto em produção».
- Os dados das crianças são **fictícios**; não os apresentes como reais.
- A autonomia **não é uma nota**; mantém essa distinção em todos os slides.

## 7. Identidade visual e composição

### 7.1 Sistema visual

- **Formato:** 16:9, 13,333 × 7,5 polegadas.
- **Fundo:** papel `#f4efe3` na maioria dos slides; tinta `#1b2a4a` na capa e no slide final.
- **Contraste:** sobre fundo de tinta, usa papel `#f4efe3` para todo o texto e mantém os destaques; nunca tinta sobre tinta.
- **Cores de destaque:** cobalto `#2457e6`, coral `#f05a47`, sol `#f6c445`, verde `#3e7c6a`. Usa no máximo duas cores de destaque por slide.
- **Títulos:** Bricolage Grotesque, 30 a 36 pt, peso 700, tinta `#1b2a4a`; na capa e no slide final, papel `#f4efe3`. Se a fonte não estiver disponível, usa Arial Bold.
- **Corpo:** Atkinson Hyperlegible, 20 a 24 pt; se não estiver disponível, usa Arial. Nunca abaixo de 18 pt no corpo e 12 pt nas legendas.
- **Rodapé:** «Palavra Viva · DSI · TP1 · Guilherme Sales» à esquerda e número do slide à direita, 9 a 10 pt, com contraste mínimo de 4,5:1.
- **Margens:** pelo menos 0,6 polegadas; alinha tudo a uma grelha de 12 colunas.
- **Ícones:** traço simples e coerente, 2 a 3 px; não uses emojis, clipart, sombras pesadas, gradientes ou gráficos 3D.
- **Fotografias:** não uses imagens de banco de imagens. Usa apenas capturas do projeto ou formas vetoriais.

### 7.2 Regras de composição

- No máximo **6 bullets** por slide; cada bullet com **até 2 linhas** e cerca de **12 palavras**.
- Um título curto — idealmente até 8 palavras — e, no máximo, duas linhas.
- Uma ideia principal por slide; o resto é apoio visual.
- Deixa espaço negativo; não ocupes mais de 60% da área com texto.
- Usa diagramas para fluxos, camadas, verificações e resultados.
- Numera os passos dos diagramas; etiqueta as setas; evita caixas aninhadas.

### 7.3 Capturas de ecrã

Usa, por esta ordem de prioridade:

1. `docs/screenshots/biblioteca.webp` — slide 8.
2. `docs/screenshots/sessao-mobile.webp` — slide 9.
3. `docs/screenshots/home-claro.webp` e `home-escuro.webp` — slide 10.

Instruções:

- Converte WebP para PNG antes de inserir, se a ferramenta não aceitar WebP.
- Recorta as bordas desnecessárias; mantém a interface legível.
- Adiciona uma legenda de uma linha e texto alternativo descritivo.
- Se as capturas não estiverem disponíveis, cria um retângulo com a legenda «Inserir captura: …» e uma descrição do que deve mostrar. **Não uses imagens genéricas da internet.**

### 7.4 Gráficos

- Usa um gráfico de barras nativo para Lighthouse: eixo de 0 a 100, barras a 100 e uma barra a 94, etiquetas de valor visíveis.
- Usa uma tabela compacta para os testes e auditorias.
- Não uses gráficos circulares nem eixos truncados.
- Escreve sempre as unidades e a fonte dos dados na legenda.

## 8. Língua portuguesa (pt-PT)

Escreve **sempre em português europeu**. Não traduzas automaticamente de inglês nem mistures variedades.

| Evita (pt-BR ou anglicismo) | Usa (pt-PT) |
|---|---|
| usuário | utilizador |
| tela | ecrã |
| arquivo | ficheiro |
| time | equipa |
| gerenciar | gerir |
| acessar | aceder |
| salvar | guardar |
| deletar | eliminar |
| aplicativo | aplicação |
| celular | telemóvel |
| banco de dados | base de dados |
| «está fazendo» | «está a fazer» |
| «você» | «a professora», «a criança» ou forma impessoal |

Regras adicionais:

- Usa **aspas angulares** «…» para citações e nomes de atividades; reserva as aspas retas para código.
- Usa **vírgula decimal** (`0,097`, `3,0 s`) e **espaço** nos milhares (`14 772`).
- Escreve `100%` de forma consistente; não alternes com `100 %`.
- Datas por extenso: `16 de novembro de 2026`.
- Na primeira ocorrência, escreve a sigla por extenso e entre parênteses: «Web Content Accessibility Guidelines (WCAG) 2.1 AA», «Largest Contentful Paint (LCP)», «Cumulative Layout Shift (CLS)», «Total Blocking Time (TBT)». Depois, usa só a sigla.
- Mantém os nomes próprios e técnicos: Palavra Viva, Método das 28 Palavras, Deno, SvelteKit, Svelte, TypeScript, Vite, Lighthouse, Playwright, axe-core, `localStorage`.
- Prefere frases curtas e voz ativa. Evita «de forma a», «no sentido de», «aquando da» e outro jargão académico desnecessário.
- Nos títulos e bullets, não ponhas ponto final; usa ponto final apenas em frases completas.
- Não uses emojis, exclamações ou linguagem publicitária («revolucionário», «incrível», «game changer»).
- Trata a professora e a criança com respeito: «a criança», «a professora», nunca «o utilizador infantil» ou «o testador».

## 9. Notas do orador

- Escreve **90 a 120 palavras por slide** (60 a 90 na capa e no fecho); cerca de 1 400 palavras no total, para 10 a 12 minutos.
- Começa cada nota com a duração prevista, por exemplo `[~45 s]`.
- Escreve em registo falado, na primeira pessoa do singular para o trabalho («desenvolvi», «optei») e na primeira pessoa do plural para guiar a audiência («podemos ver», «reparem»).
- Não leias o slide: acrescenta o contexto, o «porquê» e um exemplo.
- Termina cada nota com uma frase de transição para o slide seguinte.
- Inclui a frase de abertura e a de fecho sugeridas nos slides 1 e 14, ou variações igualmente claras.

## 10. Entrega técnica

### 10.1 Entrega principal

Produz um ficheiro **`.pptx` real, editável**, com:

- 14 slides em 16:9;
- notas do orador em todos os slides;
- títulos, texto, formas e gráficos nativos (não uma imagem achatada de cada slide);
- metadados do documento: título, autor, assunto e palavras-chave;
- nome exato `Palavra_Viva_Apresentacao_TP1.pptx`.

### 10.2 Se usares python-pptx

Se tiveres execução de código, gera o ficheiro com `python-pptx`. Requisitos mínimos:

```python
from pptx import Presentation
from pptx.util import Inches

prs = Presentation()
prs.slide_width = Inches(13.333)
prs.slide_height = Inches(7.5)
```

- Usa o layout em branco (`prs.slide_layouts[6]`) e cria as caixas de texto com `add_textbox`.
- Define `word_wrap = True` e `auto_size = MSO_AUTO_SIZE.NONE`; controla tu as quebras de linha.
- Usa parágrafos com `level = 0` para bullets; não escrevas «•» à mão.
- Notas: `slide.notes_slide.notes_text_frame.text = "..."`.
- Imagens: `slide.shapes.add_picture(...)`; define o texto alternativo em `pic._element.nvPicPr.cNvPr.set("descr", "...")`.
- Converte WebP para PNG com Pillow, se necessário.
- No fim, reabre o `.pptx` e valida: 14 slides, notas não vazias em todos, nenhuma forma fora dos limites do slide.
- Se tiveres LibreOffice, converte para PDF e verifica visualmente o transbordo; entrega o `.pptx`, não o PDF.

### 10.3 Se não conseguires gerar o `.pptx`

Entrega, em vez do ficheiro:

1. o guião completo dos 14 slides em Markdown, com todo o texto visível e as notas do orador;
2. um script `gerar_apresentacao.py` completo e executável, com `python-pptx`, que produza exatamente a mesma apresentação;
3. as instruções de execução: `pip install python-pptx` e `python gerar_apresentacao.py`.

Não entregues apenas um guião em texto se conseguires gerar o ficheiro.

### 10.4 Relatório final da entrega

No fim da resposta, indica:

- os ficheiros criados;
- o número de slides e de notas preenchidas;
- as fontes e capturas efetivamente usadas;
- as assunções tomadas;
- qualquer divergência entre este prompt e o relatório.

## 11. Lista de verificação antes de entregar

- [ ] 14 slides, 16:9, com capa e conclusão.
- [ ] Todos os títulos afirmam uma ideia e são curtos (idealmente até 8 palavras).
- [ ] Nenhum slide tem mais de 6 bullets nem mais de 12 palavras por bullet.
- [ ] Todos os números coincidem com a secção 6; em especial, «63/64 a 100», não «64/64».
- [ ] Zero termos brasileiros da tabela da secção 8.
- [ ] Notas do orador em todos os slides, com 60 a 120 palavras conforme o slide, e transições.
- [ ] Paleta, tipografia, rodapé e numeração coerentes em todos os slides.
- [ ] Capturas com legenda e texto alternativo, ou marcadores claramente identificados.
- [ ] Nenhum texto cortado ou fora do slide; corpo com pelo menos 18 pt.
- [ ] Contraste mínimo de 4,5:1 no texto e 3:1 nos elementos gráficos.
- [ ] A conclusão retoma o problema do slide 2 e o princípio do slide 3.
- [ ] Nome do ficheiro e metadados corretos.
- [ ] Nenhum dado inventado; assunções listadas no fim.

## 12. Mapa relatório → slides

| Secção do relatório | Slide(s) |
|---|---|
| Capa, resumo executivo, secção 1 | 1 a 3 |
| Secção 2 — Metodologia e referencial teórico | 4 |
| Secção 3 — Arquitetura geral | 5 |
| Secções 3.1 e 4 — Percursos, modelo de dados e persistência | 6 |
| Secção 5 — Geração com IA e validação | 7 |
| Secção 6 — Área da professora | 8 |
| Secção 7 — Área da criança | 9 |
| Secção 8 — Identidade visual, interação e acessibilidade | 10 |
| Secção 9 — Verificação e resultados | 11 |
| Secção 10 — Segurança, privacidade e ética | 12 |
| Secção 11 — Limitações e trabalho futuro | 13 |
| Secção 12 — Conclusão | 14 |
| Secção 13 e anexos | Notas e respostas a perguntas |

## 13. Sugestões de abertura e fecho

**Abertura (slide 1):**
> «Uma criança que aprende a ler não pode depender de um modelo que inventa. Foi por isso que construí o Palavra Viva: a IA propõe, a professora decide e a criança aprende.»

**Fecho (slide 14):**
> «O Palavra Viva não substitui a professora. Dá-lhe tempo, variedade e tranquilidade para fazer o que só ela sabe fazer: ensinar a ler.»

**Pitch de uma frase, para usar em respostas:**
> «O Palavra Viva é uma aplicação estática que prepara e valida recursos de leitura pelo Método das 28 Palavras, com revisão humana obrigatória e sem dados a sair do navegador.»
