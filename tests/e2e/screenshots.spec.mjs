import { test, expect } from '@playwright/test';
import { mkdir } from 'node:fs/promises';
import { openApp, selectFixtureVideo, measureFirstCycle } from '../helpers/app.mjs';
test('capture actual measured development UI using synthetic non-personal media', async ({page}) => {
  await mkdir('test-results/screenshots', {recursive:true});
  await openApp(page); await selectFixtureVideo(page); await measureFirstCycle(page);
  await page.locator('#boundarySelect').selectOption({index:1});
  await page.evaluate(()=>window.scrollTo(0,0));
  await page.screenshot({path:'test-results/screenshots/screenshot.png'});
  await page.locator('#languageButton').click(); await page.screenshot({path:'test-results/screenshots/screenshot-en.png'});
  await page.locator('#languageButton').click(); await page.setViewportSize({width:390,height:844});
  await page.locator('.mobile-tabs [data-page="review"]').click();
  await page.screenshot({path:'test-results/screenshots/screenshot-mobile.png',fullPage:true});
  await page.locator('.mobile-tabs [data-page="results"]').click();
  await page.screenshot({path:'test-results/screenshots/screenshot-mobile-results.png',fullPage:true});
  await expect(page.locator('#saveAnalysisButton')).toBeEnabled();
});
