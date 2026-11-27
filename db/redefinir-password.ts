/**
 * Redefine a palavra-passe de uma conta e encerra as suas sessões.
 *
 * Uso: PALAVRA_VIVA_DB=/caminho/bd.sqlite deno task conta:senha <email> <palavra-passe>
 *
 * Serve para administrar o servidor da escola sem deixar tokens de
 * recuperação nos logs. A palavra-passe é passada por argumento, por isso
 * deve ser usada num terminal local, não num histórico partilhado.
 */
import { base, transacao } from './cliente.ts';
import { validarPassword } from './autenticacao.ts';
import { hashPassword } from './seguranca.ts';

const [emailBruto, password] = Deno.args;
if (!emailBruto || !password) {
  console.error('Uso: deno task conta:senha <email> <palavra-passe>');
  Deno.exit(1);
}

const erros = validarPassword(password);
if (erros.length > 0) {
  console.error(erros.join(' '));
  Deno.exit(1);
}

const email = emailBruto.trim().toLocaleLowerCase('pt-PT');
const db = base();
const linha = db.prepare('SELECT id FROM utilizadores WHERE email = ?')
  .get(email) as { id: string } | undefined;
if (!linha) {
  console.error('Não existe uma conta com esse email.');
  Deno.exit(1);
}

const hash = await hashPassword(password);
transacao(() => {
  db.prepare('UPDATE utilizadores SET password_hash = ? WHERE id = ?').run(hash, linha.id);
  db.prepare('DELETE FROM sessoes_login WHERE utilizador_id = ?').run(linha.id);
});

console.log(`Palavra-passe atualizada para ${email}. Sessões anteriores foram encerradas.`);
