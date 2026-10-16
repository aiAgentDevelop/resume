const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const http = require('node:http');
const { pathToFileURL } = require('node:url');
const { chromium } = require('playwright');
const root = path.resolve(__dirname, '..');
const api = name => JSON.parse(fs.readFileSync(path.join(root, 'api', name + '.json'), 'utf8'));
const highlights = api('summary').highlights;
for (const highlight of highlights) {
  for (const item of highlight.items) {
    for (const ref of item.references) {
      const company = api('career').find(c => c.id === ref.careerId);
      assert(company && company.projects.some(p => p.id === ref.projectId), 'broken evidence reference');
    }
  }
}
assert(!/xx|45일|2~3|2-3|단축|\d+\s*%/.test(JSON.stringify(highlights)), 'unsupported comparison in highlights');
const types = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png' };
const server = http.createServer((req, res) => {
  const file = path.resolve(root, '.' + decodeURIComponent(new URL(req.url, 'http://localhost').pathname));
  if (!file.startsWith(root + path.sep) || !fs.existsSync(file) || !fs.statSync(file).isFile()) { res.writeHead(404).end(); return; }
  res.setHeader('Content-Type', types[path.extname(file)] || 'application/octet-stream');
  fs.createReadStream(file).pipe(res);
});
(async () => {
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const browser = await chromium.launch();
  const errors = [];
  const context = await browser.newContext({ reducedMotion: 'reduce' });
  const page = await context.newPage();
  page.on('pageerror', e => errors.push(e.message));
  const output = path.join(root, 'tmp', 'review');
  fs.mkdirSync(output, { recursive: true });
  try {
    for (const base of [pathToFileURL(root + path.sep).href, `http://127.0.0.1:${server.address().port}/`]) {
      await page.goto(base + 'index.html?stay=1');
      await page.locator('.career-item').last().waitFor();
      assert.equal(await page.locator('.career-item').count(), api('career').length);
      assert.equal(await page.locator('.about-heading').count(), api('about').sections.length);
      assert((await page.locator('#career-content').innerText()).includes('PP셀 / PP셀원'));
      assert(!(await page.locator('#career-content').innerText()).includes('입사 계기'));
      assert((await page.locator('#career-title').innerText()).includes(api('summary').career.totalExperience));
      for (const h of highlights) for (const item of h.items) {
        assert((await page.locator('#highlights-content').innerText()).includes(item.lead + ' ' + item.text));
      }
      await page.locator('#highlights-content a[href="#project-rule-the-coin"]').click();
      assert.equal(new URL(page.url()).hash, '#project-rule-the-coin');
      assert((await page.locator('#career-content').innerText()).includes('방치형 게임 기타소녀'));
      assert(!(await page.locator('#career-content').innerText()).includes('음악게임 3종'));
      const pokopang = api('career')[0].projects.find(p => p.title.startsWith('포코팡'));
      assert(!JSON.stringify(pokopang).includes('인프라'));
      await page.goto(base + 'portfolio.html');
      await page.keyboard.press('Tab');
      assert.equal(await page.evaluate(() => document.activeElement.className), 'skip-link');
      await page.keyboard.press('Enter');
      assert.equal(await page.evaluate(() => document.activeElement.id), 'hero');
      assert.equal(await page.locator('.selected-games .game-card').count(), 3);
      assert.equal(await page.locator('.more-games .game-card').count(), 5);
      await page.locator('.more-games summary').click();
      assert.equal(await page.locator('.game-card:visible').count(), 8);
      await page.locator('.more-games summary').click();
      assert.equal(await page.locator('.evidence-card').count(), 5);
      assert.deepEqual(await page.locator('#portfolio-app > section').evaluateAll(elements => elements.slice(0, 4).map(el => el.id)), ['hero', 'highlights', 'career', 'games']);
      for (const h of highlights) for (const item of h.items) {
        assert((await page.locator('#highlights-grid').innerText()).includes(item.lead + ' ' + item.text));
      }
      assert.equal(await page.locator('.about-chapter').count(), api('about').sections.length);
      assert.equal(await page.locator('.timeline-item').count(), 4);
      await page.locator('.evidence-link[href="#project-payment-singapore"]').click();
      assert.equal(await page.locator('.timeline-item').count(), api('career').length);
      assert.equal(await page.evaluate(() => document.activeElement.id), 'project-payment-singapore');
      assert(await page.locator('#career-4 details').getAttribute('open') !== null);
      await page.locator('.career-details:not([open]) summary').evaluateAll(items => items.forEach(item => item.click()));
      const text = await page.locator('#career-timeline').innerText();
      for (const term of ['SQLRelay', 'pconnect()', 'GitHub Actions', 'PP셀 / PP셀원', '결제']) assert(text.includes(term), term);
      await page.locator('#career-toggle').click();
      assert.equal(await page.locator('.timeline-item').count(), 4);
      for (const width of [320, 768, 1440, 390]) {
        await page.setViewportSize({ width, height: 960 });
        await page.locator('#highlights').scrollIntoViewIfNeeded();
        assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), 'horizontal overflow');
        if (base.startsWith('http')) await page.screenshot({path: path.join(output, `cards-${width}.png`)});
      }
      if (base.startsWith('http')) {
        for (const section of ['hero', 'career', 'about']) {
          await page.locator('#' + section).scrollIntoViewIfNeeded();
          await page.screenshot({ path: path.join(output, section + '-mobile.png') });
        }
        await page.setViewportSize({width:1440, height:1000});
        await page.evaluate(() => scrollTo(0, 0));
        await page.waitForFunction(() => document.querySelectorAll('.nav-link.is-active').length === 0);
        await page.screenshot({path: path.join(output, 'hero-desktop.png')});
      }
      await page.emulateMedia({ media: 'print' });
      await page.evaluate(() => dispatchEvent(new Event('beforeprint')));
      assert.equal(await page.locator('.timeline-item').count(), api('career').length);
      assert.equal(await page.locator('.career-details:not([open])').count(), 0);
      assert.equal(await page.locator('.game-card:visible').count(), 8);
      await page.evaluate(() => dispatchEvent(new Event('afterprint')));
      assert.equal(await page.locator('.more-games').getAttribute('open'), null);
      await page.emulateMedia({ media: 'screen' });
    }
    await page.setViewportSize({ width: 1000, height: 960 });
    await page.goto(pathToFileURL(path.join(root, 'index.html')).href + '?stay=1');
    await page.emulateMedia({ media: 'print' });
    await page.screenshot({ path: path.join(output, 'resume-print.png') });
    await page.emulateMedia({ media: 'screen', reducedMotion: 'no-preference' });
    await page.waitForTimeout(4300);
    assert(page.url().includes('stay=1'), 'stay link must not redirect');
    await page.goto(pathToFileURL(path.join(root, 'index.html')).href);
    await page.waitForURL('**/portfolio.html', { timeout: 10000 });
    assert.deepEqual(errors, []);
    console.log('PASS: file/HTTP, both resumes, evidence links, career toggle, mobile widths, print content, stay link and glitch transition');
  } finally { await context.close(); await browser.close(); }
})().catch(err => { console.error(err); process.exitCode = 1; }).finally(() => server.close());
