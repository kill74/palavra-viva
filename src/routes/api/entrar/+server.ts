import { redirect } from '@sveltejs/kit';
import { entrar, politicaRegisto, registarUtilizador } from '../../../../db/autenticacao.ts';
import type { RequestHandler } from './$types';

import { destinoSeguro } from '#lib/utils/destino';

/** Endpoint de autenticação, usado apenas na build com servidor. */
export const POST: RequestHandler = async ({ request, cookies, url }) => {
  const tipo = url.searchParams.get('tipo') ?? 'entrar';
  const dados = await request.formData();
  const email = String(dados.get('email') ?? '');
  const password = String(dados.get('password') ?? '');
  const destino = String(dados.get('destino') ?? '');

  if (tipo === 'registar') {
    const nome = String(dados.get('nome') ?? '');
    const papel = String(dados.get('papel') ?? 'professora');
    const codigo = String(dados.get('codigo') ?? '');

    // Nunca permitir registo público de criança: essas contas são criadas pela professora.
    if (papel !== 'professora') {
      redirect(303, '/entrar/?erro=' + encodeURIComponent('Só a professora pode criar contas de criança.'));
    }
    const politica = politicaRegisto(codigo);
    if (!politica.permitido) {
      redirect(303, '/entrar/?erro=' + encodeURIComponent(politica.erro ?? 'Registo não permitido.'));
    }
    const resultado = await registarUtilizador({ email, nome, password, papel: 'professora' });
    if (!resultado.utilizador) {
      redirect(303, `/entrar/?erro=${encodeURIComponent(resultado.erros.join(' '))}`);
    }
    redirect(303, '/entrar/?registado=1');
  }

  const resultado = await entrar(email, password);
  if (!resultado.token || !resultado.utilizador) {
    redirect(303, `/entrar/?erro=${encodeURIComponent(resultado.erro ?? 'Não foi possível entrar.')}`);
  }

  cookies.set('pv_sessao', resultado.token, {
    path: '/',
    httpOnly: true,
    sameSite: 'lax',
    secure: false,
    maxAge: 60 * 60 * 24 * 7
  });

  const seguro = destinoSeguro(destino, resultado.utilizador.papel);
  redirect(
    303,
    seguro ?? (resultado.utilizador.papel === 'professora' ? '/professor/' : '/crianca/')
  );
};
