import {test,expect} from '@playwright/test';
import {readFile} from 'node:fs/promises';
import {resolve} from 'node:path';
import {openApp,selectFixtureVideo,measureFirstCycle} from '../helpers/app.mjs';

async function saveOne(page){
 await selectFixtureVideo(page);await measureFirstCycle(page);await page.locator('.workspace-switch [data-page="results"]').click();
 const pending=page.waitForEvent('download');await page.locator('#saveAnalysisButton').click();return await pending;
}

test('saved analysis reopens detached, then reconnects only after metadata check and confirmation',async({page})=>{
 await openApp(page);const download=await saveOne(page);const path=await download.path();
 await page.reload();await page.locator('#versionBadge').waitFor();
 await page.locator('#analysisInput').setInputFiles(path);
 await expect(page.locator('#cycleList .cycle-row')).toHaveCount(1);
 await page.locator('.workspace-switch [data-page="results"]').click();await expect(page.locator('#reconnectOriginalButton')).toBeVisible();await expect(page.locator('#playButton')).toBeDisabled();
 await page.locator('#reconnectVideoInput').setInputFiles(resolve('tests/fixtures/media/landscape.mp4'));
 await expect(page.locator('#appConfirmDialog')).toBeVisible();await page.locator('#appConfirmOk').click();
 await expect(page.locator('video')).toBeVisible();await expect(page.locator('#reconnectOriginalButton')).toBeHidden();
 expect(await page.locator('video').evaluate(v=>v.paused)).toBe(true);
});

test('invalid analysis and mismatched reconnect candidate preserve the current analysis',async({page})=>{
 await openApp(page);await selectFixtureVideo(page);await measureFirstCycle(page);
 await page.locator('#analysisInput').setInputFiles({name:'bad.tsd.json',mimeType:'application/json',buffer:Buffer.from('{"schemaVersion":999}')});
 await expect(page.locator('#errorMessage')).toBeVisible();await page.locator('.workspace-switch [data-page="results"]').click();await expect(page.locator('#cycleList .cycle-row')).toHaveCount(1);await expect(page.locator('video')).toBeVisible();
 const pending=page.waitForEvent('download');await page.locator('#saveAnalysisButton').click();const d=await pending;const path=await d.path();
 await page.reload();await page.locator('#versionBadge').waitFor();await page.locator('#analysisInput').setInputFiles(path);await page.locator('.workspace-switch [data-page="results"]').click();
 await page.locator('#reconnectVideoInput').setInputFiles(resolve('tests/fixtures/media/portrait.mp4'));
 await expect(page.locator('#sourceMatchError')).toBeVisible();await expect(page.locator('video')).toHaveCount(0);await expect(page.locator('#cycleList .cycle-row')).toHaveCount(1);
});

test('same bytes under a changed filename warn but can reconnect after explicit confirmation',async({page})=>{
 await openApp(page);const download=await saveOne(page);const path=await download.path();const bytes=await readFile(resolve('tests/fixtures/media/landscape.mp4'));
 await page.reload();await page.locator('#versionBadge').waitFor();await page.locator('#analysisInput').setInputFiles(path);await page.locator('.workspace-switch [data-page="results"]').click();
 await page.locator('#reconnectVideoInput').setInputFiles({name:'renamed-copy.mp4',mimeType:'video/mp4',buffer:bytes});
 await expect(page.locator('#appConfirmMessage')).toContainText('ファイル名');await page.locator('#appConfirmOk').click();await expect(page.locator('video')).toBeVisible();
});
