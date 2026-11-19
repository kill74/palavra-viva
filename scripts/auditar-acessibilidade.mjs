/**
 * Auditoria axe-core nas 9 rotas × 2 temas.
 *
 * Uso:
 *   npx vite build && npx vite preview --port 4173 &
 *   node scripts/auditar-acessibilidade.mjs
 *
 * O axe-core está vendorizado em scripts/vendor/axe.min.js para que a
 * auditoria não dependa de rede nem de instalações adicionais.
 */
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { chromium } from 'playwright';

const BASE = process.env.BASE_URL ?? 'http://127.0.0.1:4173';
const SAIDA = 'docs/verificacao/axe-core.json';
const axeFonte = readFileSync(new URL('./vendor/axe.min.js', import.meta.url), 'utf8');

const rotas = [
  { nome: 'inicio', caminho: '/' },
  { nome: 'metodo', caminho: '/metodo/' },
  { nome: 'professor', caminho: '/professor/' },
  { nome: 'professor/criar', caminho: '/professor/criar/' },
  { nome: 'professor/biblioteca', caminho: '/professor/biblioteca/' },
  { nome: 'professor/sessoes', caminho: '/professor/sessoes/' },
  { nome: 'crianca', caminho: '/crianca/' },
  { nome: 'crianca/sessao', caminho: '/crianca/sessao/?crianca=alice' },
  { nome: 'erro', caminho: '/rota-inexistente/' }
];

const browser = await chromium.launch({ executablePath: '/usr/bin/chromium', args: ['--no-sandbox'] });
const contexto = await browser.newContext();
const pagina = await contexto.newPage();
const resultados = [];

for (const tema of ['claro', 'escuro']) {
  await pagina.addInitScript((valor) => {
    localStorage.setItem('palavra-viva:tema', valor);
  }, tema);

  for (const rota of rotas) {
    await pagina.goto(`${BASE}${rota.caminho}`, { waitUntil: 'networkidle' });
    await pagina.evaluate(axeFonte);
    const resultado = await pagina.evaluate(async () => {
      // @ts-ignore axe é injetado em tempo de execução
      return await window.axe.run(document, {
        runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'] }
      });
    });
    resultados.push({
      rota: rota.nome,
      tema,
      violacoes: resultado.violations.length,
      detalhes: resultado.violations.map((v) => ({
        id: v.id,
        impacto: v.impact,
        descricao: v.help,
        nos: v.nodes.length
      }))
    });
  }
}

await browser.close();

const resumo = {
  data: new Date().toISOString(),
  ferramenta: 'axe-core 4.14.1',
  norma: 'WCAG 2 A/AA + 2.1 A/AA',
  combinacoes: resultados.length,
  totalViolacoes: resultados.reduce((soma, r) => soma + r.violacoes, 0),
  resultados
};

mkdirSync('docs/verificacao', { recursive: true });
writeFileSync(SAIDA, `${JSON.stringify(resumo, null, 2)}\n`);
console.log(`${resumo.combinacoes} combinações, ${resumo.totalViolacoes} violações → ${SAIDA}`);
if (resumo.totalViolacoes > 0) process.exitCode = 1;
