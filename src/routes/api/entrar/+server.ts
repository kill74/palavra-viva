import { redirect } from '@sveltejs/kit';
import { entrar, politicaRegisto, registarUtilizador } from '../../../../db/autenticacao.ts';
import { definirAviso, definirSessao } from '../../../../db/cookies.ts';
import { limparSucesso, registarFalha, verificador } from '../../../../db/rate-limit.ts';
import { destinoSeguro } from '#lib/utils/destino';
import type { RequestHandler } from './$types';

/** Endpoint de autenticação, usado apenas na build com servidor. */
export const POST: RequestHandler = async ({ request, cookies, url, getClientAddress }) => {
  const tipo = url.searchParams.get('tipo') ?? 'entrar';
  const dados = await request.formData();
  const email = String(dados.get('email') ?? '');
  const password = String(dados.get('password') ?? '');
  const codigo2fa = String(dados.get('codigo2fa') ?? '').trim();
  const destino = String(dados.get('destino') ?? '');

  const chave = `${getClientAddress()}:${email.trim().toLocaleLowerCase('pt-PT')}`;
  if (!verificador(chave).permitido) {
    definirAviso(cookies, 'Demasiadas tentativas. Espera um pouco antes de tentar outra vez.');
    redirect(303, '/entrar/');
  }

  if (tipo === 'registar') {
    const nome = String(dados.get('nome') ?? '');
    const papel = String(dados.get('papel') ?? 'professora');
    const codigo = String(dados.get('codigo') ?? '');

    // Nunca permitir registo público de criança: essas contas são criadas pela professora.
    if (papel !== 'professora') {
      definirAviso(cookies, 'Só a professora pode criar contas de criança.');
      redirect(303, '/entrar/');
    }
    const politica = politicaRegisto(codigo);
    if (!politica.permitido) {
      definirAviso(cookies, politica.erro ?? 'Registo não permitido.');
      redirect(303, '/entrar/');
    }
    const resultado = await registarUtilizador({ email, nome, password, papel: 'professora' });
    if (!resultado.utilizador) {
      definirAviso(cookies, resultado.erros.join(' '));
      redirect(303, '/entrar/');
    }
    redirect(303, '/entrar/?registado=1');
  }

  const resultado = await entrar(email, password, codigo2fa || undefined);
  if (resultado.requer2fa) {
    return Response.json({ requer2fa: true }, { status: 200 });
  }
  if (!resultado.token || !resultado.utilizador) {
    registarFalha(chave);
    definirAviso(cookies, resultado.erro ?? 'Não foi possível entrar.');
    redirect(303, '/entrar/');
  }

  limparSucesso(chave);
  definirSessao(cookies, resultado.token);

  const seguro = destinoSeguro(destino, resultado.utilizador.papel);
  redirect(
    303,
    seguro ?? (resultado.utilizador.papel === 'professora' ? '/professor/' : '/crianca/')
  );
};
