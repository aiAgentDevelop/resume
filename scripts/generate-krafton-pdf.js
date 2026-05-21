// 크래프톤 지원용 이력서 HTML → PDF 변환 스크립트
// 사용법: node scripts/generate-krafton-pdf.js
// 요구사항: playwright + chromium (이미 프로젝트에 설치됨)

const path = require('path');
const { chromium } = require('playwright');

(async () => {
  const projectRoot = path.resolve(__dirname, '..');
  const htmlPath = path.join(projectRoot, '이력서-이동완-크래프톤.html');
  const fileUrl = 'file:///' + htmlPath.replace(/\\/g, '/');
  const outputPath = path.join(projectRoot, '이력서-이동완-크래프톤.pdf');

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
    margin: { top: '14mm', bottom: '14mm', left: '14mm', right: '14mm' }
  });

  await browser.close();

  console.log('[pdf] done:', outputPath);
})().catch(err => {
  console.error('[pdf] failed:', err);
  process.exit(1);
});
