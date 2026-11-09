import { LIGACOES, PALAVRAS, VOCABULARIO_EXTRA, porId, porTexto } from '#lib/data/palavras';
import type { Recurso, ValidacaoItem } from '#lib/data/tipos';

function unicas(valores: string[]): boolean {
  const vistos = new Set<string>();
  for (const valor of valores) {
    const chave = valor.trim().toLocaleLowerCase('pt-PT');
    if (!chave || vistos.has(chave)) return false;
    vistos.add(chave);
  }
  return true;
}

function opcoesValidas(r: Recurso): { ok: boolean; detalhe: string } {
  if (r.tipo === 'cartao') {
    return { ok: true, detalhe: 'Este formato não usa opções.' };
  }

  const total = r.opcoes.length;
  if (total < 2 || total > 4) {
    return { ok: false, detalhe: 'Usa entre 2 e 4 opções.' };
  }
  if (!unicas(r.opcoes)) {
    return { ok: false, detalhe: 'Há opções repetidas ou vazias.' };
  }

  if (r.tipo === 'silabas') {
    const partes = new Set(r.silabas.map((s) => s.toLocaleLowerCase('pt-PT')));
    const repetida = r.opcoes.some((o) => partes.has(o.toLocaleLowerCase('pt-PT')));
    return repetida
      ? { ok: false, detalhe: 'As sílabas extra repetem uma sílaba da palavra.' }
      : { ok: true, detalhe: `${total} sílabas extra, todas diferentes.` };
  }

  if (r.tipo === 'reconhecimento') {
    const inclui = r.opcoes.some(
      (o) => o.toLocaleLowerCase('pt-PT') === r.palavra.toLocaleLowerCase('pt-PT')
    );
    return inclui
      ? { ok: true, detalhe: `${total} opções; a palavra certa está incluída.` }
      : { ok: false, detalhe: 'A palavra certa não está entre as opções.' };
  }

  const todasConhecidas = r.opcoes.every((id) => porId.has(id));
  const inclui = r.opcoes.includes(r.palavraId);
  if (!todasConhecidas) return { ok: false, detalhe: 'Há uma imagem sem palavra associada.' };
  if (!inclui) return { ok: false, detalhe: 'A imagem da palavra certa não está incluída.' };
  return { ok: true, detalhe: `${total} imagens; a certa está incluída.` };
}

function fraseValida(r: Recurso): { ok: boolean; detalhe: string } {
  if (r.tipo !== 'frase') {
    return { ok: true, detalhe: 'Só se aplica a atividades de frase.' };
  }

  const frase = r.frase.trim();
  const palavras = frase.split(/\s+/).filter(Boolean);
  const contem = frase
    .toLocaleLowerCase('pt-PT')
    .includes(r.palavra.toLocaleLowerCase('pt-PT'));
  const pontua = /[.!?]$/.test(frase);
  const tamanho = palavras.length >= 3 && palavras.length <= 10;
  const referencia = porTexto(r.palavra);
  const audioCorresponde = !referencia || frase === referencia.frase.trim();
  const ligacoesConhecidas = palavras.every((palavra) => {
    const limpa = palavra.replace(/[.,!?;:]/g, '').toLocaleLowerCase('pt-PT');
    return (
      LIGACOES.includes(limpa) ||
      VOCABULARIO_EXTRA.includes(limpa) ||
      PALAVRAS.some((p) => p.palavra.toLocaleLowerCase('pt-PT') === limpa)
    );
  });

  if (!contem) return { ok: false, detalhe: 'A frase não inclui a palavra trabalhada.' };
  if (!pontua) return { ok: false, detalhe: 'Falta a pontuação final.' };
  if (!tamanho) return { ok: false, detalhe: 'A frase deve ter entre 3 e 10 palavras.' };
  if (!audioCorresponde && (r.apoios.audio || r.tipo === 'frase')) {
    return {
      ok: false,
      detalhe: 'A gravação disponível é da frase de referência. Repõe essa frase ou prepara um novo áudio.'
    };
  }
  if (!ligacoesConhecidas) {
    return { ok: false, detalhe: 'Há uma palavra ainda não validada na frase.' };
  }
  return { ok: true, detalhe: 'Frase curta, com a palavra e ligações conhecidas.' };
}

export function validarRecurso(r: Recurso): ValidacaoItem[] {
  const palavra = porTexto(r.palavra);
  const som = r.silabas.join('').toLocaleLowerCase('pt-PT');
  const alvo = r.palavra.trim().toLocaleLowerCase('pt-PT');
  const silabica = r.silabas.length > 0 && r.silabas.every(Boolean) && som === alvo;
  const opcoes = opcoesValidas(r);
  const frase = fraseValida(r);

  return [
    {
      id: 'ortografia',
      ok: Boolean(palavra) && palavra?.palavra.toLocaleLowerCase('pt-PT') === alvo,
      detalhe: palavra
        ? `«${palavra.palavra}» consta do léxico do método.`
        : 'Esta forma não consta do léxico validado.'
    },
    {
      id: 'silabica',
      ok: silabica,
      detalhe: silabica
        ? `${r.silabas.join(' · ')} = ${r.palavra}.`
        : 'As sílabas juntas não formam a palavra.'
    },
    {
      id: 'imagem',
      ok: Boolean(palavra) && palavra?.id === r.palavraId,
      detalhe:
        palavra && palavra.id === r.palavraId
          ? 'A ilustração e a palavra estão ligadas pelo mesmo registo.'
          : 'A ilustração não corresponde à palavra escolhida.'
    },
    {
      id: 'pronuncia',
      ok: Boolean(palavra?.audio.endsWith('.mp3')),
      detalhe: palavra
        ? 'Áudio sintetizado em português europeu, revisto antes da aprovação.'
        : 'Sem áudio validado para esta forma.'
    },
    {
      id: 'opcoes',
      ok: opcoes.ok,
      detalhe: opcoes.detalhe
    },
    {
      id: 'frase',
      ok: frase.ok,
      detalhe: frase.detalhe
    }
  ];
}

export function recursoValido(r: Recurso): boolean {
  return r.validacao.length === 6 && r.validacao.every((item) => item.ok);
}

export function comValidacao(r: Recurso): Recurso {
  return { ...r, validacao: validarRecurso(r) };
}
