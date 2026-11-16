import type { Apoios, Crianca, Fase, TipoAtividade } from './tipos';
import { NOMES_FASE, NOMES_TIPO } from './tipos';
import { porId } from './palavras';

export const MODELO_IA =
  'Recursos preparados com apoio de IA generativa; composição e validação locais, sem chamadas a APIs em tempo de execução.';

type Pedido = {
  palavra: string;
  silabas: string[];
  frase: string;
  fase: Fase;
  tipo: TipoAtividade;
  numeroOpcoes: number;
  apoios: Apoios;
  crianca: Crianca;
};

export function construirPrompt(pedido: Pedido): string {
  const apoios = [
    pedido.apoios.imagem ? 'imagem' : '',
    pedido.apoios.audio ? 'áudio' : '',
    pedido.apoios.silabas ? 'sílabas visíveis' : ''
  ].filter(Boolean);

  return `Assume o papel de assistente pedagógico de iniciação à leitura pelo método das 28 palavras.

CRIANÇA
${pedido.crianca.nome}, ${pedido.crianca.idade} anos, fase ${pedido.fase} (${NOMES_FASE[pedido.fase]}).
Palavras já trabalhadas: ${
    pedido.crianca.palavrasTrabalhadas.map((id) => porId.get(id)?.palavra ?? id).join(', ') || 'nenhuma'
  }.

PEDIDO
Cria um recurso do tipo «${NOMES_TIPO[pedido.tipo]}» para a palavra «${pedido.palavra}».
Sílabas de referência: ${pedido.silabas.join(' · ')}.
Frase de referência: «${pedido.frase}».
Número de opções: ${pedido.numeroOpcoes}.
Apoios pedidos: ${apoios.length ? apoios.join(', ') : 'nenhum'}.

REGRAS
1. Escreve em português europeu, com vocabulário do 1.º ciclo.
2. Mantém a palavra e a divisão silábica exatamente como foram fornecidas.
3. Na tarefa de reconhecimento, as opções devem ser palavras próximas na forma (mesma sílaba, extensão ou terminação), nunca aleatórias.
4. O áudio não pode revelar automaticamente a solução numa tarefa de reconhecimento.
5. A frase deve ter entre 3 e 10 palavras, incluir a palavra-alvo e usar ligações já conhecidas.
6. Não inventes uma imagem: a ilustração é escolhida do catálogo validado.
7. No ditado, usa parónimos (palavras parecidas no som) como distratores e esconde a imagem.
8. Na rima, a resposta deve terminar como a palavra da pergunta, que não aparece nas opções.
9. Na ordenação de sílabas, esconde a palavra escrita: só a imagem e o áudio dão a pista.
10. Explica o feedback em linguagem direta, sem elogios vagos.
11. Devolve os campos palavra, sílabas, opções, resposta certa, frase, feedback certo e feedback errado.

VERIFICAÇÃO PEDIDA
Confirma ortografia, divisão silábica, correspondência palavra–imagem e pronúncia em português europeu. Assinala qualquer dúvida em vez de a esconder.`;
}

export const PROMPT_VALIDACAO = `Verifica o recurso como revisor pedagógico.

Para cada campo, responde com «confirmado» ou «corrigir» e uma justificação curta:
- ortografia da palavra em português europeu;
- divisão silábica (as partes juntas reconstroem a palavra);
- correspondência entre palavra, imagem e áudio;
- adequação das opções à fase e à palavra;
- clareza e comprimento da frase;
- pronúncia e ritmo do áudio.

Se houver mais de uma interpretação possível, não escolhas por mim: descreve a dúvida para revisão humana.`;

export const EXEMPLO_IA = {
  pedido: {
    crianca: 'Alice',
    fase: 3,
    palavra: 'galinha',
    tipo: 'Associar som e imagem',
    numeroOpcoes: 3
  },
  prompt: `Cria um recurso de associação som–imagem para «galinha», fase 3, com 3 opções.
As opções devem afastar-se o suficiente para não testar apenas a memória visual.
Não uses a palavra escrita na imagem. Mantém o áudio em português europeu.`,
  primeiraProposta: {
    palavra: 'galinha',
    silabas: 'ga · li · nha',
    opcoes: ['galinha', 'galinheiro', 'girafa'],
    frase: 'A galinha põe um ovo.'
  },
  revisao:
    '«Galinheiro» pertence à mesma família e podia confundir a criança sobre o referente. Foi substituído por «cenoura». A divisão silábica e a frase foram confirmadas.',
  decisao: 'Aprovado depois da correção, com as opções galinha, girafa e cenoura.'
};

export const TESTES = [
  {
    caso: 'Reconhecimento com 2, 3 e 4 opções',
    esperado: 'A posição da resposta muda e o áudio fica disponível só depois da tentativa.',
    resultado: 'Confirmado em rato, teclado e leitor de ecrã.'
  },
  {
    caso: 'Reconstrução de «sapato» com sílabas extra',
    esperado: 'Aceita apenas a ordem correta e permite ouvir cada sílaba.',
    resultado: 'Confirmado; duas tentativas erradas mostram a resposta e permitem continuar.'
  },
  {
    caso: 'Frase «A casa tem uma janela.»',
    esperado: 'A imagem certa é a casa; as opções não repetem a palavra escrita.',
    resultado: 'Confirmado com as imagens casa, janela, mesa e escada.'
  },
  {
    caso: 'Edição de uma proposta com palavra desconhecida',
    esperado: 'A validação falha e o botão de aprovação fica indisponível.',
    resultado: 'Confirmado; a mensagem indica que a forma não consta do léxico.'
  },
  {
    caso: 'Sessão sem recursos aprovados',
    esperado: 'A criança vê um estado vazio com uma instrução para pedir à professora.',
    resultado: 'Confirmado.'
  },
  {
    caso: 'Navegação apenas por teclado e com movimento reduzido',
    esperado: 'Foco visível, ordem lógica e ausência de animações essenciais.',
    resultado: 'Confirmado com prefers-reduced-motion ativo.'
  },
  {
    caso: 'Ditado de «gato» com parónimos',
    esperado: 'O áudio é a única pista e os distratores partilham som com a resposta.',
    resultado: 'Confirmado com rato, pato e bota; sem imagem visível.'
  },
  {
    caso: 'Rima de «gato»',
    esperado: 'A resposta é «rato» e a palavra da pergunta não aparece entre as opções.',
    resultado: 'Confirmado; a validação bloqueia opções que não rimam.'
  },
  {
    caso: 'Ordenação de sílabas de «sapato»',
    esperado: 'A criança ouve a palavra e coloca sa · pa · to sem a ver escrita.',
    resultado: 'Confirmado; sílabas extra não repetem as da resposta.'
  }
];
