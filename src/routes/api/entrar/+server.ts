import { redirect } from '@sveltejs/kit';
import { entrar, registarUtilizador, type Papel } from '../../../../db/autenticacao.ts';
import type { RequestHandler } from './$types';

/** Endpoint de autenticação, usado apenas na build com servidor. */
export const POST: RequestHandler = async ({ request, cookies, url }) => {
  const tipo = url.searchParams.get('tipo') ?? 'entrar';
  const dados = await request.formData();
  const email = String(dados.get('email') ?? '');
  const password = String(dados.get('password') ?? '');
  const destino = String(dados.get('destino') ?? '');

  if (tipo === 'registar') {
    const nome = String(dados.get('nome') ?? '');
    const papel = String(dados.get('papel') ?? 'professora') as Papel;
    const resultado = await registarUtilizador({ email, nome, password, papel });
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

  const permitido = resultado.utilizador.papel === 'professora'
    ? destino.startsWith('/professor')
    : destino.startsWith('/crianca');
  redirect(
    303,
    permitido ? destino : resultado.utilizador.papel === 'professora' ? '/professor/' : '/crianca/'
  );
};
