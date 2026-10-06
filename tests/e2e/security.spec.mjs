import { test, expect } from '@playwright/test';
import { readFile } from 'node:fs/promises';
import { openApp, selectFixtureVideo, measureFirstCycle } from '../helpers/app.mjs';

test('hostile labels remain text and prototype-key import is rejected without replacing analysis', async ({page}) => {
  const requests=[]; page.on('request',r=>{if(/^https?:/.test(r.url()))requests.push(r.url());});
  await openApp(page); await selectFixtureVideo(page); await measureFirstCycle(page);await page.locator('.workspace-switch [data-page="review"]').click();
  const hostile='<img src=https://example.invalid/pixel onerror=alert(1)>';
  await page.locator('#phaseList .phase-name').first().fill(hostile); await page.locator('#phaseList .phase-name').first().press('Tab');
  await expect(page.locator('#phaseList img')).toHaveCount(0);
  await page.locator('.workspace-switch [data-page="results"]').click();const pending=page.waitForEvent('download'); await page.locator('#saveAnalysisButton').click(); const download=await pending;
  const saved=JSON.parse(await readFile(await download.path(),'utf8'));
  const polluted=JSON.stringify({...saved,__proto__:undefined}).replace(/^{/, '{"__proto__":{"polluted":true},');
  await page.locator('#analysisInput').setInputFiles({name:'hostile.tsd.json',mimeType:'application/json',buffer:Buffer.from(polluted)});
  await expect(page.locator('#errorMessage')).toBeVisible();
  await page.locator('.workspace-switch [data-page="review"]').click();await expect(page.locator('#phaseList .phase-name').first()).toHaveValue(hostile);
  expect(requests).toEqual([]);
  expect(await page.evaluate(()=>({}).polluted)).toBeUndefined();
});
