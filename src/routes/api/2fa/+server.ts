import { error } from '@sveltejs/kit';
import { eModoServidor } from '#lib/ambiente-servidor';
import {
  ativar2fa,
  desativar2fa,
  estado2fa
} from '../../../../db/autenticacao.ts';
import { gerarSecret, uriTotp } from '../../../../db/totp.ts';
import type { RequestHandler } from './$types';

function professor(locals: App.Locals): string {
  if (!eModoServidor()) error(404, 'Não encontrado');
  if (!locals.utilizador || locals.utilizador.papel !== 'professora') {
    error(403, 'Acesso reservado à professora.');
  }
  return locals.utilizador.id;
}

export const GET: RequestHandler = ({ locals }) => {
  const id = professor(locals);
  return Response.json(estado2fa(id));
};

export const POST: RequestHandler = async ({ request, locals }) => {
  const id = professor(locals);
  const dados = await request.json().catch(() => null) as {
    acao?: string;
    secret?: string;
    codigo?: string;
  } | null;
  if (!dados?.acao) error(400, 'Pedido inválido.');

  if (dados.acao === 'gerar') {
    const secret = gerarSecret();
    return Response.json({
      secret,
      uri: uriTotp(secret, locals.utilizador!.email)
    });
  }

  if (dados.acao === 'ativar') {
    if (!dados.secret || !dados.codigo) error(400, 'Faltam dados.');
    const r = await ativar2fa(id, dados.secret, dados.codigo);
    if (!r.ok) return Response.json({ erro: r.erro }, { status: 400 });
    return Response.json({ ok: true, recuperacoes: r.recuperacoes });
  }

  if (dados.acao === 'desativar') {
    desativar2fa(id);
    return Response.json({ ok: true });
  }

  error(400, 'Ação inválida.');
};
