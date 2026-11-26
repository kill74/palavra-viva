/**
 * Testes de segurança contra a build com servidor.
 *
 * Uso: deno task build:server && node scripts/testes-seguranca.mjs
 * Sobe o servidor com uma BD temporária e tenta as explorações conhecidas.
 */
import { spawn } from 'node:child_process';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { chromium } from 'playwright';

const porta = 4300 + Math.floor(Math.random() * 400);
const BASE = `http://127.0.0.1:${porta}`;
const dir = mkdtempSync(join(tmpdir(), 'pv-seg-'));
const bd = join(dir, 'teste.sqlite');

const resultados = [];
const caso = (nome, ok) => {
  resultados.push({ nome, ok });
  console.log(`${ok ? '✓' : '✗'} ${nome}`);
};

const servidor = spawn('node', ['servidor/index.js'], {
  cwd: process.cwd(),
  env: {
    ...process.env,
    PORT: String(porta),
    ORIGIN: BASE,
    MODO_SERVIDOR: '1',
    PALAVRA_VIVA_DB: bd
  },
  stdio: 'ignore'
});

async function esperarServidor() {
  for (let i = 0; i < 60; i++) {
    try {
      const r = await fetch(`${BASE}/entrar/`);
      if (r.ok) return;
    } catch { /* ainda a arrancar */ }
    await new Promise((r) => setTimeout(r, 200));
  }
  throw new Error('O servidor não arrancou.');
}

let browser;
try {
  await esperarServidor();

  // Seed da turma de demonstração na BD temporária.
  const seed = spawn('deno', ['task', 'db:seed'], {
    cwd: process.cwd(),
    env: { ...process.env, PALAVRA_VIVA_DB: bd },
    stdio: 'ignore'
  });
  await new Promise((resolve) => seed.on('exit', resolve));

  // 1. Cabeçalhos de segurança
  const resposta = await fetch(`${BASE}/entrar/`);
  const h = resposta.headers;
  caso('CSP presente', Boolean(h.get('content-security-policy')));
  caso('X-Frame-Options DENY', h.get('x-frame-options') === 'DENY');
  caso('X-Content-Type-Options nosniff', h.get('x-content-type-options') === 'nosniff');
  caso('Referrer-Policy', Boolean(h.get('referrer-policy')));

  // 2. Open redirect e registo escalado (via HTTP direto)
  const post = (url, corpo, cookie) => fetch(`${BASE}${url}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Origin: BASE,
      ...(cookie ? { Cookie: cookie } : {})
    },
    body: corpo,
    redirect: 'manual'
  });

  let r = await post('/api/entrar?tipo=entrar',
    'email=alice%40palavraviva.pt&password=alice2026%21&destino=%2Fprofessor%40evil.com');
  caso('Open redirect bloqueado', r.headers.get('location') === '/crianca/');

  const aviso = (resposta) => resposta.headers.getSetCookie?.().join('; ') ?? '';

  r = await post('/api/entrar?tipo=registar',
    'email=novo%40x.pt&nome=Novo&password=SenhaForte123&papel=crianca');
  caso('Registo publico de crianca recusado', aviso(r).includes('pv_aviso'));

  r = await post('/api/entrar?tipo=registar',
    'email=novo%40x.pt&nome=Novo&password=SenhaForte123&papel=professora');
  caso('Registo de professora sem convite recusado', aviso(r).includes('pv_aviso'));

  // 3. Rate limit
  for (let i = 0; i < 6; i++) {
    await post('/api/entrar?tipo=entrar', 'email=limite%40x.pt&password=Errada12345');
  }
  const cookie = (await post('/api/entrar?tipo=entrar', 'email=limite%40x.pt&password=Errada12345'))
    .headers.getSetCookie?.().join('; ') ?? '';
  const entrada = await fetch(`${BASE}/entrar/`, { headers: { Cookie: cookie } }).then((x) => x.text());
  caso('Rate limit ativo', entrada.includes('Demasiadas tentativas'));

  // 4. IDOR no browser
  browser = await chromium.launch({ executablePath: '/usr/bin/chromium', args: ['--no-sandbox'] });
  const pagina = await (await browser.newContext()).newPage();
  await pagina.goto(`${BASE}/entrar/`, { waitUntil: 'networkidle' });
  await pagina.getByRole('button', { name: /Sou professora/ }).click();
  await pagina.locator('#email-conta').fill('benjamim@palavraviva.pt');
  await pagina.locator('#password-conta').fill('benjamim2026!');
  await pagina.locator('form[action*="tipo=entrar"] button[type="submit"]').click();
  await pagina.waitForURL('**/crianca/');
  await pagina.goto(`${BASE}/crianca/sessao/?crianca=alice`, { waitUntil: 'networkidle' });
  caso('IDOR removido', !pagina.url().includes('crianca=alice'));
} finally {
  await browser?.close();
  servidor.kill();
  rmSync(dir, { recursive: true, force: true });
}

const falhas = resultados.filter((r) => !r.ok);
console.log(`\n${resultados.length - falhas.length}/${resultados.length} verificações passaram`);
if (falhas.length) process.exitCode = 1;
