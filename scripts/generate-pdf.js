// 이력서 HTML → PDF 변환 스크립트
// 사용법: node scripts/generate-pdf.js
// 요구사항: npx playwright install chromium (최초 1회)

const path = require('path');
const { chromium } = require('playwright');

(async () => {
  const projectRoot = path.resolve(__dirname, '..');
  const htmlPath = path.join(projectRoot, 'index.html');
  const fileUrl = 'file:///' + htmlPath.replace(/\\/g, '/');
  const outputPath = path.join(projectRoot, '이력서_이동완.pdf');

  console.log('[pdf] loading:', fileUrl);

  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();

  await page.goto(fileUrl, { waitUntil: 'networkidle' });
  // 데이터 렌더링 대기 (정적 스크립트는 즉시 완료되지만 방어적 대기)
  await page.waitForTimeout(300);

  await page.pdf({
    path: outputPath,
    format: 'A4',
    printBackground: true,
    preferCSSPageSize: true,
    margin: { top: '12mm', bottom: '12mm', left: '12mm', right: '12mm' }
  });

  await browser.close();

  console.log('[pdf] done:', outputPath);
})().catch(err => {
  console.error('[pdf] failed:', err);
  process.exit(1);
});
