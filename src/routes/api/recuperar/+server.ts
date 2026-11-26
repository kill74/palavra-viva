import { error } from '@sveltejs/kit';
import { eModoServidor } from '#lib/ambiente-servidor';
import { pedirRecuperacao, redefinirPassword } from '../../../../db/autenticacao.ts';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request, url }) => {
  if (!eModoServidor()) error(404, 'Não encontrado');
  const tipo = url.searchParams.get('tipo') ?? 'pedir';
  const dados = await request.formData();
  const email = String(dados.get('email') ?? '');

  if (tipo === 'pedir') {
    await pedirRecuperacao(email);
    // Mensagem idêntica quer a conta exista quer não.
    return Response.json({ ok: true, mensagem: 'Se a conta existir, foi criado um pedido de recuperação.' });
  }

  if (tipo === 'redefinir') {
    const token = String(dados.get('token') ?? '');
    const password = String(dados.get('password') ?? '');
    const erros = await redefinirPassword(token, password);
    if (erros.length > 0) return Response.json({ erro: erros.join(' ') }, { status: 400 });
    return Response.json({ ok: true });
  }

  error(400, 'Pedido inválido.');
};
