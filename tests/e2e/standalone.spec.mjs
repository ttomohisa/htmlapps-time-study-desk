import { test, expect } from '@playwright/test';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { openApp, selectFixtureVideo } from '../helpers/app.mjs';

test('root HTML is byte-identical to readable standalone and self-extract declares offline runtime', async () => {
  const readable=await readFile(resolve('dist/index.html'));
  const root=await readFile(resolve('time-study-desk.html'));
  expect(Buffer.compare(readable,root)).toBe(0);
  const manifest=JSON.parse(await readFile(resolve('dist/self-extract-manifest.json'),'utf8'));
  expect(manifest.runtime?.networkRequired).toBe(false);
});

for (const variant of ['readable','self-extract']) {
  test(`generated ${variant} opens the approved icon and local video path`, async ({page}) => {
    await openApp(page,variant);
    await expect(page.locator('#versionBadge')).toHaveText('v1.0.1');
    await expect(page.locator('.local-badge')).toContainText('完全ローカル処理');
    const icon=await page.locator('#appBrandIcon').getAttribute('src');
    const favicon=await page.locator('link[rel="icon"]').getAttribute('href');
    expect(icon).toBe(favicon); expect(icon.startsWith('data:image/svg+xml')).toBe(true);
    await selectFixtureVideo(page); await expect(page.locator('#playButton')).toBeEnabled();
  });
}
