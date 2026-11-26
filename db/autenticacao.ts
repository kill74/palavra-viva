import { base, transacao } from './cliente.ts';
import { hashPassword, idSeguro, verificarPassword } from './seguranca.ts';

export type Papel = 'professora' | 'crianca';
export type Utilizador = {
  id: string;
  email: string;
  nome: string;
  papel: Papel;
  criadoEm: string;
};

type LinhaUtilizador = {
  id: string;
  email: string;
  nome: string;
  papel: string;
  password_hash: string;
  criado_em: string;
};

const DURACAO_SESSAO_MS = 1000 * 60 * 60 * 24 * 7; // 7 dias

/** Valida os dados de registo. Devolve uma lista de erros em PT-PT. */
export function validarRegisto(
  email: string,
  nome: string,
  password: string,
  papel: Papel
): string[] {
  const erros: string[] = [];
  const emailLimpo = email.trim().toLocaleLowerCase('pt-PT');
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(emailLimpo)) {
    erros.push('Escreve um email válido.');
  }
  if (nome.trim().length < 2 || nome.trim().length > 80) {
    erros.push('O nome deve ter entre 2 e 80 caracteres.');
  }
  if (password.length < 10) {
    erros.push('A palavra-passe deve ter pelo menos 10 caracteres.');
  }
  if (!/[A-ZÀ-Ú]/.test(password) || !/[a-zà-ú]/.test(password) || !/\d/.test(password)) {
    erros.push('A palavra-passe deve incluir uma maiúscula, uma minúscula e um número.');
  }
  if (papel !== 'professora' && papel !== 'crianca') {
    erros.push('Escolhe um perfil válido.');
  }
  return erros;
}

/** Regista um utilizador. Só professores podem criar contas de criança. */
export async function registarUtilizador(dados: {
  email: string;
  nome: string;
  password: string;
  papel: Papel;
}): Promise<{ utilizador?: Utilizador; erros: string[] }> {
  const erros = validarRegisto(dados.email, dados.nome, dados.password, dados.papel);
  if (erros.length > 0) return { erros };

  const email = dados.email.trim().toLocaleLowerCase('pt-PT');
  const db = base();
  const existente = db.prepare('SELECT id FROM utilizadores WHERE email = ?').get(email);
  if (existente) return { erros: ['Já existe uma conta com esse email.'] };

  const id = idSeguro();
  const hash = await hashPassword(dados.password);
  db.prepare(`INSERT INTO utilizadores
    (id, email, nome, papel, password_hash, criado_em) VALUES (?, ?, ?, ?, ?, ?)`)
    .run(id, email, dados.nome.trim(), dados.papel, hash, new Date().toISOString());

  return {
    utilizador: {
      id,
      email,
      nome: dados.nome.trim(),
      papel: dados.papel,
      criadoEm: new Date().toISOString()
    },
    erros: []
  };
}

/** Verifica credenciais e cria uma sessão opaca. Devolve o token. */
export async function entrar(
  email: string,
  password: string
): Promise<{ token?: string; utilizador?: Utilizador; erro?: string }> {
  const db = base();
  const linha = db.prepare('SELECT * FROM utilizadores WHERE email = ?')
    .get(email.trim().toLocaleLowerCase('pt-PT')) as LinhaUtilizador | undefined;

  // Mensagem genérica: não revelamos se o email existe.
  const erroGenerico = 'Email ou palavra-passe incorretos.';
  if (!linha) return { erro: erroGenerico };
  if (!(await verificarPassword(password, linha.password_hash))) return { erro: erroGenerico };

  const token = idSeguro();
  const agora = Date.now();
  transacao(() => {
    db.prepare('INSERT INTO sessoes_login (id, utilizador_id, criado_em, expira_em) VALUES (?, ?, ?, ?)')
      .run(token, linha.id, new Date(agora).toISOString(), new Date(agora + DURACAO_SESSAO_MS).toISOString());
    db.prepare('UPDATE utilizadores SET ultimo_entrar = ? WHERE id = ?')
      .run(new Date(agora).toISOString(), linha.id);
    // Limpeza oportunista de sessões expiradas.
    db.prepare('DELETE FROM sessoes_login WHERE expira_em < ?').run(new Date(agora).toISOString());
  });

  return {
    token,
    utilizador: {
      id: linha.id,
      email: linha.email,
      nome: linha.nome,
      papel: linha.papel as Papel,
      criadoEm: linha.criado_em
    }
  };
}

/** Resolve um token de sessão, respeitando a expiração. */
export function validarSessao(token: string | undefined): Utilizador | undefined {
  if (!token) return undefined;
  const db = base();
  const linha = db.prepare(`SELECT u.* FROM sessoes_login s
    JOIN utilizadores u ON u.id = s.utilizador_id
    WHERE s.id = ? AND s.expira_em > ?`)
    .get(token, new Date().toISOString()) as LinhaUtilizador | undefined;
  if (!linha) return undefined;
  return {
    id: linha.id,
    email: linha.email,
    nome: linha.nome,
    papel: linha.papel as Papel,
    criadoEm: linha.criado_em
  };
}

export function sair(token: string | undefined): void {
  if (!token) return;
  base().prepare('DELETE FROM sessoes_login WHERE id = ?').run(token);
}

/** Devolve o id da criança associada a uma conta, se existir. */
export function criancaDoUtilizador(utilizadorId: string): string | undefined {
  const linha = base().prepare('SELECT id FROM criancas WHERE utilizador_id = ? LIMIT 1')
    .get(utilizadorId) as { id: string } | undefined;
  return linha?.id;
}

/** Cria a conta de criança associada a um registo já existente na turma demo. */
export function ligarCrianca(utilizadorId: string, criancaId: string): void {
  base().prepare('UPDATE criancas SET utilizador_id = ? WHERE id = ?').run(utilizadorId, criancaId);
}
