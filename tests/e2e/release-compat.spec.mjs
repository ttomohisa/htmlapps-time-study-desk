import {test,expect} from '@playwright/test';
import {readFile} from 'node:fs/promises';
import {resolve} from 'node:path';
import {openApp} from '../helpers/app.mjs';

// Historical schema-1 data must remain readable even though the appVersion changes.
for(const variant of ['readable','self-extract']) {
 test('v0.2.0 schema-1 JSON imports, exports as v1.0.0, reopens and produces CSV: '+variant,async({page})=>{
  await openApp(page,variant);
  await page.locator('#analysisInput').setInputFiles(resolve('tests/fixtures/v0.2.0-first-cycle.tsd.json'));
  await expect(page.locator('#resultsWorkspace')).toBeVisible();
  await expect(page.locator('#resultRecordedCount')).toHaveText('1');
  await expect(page.locator('#resultIncludedCount')).toHaveText('1');
  await expect(page.locator('#resultOverallMean')).toContainText('34.0');
  await expect(page.locator('#reconnectOriginalButton')).toBeVisible();
  const downloadPromise=page.waitForEvent('download');
  await page.locator('#saveAnalysisButton').click();
  const saved=JSON.parse(await readFile(await (await downloadPromise).path(),'utf8'));
  expect(saved.format).toBe('time-study-desk');
  expect(saved.schemaVersion).toBe(1);
  expect(saved.appVersion).toBe('1.0.0');
  expect(saved.cycles).toHaveLength(1);
  expect(saved.cycles[0].boundaries.map(b=>b.timeUs)).toEqual([0,6000000,18000000,28000000,34000000]);
  expect(JSON.stringify(saved)).not.toMatch(/blob:|"video"|"undo"/);
  await page.reload();await page.locator('#versionBadge').waitFor();
  await page.locator('#analysisInput').setInputFiles({name:'reopened.tsd.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(saved))});
  await expect(page.locator('#resultOverallMean')).toContainText('34.0');
  const csvPromise=page.waitForEvent('download');
  await page.locator('#exportTimeTableCsvButton').click();
  const csv=await readFile(await (await csvPromise).path(),'utf8');
  expect(csv.charCodeAt(0)).toBe(0xfeff);
  expect(csv).toContain('\r\n');
  expect(csv).toContain('"工程1');
  expect(csv).toContain('"完了"');
 });
}