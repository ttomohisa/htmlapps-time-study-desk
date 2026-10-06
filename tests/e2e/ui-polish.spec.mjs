import { test, expect } from '@playwright/test';
import { openApp, selectFixtureVideo } from '../helpers/app.mjs';

test('desktop intro follows Browser Kitty hierarchy and uses fully local processing copy', async ({ page }) => {
  await page.setViewportSize({ width: 1360, height: 900 });
  await openApp(page);
  await expect(page.locator('#heroTitle')).toHaveText('作業動画を工程ごとに区切って時間を比較');
  await expect(page.locator('.page-intro > div:first-child > p')).toContainText('動画を見ながら工程の区切りを記録');
  await expect(page.locator('.local-badge')).toContainText('完全ローカル処理');
  const size = parseFloat(await page.locator('#heroTitle').evaluate(el => getComputedStyle(el).fontSize));
  expect(size).toBeLessThanOrEqual(28);
});

test('help icon has an explicit dot and saved-analysis action is readable but secondary', async ({ page }) => {
  await openApp(page);
  await expect(page.locator('#helpButton .help-dot')).toHaveCount(1);
  const open = page.locator('#openAnalysisInlineButton');
  await expect(open).toBeEnabled();
  const style = await open.evaluate(el => {
    const s=getComputedStyle(el); return {background:s.backgroundColor,color:s.color,opacity:s.opacity,border:s.borderColor};
  });
  expect(style.opacity).toBe('1');
  expect(style.background).toBe('rgba(0, 0, 0, 0)');
  expect(style.color).not.toBe('rgb(242, 247, 244)');
});

test('desktop workspace keeps measurement centered and reveals records only after evidence exists', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await openApp(page); await selectFixtureVideo(page);
  const panel = await page.locator('.player-panel').boundingBox();
  expect(panel.width).toBeGreaterThanOrEqual(880);
  expect(panel.width).toBeLessThanOrEqual(1000);
  expect(Math.abs(panel.x - (1280 - panel.width) / 2)).toBeLessThanOrEqual(14);
  await expect(page.locator('#recordCard')).toBeHidden();
  await page.locator('#startCycleButton').click();await page.locator('#seekBar').evaluate(input=>{input.value='.6';input.dispatchEvent(new Event('change',{bubbles:true}));});
  await page.waitForFunction(()=>document.querySelector('#mediaStatus').dataset.state==='ready');await page.locator('#markBoundaryButton').click();
  await expect(page.locator('#recordCard')).toBeHidden();
});


test('measurement page defers management and export cards until their dedicated screens', async ({page})=>{
  await openApp(page);await selectFixtureVideo(page);await page.locator('#startCycleButton').click();
  await expect(page.locator('#cyclesCard')).toBeHidden();await expect(page.locator('#analysisCard')).toBeHidden();await expect(page.locator('#sourceCard')).toBeHidden();
  await page.locator('.workspace-switch [data-page="results"]').click();await expect(page.locator('#analysisCard')).toBeVisible();await expect(page.locator('#sourceCard')).toBeVisible();
});
