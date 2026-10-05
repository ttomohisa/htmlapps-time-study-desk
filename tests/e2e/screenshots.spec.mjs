import { test, expect } from '@playwright/test';
import { mkdir } from 'node:fs/promises';
import { openApp, selectFixtureVideo } from '../helpers/app.mjs';
test('capture actual development UI using synthetic non-personal media', async ({page}) => {
  await mkdir('test-results/screenshots', {recursive:true});
  await openApp(page); await selectFixtureVideo(page);
  await expect(page.locator('#playButton')).toBeEnabled();
  await page.screenshot({path:'test-results/screenshots/screenshot.png'});
  await page.locator('#languageButton').click(); await page.screenshot({path:'test-results/screenshots/screenshot-en.png'});
  await page.locator('#languageButton').click(); await page.setViewportSize({width:390,height:844});
  await page.screenshot({path:'test-results/screenshots/screenshot-mobile.png',fullPage:true});
});
