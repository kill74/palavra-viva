/**
 * Testes funcionais sobre o build de pré-visualização (mesmo percurso do relatório §9.2).
 *
 * Uso:
 *   npx vite build && npx vite preview --port 4173 &
 *   node scripts/testes-funcionais.mjs
 */
import { writeFileSync, mkdirSync } from 'node:fs';
import { chromium } from 'playwright';

const BASE = process.env.BASE_URL ?? 'http://127.0.0.1:4173';
const SAIDA = 'docs/verificacao/testes-funcionais.json';
const casos = [];
const errosConsola = [];
let ignorarErrosConsola = false;

const browser = await chromium.launch({ executablePath: '/usr/bin/chromium', args: ['--no-sandbox'] });
const contexto = await browser.newContext({ viewport: { width: 1280, height: 900 } });
const pagina = await contexto.newPage();
pagina.on('console', (msg) => {
  if (msg.type() === 'error' && !ignorarErrosConsola) errosConsola.push(msg.text());
});

async function caso(nome, fn) {
  try {
    await fn();
    casos.push({ caso: nome, resultado: 'passou' });
    console.log(`✓ ${nome}`);
  } catch (erro) {
    casos.push({ caso: nome, resultado: 'falhou', erro: String(erro).slice(0, 300) });
    console.log(`✗ ${nome}: ${erro}`);
  }
}

await caso('Alternância e persistência do tema', async () => {
  await pagina.goto(`${BASE}/`);
  const botao = pagina.getByRole('button', { name: /Ativar modo/ });
  const antes = await botao.getAttribute('aria-pressed');
  await botao.click();
  await pagina.waitForTimeout(150);
  const depois = await pagina.getByRole('button', { name: /Ativar modo/ }).getAttribute('aria-pressed');
  if (antes === depois) throw new Error('O tema não mudou');
  const guardado = await pagina.evaluate(() => localStorage.getItem('palavra-viva:tema'));
  if (!guardado) throw new Error('O tema não foi persistido');
  await pagina.reload();
});

await caso('Menu móvel: abrir, foco e fechar com Escape', async () => {
  await pagina.setViewportSize({ width: 390, height: 844 });
  await pagina.goto(`${BASE}/`);
  const menu = pagina.getByRole('button', { name: 'Abrir menu' });
  await menu.click();
  if ((await pagina.getByRole('button', { name: 'Fechar menu' }).getAttribute('aria-expanded')) !== 'true') {
    throw new Error('O menu não abriu');
  }
  await pagina.keyboard.press('Escape');
  const foco = await pagina.evaluate(() => document.activeElement?.getAttribute('aria-label'));
  if (foco !== 'Abrir menu') throw new Error(`O foco não voltou ao botão do menu: ${foco}`);
  await pagina.setViewportSize({ width: 1280, height: 900 });
});

await caso('Escolha de criança e entrada na sessão', async () => {
  await pagina.goto(`${BASE}/crianca/`);
  await pagina.getByRole('button', { name: /Alice/ }).click();
  await pagina.getByRole('link', { name: /Começar a sessão/ }).click();
  await pagina.waitForURL(/\/crianca\/sessao/);
  if ((await pagina.locator('h1').count()) !== 1) throw new Error('A sessão não tem um h1');
});

await caso('Resposta certa, errada, nova tentativa, ajuda e conclusão', async () => {
  await pagina.goto(`${BASE}/crianca/sessao/?crianca=alice&recurso=rec-alice-menina`);
  await pagina.getByRole('button', { name: 'Quero uma dica' }).click();
  await pagina.getByRole('button', { name: 'uva', exact: true }).click();
  await pagina.getByRole('button', { name: /Tentar outra vez/ }).click();
  await pagina.getByRole('button', { name: 'menina', exact: true }).click();
  await pagina.getByRole('button', { name: /Continuar|Ver o fim/ }).click();
  await pagina.getByRole('heading', { name: /sessão terminou/i }).waitFor();
});

await caso('Sessão gravada e visível nos registos', async () => {
  const guardadas = await pagina.evaluate(() => {
    const bruto = localStorage.getItem('palavra-viva:dados:v1');
    return bruto ? JSON.parse(bruto).sessoes.length : 0;
  });
  if (guardadas < 1) throw new Error('Nenhuma sessão foi gravada');
  await pagina.goto(`${BASE}/professor/sessoes/`);
  if (!(await pagina.getByText(/Respostas autónomas|autónoma/i).first().isVisible())) {
    throw new Error('Os registos não mostram a autonomia');
  }
});

await caso('Biblioteca: aprovar e devolver um rascunho', async () => {
  await pagina.goto(`${BASE}/professor/biblioteca/?recurso=rec-alice-galinha`);
  await pagina.getByRole('button', { name: /Aprovar/ }).first().click();
  await pagina.getByRole('button', { name: /Devolver a rascunho/ }).click();
  const estado = await pagina.evaluate(() => {
    const bruto = localStorage.getItem('palavra-viva:dados:v1');
    return bruto ? JSON.parse(bruto).recursos.find((r) => r.id === 'rec-alice-galinha')?.estado : null;
  });
  if (estado !== 'rascunho') throw new Error(`Estado final inesperado: ${estado}`);
});

await caso('Estúdio: gerar, validar e aprovar um recurso', async () => {
  await pagina.goto(`${BASE}/professor/criar/`);
  await pagina.getByRole('button', { name: /Gerar proposta/ }).click();
  await pagina.getByRole('button', { name: /Aprovar e disponibilizar/ }).click();
  const mensagem = await pagina.getByText(/Recurso aprovado/).count();
  if (mensagem === 0) throw new Error('A aprovação não foi confirmada');
});

await caso('Exportação CSV', async () => {
  await pagina.goto(`${BASE}/professor/biblioteca/`);
  const [download] = await Promise.all([
    pagina.waitForEvent('download'),
    pagina.getByRole('button', { name: /Exportar CSV/ }).click()
  ]);
  if (!download.suggestedFilename().endsWith('.csv')) throw new Error('O ficheiro não é CSV');
});

await caso('Página 404', async () => {
  // A própria navegação para uma rota inexistente gera um 404 esperado no consolo.
  ignorarErrosConsola = true;
  const resposta = await pagina.goto(`${BASE}/rota-inexistente/`);
  if (!resposta || resposta.status() !== 404) throw new Error(`Estado HTTP: ${resposta?.status()}`);
  await pagina.getByRole('heading').first().waitFor();
  ignorarErrosConsola = false;
});

await caso('Sem erros na consola', async () => {
  if (errosConsola.length > 0) throw new Error(errosConsola.join(' | ').slice(0, 300));
});

await browser.close();

const resumo = {
  data: new Date().toISOString(),
  base: BASE,
  total: casos.length,
  passou: casos.filter((c) => c.resultado === 'passou').length,
  falhou: casos.filter((c) => c.resultado === 'falhou').length,
  casos,
  errosConsola
};

mkdirSync('docs/verificacao', { recursive: true });
writeFileSync(SAIDA, `${JSON.stringify(resumo, null, 2)}\n`);
console.log(`\n${resumo.passou}/${resumo.total} casos passaram → ${SAIDA}`);
if (resumo.falhou > 0) process.exitCode = 1;
