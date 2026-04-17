import { chromium } from 'playwright';
import { mkdir } from 'fs/promises';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const SCREENSHOT_DIR = join(__dirname, '../tasks/2026-04-17-geojson-obstacle-import/execution/screenshots');
const BASE_URL = 'http://localhost:5175';

const SAMPLE_GEOJSON = JSON.stringify({
  type: 'FeatureCollection',
  features: [
    {
      type: 'Feature',
      geometry: { type: 'Point', coordinates: [126.977, 37.566] },
      properties: { title: '테스트 공사', category: '공사중', dangerLevel: '주의' }
    },
    {
      type: 'Feature',
      geometry: {
        type: 'LineString',
        coordinates: [[126.975, 37.565], [126.978, 37.567], [126.980, 37.565]]
      },
      properties: { title: '도로 파손 구간', category: '도로파손', dangerLevel: '위험' }
    }
  ]
}, null, 2);

async function run() {
  await mkdir(SCREENSHOT_DIR, { recursive: true });

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  await page.setViewportSize({ width: 1280, height: 800 });

  // 1. 초기 화면
  await page.goto(BASE_URL, { waitUntil: 'networkidle', timeout: 15000 });
  await page.waitForTimeout(2000);
  await page.screenshot({ path: join(SCREENSHOT_DIR, '01-initial-map.png'), fullPage: false });
  console.log('✓ 01-initial-map.png');

  // 2. GeoJSON 가져오기 버튼 클릭 → 모달 열기
  const importBtn = page.locator('button:has-text("GeoJSON")').first();
  await importBtn.waitFor({ timeout: 5000 });
  await importBtn.click();
  await page.waitForTimeout(500);
  await page.screenshot({ path: join(SCREENSHOT_DIR, '02-modal-text-tab.png') });
  console.log('✓ 02-modal-text-tab.png');

  // 3. 파일 업로드 탭 클릭
  const fileTab = page.locator('[role="tab"]:has-text("파일")').first();
  if (await fileTab.count() > 0) {
    await fileTab.click();
    await page.waitForTimeout(300);
    await page.screenshot({ path: join(SCREENSHOT_DIR, '03-file-upload-tab.png') });
    console.log('✓ 03-file-upload-tab.png');
  }

  // 4. 텍스트 탭으로 돌아가서 GeoJSON 입력 후 파싱
  const textTab = page.locator('[role="tab"]:has-text("텍스트")').first();
  if (await textTab.count() > 0) await textTab.click();

  const textarea = page.locator('textarea').first();
  await textarea.waitFor({ timeout: 3000 });
  await textarea.fill(SAMPLE_GEOJSON);
  await page.waitForTimeout(200);

  // 파싱 버튼 클릭
  const parseBtn = page.locator('button:has-text("파싱")').first();
  if (await parseBtn.count() > 0) {
    await parseBtn.click();
    await page.waitForTimeout(500);
  }
  await page.screenshot({ path: join(SCREENSHOT_DIR, '04-parse-result.png') });
  console.log('✓ 04-parse-result.png');

  // 5. 위험도 라디오 선택 — React nativeInputValueSetter 방식
  await page.evaluate(() => {
    const dialog = document.querySelector('[role="dialog"]');
    if (!dialog) return;

    // 스크롤 (위험도 섹션 노출)
    const panel = dialog.querySelector('.geojson-modal-panel');
    const body = panel
      ? Array.from(panel.children).find(c => c.style.overflowY === 'auto' || c.style.flex)
      : dialog;
    if (body) body.scrollTop = body.scrollHeight;
  });
  await page.waitForTimeout(200);

  // Playwright locator로 위험도 label 클릭 (스크롤 후)
  await page.locator('.geojson-danger-option').filter({ hasText: '주의' }).click({ force: true });
  await page.waitForTimeout(500);
  // 스크롤된 상태 (위험도 선택 visible)
  await page.screenshot({ path: join(SCREENSHOT_DIR, '05-danger-selected.png') });
  console.log('✓ 05-danger-selected.png');

  // 위로 스크롤해서 전체 폼 확인
  await page.evaluate(() => {
    const panel = document.querySelector('.geojson-modal-panel');
    const body = panel
      ? Array.from(panel.children).find(c => c.style.overflowY === 'auto' || c.style.flex === '1')
      : null;
    if (body) body.scrollTop = 0;
  });
  await page.waitForTimeout(200);
  await page.screenshot({ path: join(SCREENSHOT_DIR, '05-metadata-filled.png') });
  console.log('✓ 05-metadata-filled.png');

  // 6. 등록 버튼 — disabled 아닌 것만 클릭 (위험도 선택됐으므로 활성화됨)
  await page.evaluate(() => {
    const dialog = document.querySelector('[role="dialog"]');
    if (!dialog) return;
    const btns = Array.from(dialog.querySelectorAll('button'));
    const btn = btns.find(b => b.textContent.includes('장애물 등록') && !b.disabled);
    if (btn) btn.click();
    else {
      // fallback: force
      const any = btns.find(b => b.textContent.includes('장애물 등록'));
      if (any) any.click();
    }
  });
  await page.waitForTimeout(2500);
  await page.screenshot({ path: join(SCREENSHOT_DIR, '06-after-import.png') });
  console.log('✓ 06-after-import.png');

  await browser.close();
  console.log('\n스크린샷 완료:', SCREENSHOT_DIR);
}

run().catch(err => {
  console.error('오류:', err.message);
  process.exit(1);
});
