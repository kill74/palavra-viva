import type { Crianca, Recurso, Sessao } from '#lib/data/tipos';

/**
 * Escolhe a próxima atividade aprovada para uma criança.
 *
 * Regras, por ordem:
 * 1. Só entram recursos aprovados e da própria criança.
 * 2. A fase da criança é prioritária; se não houver nada nela, usam-se as
 *    fases seguintes e, só em último caso, as anteriores.
 * 3. Evitam-se palavras já acertadas à primeira numa sessão anterior.
 * 4. Se tudo isso falhar, devolve o primeiro aprovado por ordem de criação.
 */
export function proximoRecurso(
  crianca: Crianca,
  recursos: Recurso[],
  sessoes: Sessao[]
): Recurso | undefined {
  const aprovados = recursos.filter(
    (r) => r.criancaId === crianca.id && r.estado === 'aprovado'
  );
  if (aprovados.length === 0) return undefined;

  const jaDominadas = new Set(
    sessoes
      .filter((s) => s.criancaId === crianca.id)
      .flatMap((s) => s.respostas)
      .filter((r) => r.acertouPrimeira)
      .map((r) => r.recursoId)
  );

  const porFase = (r: Recurso): number => {
    const distancia = r.fase - crianca.fase;
    if (distancia >= 0) return distancia;
    return 100 + Math.abs(distancia);
  };

  const ordenados = [...aprovados].sort((a, b) => {
    const fase = porFase(a) - porFase(b);
    if (fase !== 0) return fase;
    return a.criadoEm.localeCompare(b.criadoEm);
  });

  return ordenados.find((r) => !jaDominadas.has(r.id)) ?? ordenados[0];
}

/** Resume o que uma criança já fez, a partir das sessões registadas. */
export function resumoCrianca(sessoes: Sessao[], criancaId: string) {
  const daCrianca = sessoes.filter((s) => s.criancaId === criancaId);
  const respostas = daCrianca.flatMap((s) => s.respostas);
  const autonomas = respostas.filter((r) => r.acertouPrimeira).length;
  const ajudas = respostas.reduce((total, r) => total + r.ajudas, 0);
  const tentativas = respostas.reduce((total, r) => total + r.tentativas, 0);
  const fases = new Set(
    daCrianca.flatMap((s) => s.respostas).map((r) => r.tipo)
  );
  return {
    sessoes: daCrianca.length,
    respostas: respostas.length,
    autonomas,
    ajudas,
    tentativas,
    tiposDistintos: fases.size,
    ultima: [...daCrianca].sort((a, b) => b.fim.localeCompare(a.fim))[0]
  };
}

/** Conquistas simples, derivadas dos dados reais — sem pontuações nem notas. */
export function conquistas(sessoes: Sessao[], criancaId: string) {
  const resumo = resumoCrianca(sessoes, criancaId);
  return [
    {
      id: 'primeira-palavra',
      titulo: 'Primeira palavra',
      descricao: 'Concluíste uma sessão.',
      icon: 'livro' as const,
      desbloqueada: resumo.sessoes >= 1
    },
    {
      id: 'leo-sozinha',
      titulo: 'Leio sozinha',
      descricao: 'Acertaste 5 vezes à primeira.',
      icon: 'check-circulo' as const,
      desbloqueada: resumo.autonomas >= 5
    },
    {
      id: 'nao-desisti',
      titulo: 'Não desisti',
      descricao: 'Tentaste outra vez após um erro.',
      icon: 'refresh' as const,
      desbloqueada: resumo.tentativas > resumo.respostas
    },
    {
      id: 'exploradora',
      titulo: 'Exploradora',
      descricao: 'Experimentaste 3 tipos de atividade.',
      icon: 'silabas' as const,
      desbloqueada: resumo.tiposDistintos >= 3
    }
  ];
}
