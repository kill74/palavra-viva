/**
 * Lighthouse nas 9 rotas × 2 perfis (mobile e desktop).
 *
 * Uso:
 *   npx vite build
 *   CHROME_PATH=/usr/bin/chromium node scripts/auditar-desempenho.mjs
 *
 * O script serve build/ num servidor local efémero.
 * A página de erro não entra nesta matriz: um 404 deve ser `noindex`, o que o
 * Lighthouse penaliza em SEO; ela é verificada por axe-core e testes funcionais.
 * Requer Lighthouse 13 (usado via npx, sem dependência no projeto).
 * Os relatórios completos ficam em /tmp e não são versionados; o resumo
 * com as 64 pontuações é guardado em docs/verificacao/lighthouse.json.
 */
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';

const executar = promisify(execFile);
import { createServer } from 'node:http';
import { mkdtempSync, readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { extname, join, normalize } from 'node:path';

const CHROME = process.env.CHROME_PATH ?? '/usr/bin/chromium';
const TIPOS = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.woff2': 'font/woff2',
  '.mp3': 'audio/mpeg'
};

const servidor = createServer((pedido, resposta) => {
  const url = new URL(pedido.url ?? '/', 'http://localhost');
  let caminho = normalize(decodeURIComponent(url.pathname)).replace(/^(\.\.[/\\])+/, '');
  if (caminho === '/' || caminho.endsWith('/')) caminho += 'index.html';
  let ficheiro = join('build', caminho);
  if (!existsSync(ficheiro)) ficheiro = join('build', '404.html');
  resposta.writeHead(200, { 'content-type': TIPOS[extname(ficheiro)] ?? 'application/octet-stream' });
  resposta.end(readFileSync(ficheiro));
});
await new Promise((resolver) => servidor.listen(0, '127.0.0.1', resolver));
const BASE = `http://127.0.0.1:${servidor.address().port}`;
const SAIDA = 'docs/verificacao/lighthouse.json';
const temporario = mkdtempSync(join(tmpdir(), 'palavra-viva-lh-'));

const rotas = [
  '/',
  '/metodo/',
  '/professor/',
  '/professor/criar/',
  '/professor/biblioteca/',
  '/professor/sessoes/',
  '/crianca/',
  '/crianca/sessao/?crianca=alice'
];

const perfis = [
  { nome: 'mobile', argumentos: [] },
  { nome: 'desktop', argumentos: ['--preset=desktop'] }
];

const linhas = [];

for (const rota of rotas) {
  for (const perfil of perfis) {
    const destino = join(temporario, `lh-${linhas.length}.json`);
    await executar(
      'npx',
      [
        '--yes',
        'lighthouse@13.6.0',
        `${BASE}${rota}`,
        '--quiet',
        '--chrome-flags=--headless --no-sandbox',
        '--only-categories=performance,accessibility,best-practices,seo',
        '--output=json',
        `--output-path=${destino}`
      ].concat(perfil.argumentos),
      { env: { ...process.env, CHROME_PATH: CHROME }, stdio: 'pipe' }
    );
    const relatorio = JSON.parse(readFileSync(destino, 'utf8'));
    const pontuacoes = Object.fromEntries(
      Object.entries(relatorio.categories).map(([chave, categoria]) => [chave, Math.round(categoria.score * 100)])
    );
    linhas.push({
      rota,
      perfil: perfil.nome,
      ...pontuacoes,
      lcp: relatorio.audits['largest-contentful-paint']?.displayValue ?? null,
      cls: relatorio.audits['cumulative-layout-shift']?.displayValue ?? null
    });
    console.log(`${perfil.nome} ${rota}: ${Object.values(pontuacoes).join('/')}`);
  }
}

const resumo = {
  data: new Date().toISOString(),
  ferramenta: 'Lighthouse 13.6.0',
  totalPontuacoes: linhas.length * 4,
  minimo: Math.min(...linhas.flatMap((l) => ['performance', 'accessibility', 'best-practices', 'seo'].map((c) => l[c]))),
  linhas
};

mkdirSync('docs/verificacao', { recursive: true });
writeFileSync(SAIDA, `${JSON.stringify(resumo, null, 2)}\n`);
servidor.close();
console.log(`\n${resumo.totalPontuacoes} pontuações, mínimo ${resumo.minimo} → ${SAIDA}`);
if (resumo.minimo < 95) process.exitCode = 1;
