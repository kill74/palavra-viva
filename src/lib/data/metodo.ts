export const VALIDACAO_PASSOS = [
  {
    titulo: 'Ortografia',
    texto: 'A forma escrita é comparada com o léxico das 28 palavras e com as formas derivadas aprovadas.',
    exemplo: '«mamã» está no léxico; «mama» como palavra isolada não substitui a forma do método.'
  },
  {
    titulo: 'Divisão silábica',
    texto: 'As sílabas juntas têm de reconstruir exatamente a palavra e cada parte tem de ser pronunciável.',
    exemplo: 'me · ni · na reconstrói menina; me · ni · no reconstrói menino.'
  },
  {
    titulo: 'Palavra e imagem',
    texto: 'A ilustração é escolhida de um catálogo fechado e fica ligada ao mesmo registo da palavra.',
    exemplo: 'A imagem da galinha não pode ser usada para a palavra girafa.'
  },
  {
    titulo: 'Pronúncia',
    texto: 'O áudio é sintetizado em português europeu, ouvido e aprovado antes de chegar à criança.',
    exemplo: 'A voz pt-PT diz «menina» com o ritmo e a nasalidade do português de Portugal.'
  }
];

export const LIMITES = [
  {
    titulo: 'A IA não avalia leitura em voz alta',
    texto:
      'O protótipo corrige respostas fechadas por regras. Não há reconhecimento automático da oralidade nem substituição da observação da professora.'
  },
  {
    titulo: 'A voz é sintetizada',
    texto:
      'A pronúncia é consistente e em pt-PT, mas não substitui a voz humana na conversa, na entoação e na correção afetiva.'
  },
  {
    titulo: 'O catálogo é finito',
    texto:
      'As ilustrações e as frases são revistas, o que reduz o risco de erros, mas limita a variedade. Uma API em tempo real exigiria validação adicional.'
  },
  {
    titulo: 'Os dados ficam neste browser',
    texto:
      'Não há contas nem servidor. A turma é fictícia e os registos servem para demonstrar o percurso, não para uso escolar real.'
  },
  {
    titulo: 'A decisão de avançar não é automática',
    texto:
      'Um acerto isolado não demonstra domínio. A aplicação mostra tentativas, ajudas e autonomia, mas a progressão continua a ser uma decisão pedagógica.'
  }
];

export const DECISOES = [
  {
    titulo: 'Uma palavra antes de uma letra',
    texto:
      'A navegação e as atividades começam sempre numa palavra com significado. As sílabas aparecem depois, como partes que se podem recombinar.'
  },
  {
    titulo: 'A professora no comando',
    texto:
      'Nenhum recurso chega à criança sem revisão. O estúdio mostra a proposta, os campos editáveis e as verificações que falharam.'
  },
  {
    titulo: 'Ajuda que conta',
    texto:
      'O áudio e a dica são ajudas registadas. A aplicação distingue uma resposta autónoma de uma resposta apoiada, sem transformar isso numa nota.'
  },
  {
    titulo: 'Som e imagem com função',
    texto:
      'O áudio reforça a palavra e a sílaba; a imagem ancora o significado. Na tarefa de reconhecimento, o som não revela a solução antes da tentativa.'
  }
];

export const REFERENCIAS = [
  {
    id: '[1]',
    texto:
      'Colégio de São José, Ensinar é Voar, Manual do 1.º ano, secção Português, pp. 30–36. [Online]. Disponível em: https://ensinarevoar.pt/wp-content/uploads/2023/07/EEV_IaN_Manual_1Ano.pdf'
  },
  {
    id: '[2]',
    texto:
      'L. A. L. Duarte, «Ensino da leitura a alunos com dificuldades de aprendizagem através do Método das 28 Palavras», dissertação de mestrado em Educação Especial, Escola Superior de Educação, Instituto Politécnico de Coimbra, 2018. [Online]. Disponível em: https://hdl.handle.net/10400.26/21900'
  }
];

export const NOTA_SEQUENCIA =
  'A sequência adotada é a do enunciado, com «mamã» e «gema». A variante com «dedo» e «ovo» é reconhecida na literatura, mas não é usada neste protótipo para não misturar duas ordens.';
