// 크래프톤 지원용 커버 레터 HTML → PDF 변환 스크립트
// 사용법: node scripts/generate-krafton-cover-letter-pdf.js

const path = require('path');
const { chromium } = require('playwright');

(async () => {
  const projectRoot = path.resolve(__dirname, '..');
  const htmlPath = path.join(projectRoot, '커버레터-이동완-크래프톤.html');
  const fileUrl = 'file:///' + htmlPath.replace(/\\/g, '/');
  const outputPath = path.join(projectRoot, '커버레터-이동완-크래프톤.pdf');

  console.log('[pdf] loading:', fileUrl);

  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();

  await page.goto(fileUrl, { waitUntil: 'networkidle' });
  await page.waitForTimeout(300);

  await page.pdf({
    path: outputPath,
    format: 'A4',
    printBackground: true,
    preferCSSPageSize: true,
    margin: { top: '16mm', bottom: '16mm', left: '16mm', right: '16mm' }
  });

  await browser.close();

  console.log('[pdf] done:', outputPath);
})().catch(err => {
  console.error('[pdf] failed:', err);
  process.exit(1);
});
