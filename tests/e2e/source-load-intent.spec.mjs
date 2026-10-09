import {test,expect} from '@playwright/test';
import {readFile} from 'node:fs/promises';
import {resolve} from 'node:path';
import {openApp,selectFixtureVideo,measureFirstCycle} from '../helpers/app.mjs';

async function delayJson(page){
 await page.addInitScript(()=>{
  const read=File.prototype.text;
  File.prototype.text=function(){
   if(this.name!=='slow.tsd.json')return read.call(this);
   return new Promise((resolve,reject)=>{window.__releaseSlowRead=()=>read.call(this).then(resolve,reject);window.__rejectSlowRead=()=>reject(new Error('late read failure'));});
  };
 });
}
async function slowImport(page){await page.locator('#analysisInput').setInputFiles({name:'slow.tsd.json',mimeType:'application/json',buffer:await readFile(resolve('tests/fixtures/v0.2.0-first-cycle.tsd.json'))});await page.waitForFunction(()=>typeof window.__releaseSlowRead==='function');}

test('late analysis read failure cannot display an error after a newer video loads',async({page})=>{
 await delayJson(page);await openApp(page);await slowImport(page);await selectFixtureVideo(page);await expect(page.locator('#mediaStatus')).toHaveAttribute('data-state','ready');
 await page.evaluate(()=>window.__rejectSlowRead());await expect(page.locator('#errorMessage')).toBeHidden();await expect(page.locator('#sourceName')).toHaveText('landscape.mp4');
});
test('a newer JSON choice cancels an outstanding video replacement confirmation',async({page})=>{
 await openApp(page);await selectFixtureVideo(page);await measureFirstCycle(page);
 await selectFixtureVideo(page,'portrait.mp4');await expect(page.locator('#appConfirmDialog')).toBeVisible();
 await page.locator('#analysisInput').setInputFiles({name:'invalid.tsd.json',mimeType:'application/json',buffer:Buffer.from('{}')});
 await expect(page.locator('#appConfirmDialog')).not.toBeVisible();await expect(page.locator('#loadingNotice')).toBeHidden();await expect(page.locator('#errorMessage')).toBeVisible();
 await expect(page.locator('#sourceName')).toHaveText('landscape.mp4');await expect(page.locator('#cycleList .cycle-row')).toHaveCount(1);
 await selectFixtureVideo(page,'portrait.mp4');await page.locator('#appConfirmCancel').click();await expect(page.locator('#sourceName')).toHaveText('landscape.mp4');
});
test('a reconnect attempt supersedes an older pending analysis read even if reconnect is canceled',async({page})=>{
 await delayJson(page);await openApp(page);await selectFixtureVideo(page);await measureFirstCycle(page);await page.locator('.workspace-switch [data-page="results"]').click();
 const downloading=page.waitForEvent('download');await page.locator('#saveAnalysisButton').click();const saved=await readFile(await (await downloading).path());
 await page.reload();await page.locator('#versionBadge').waitFor();await page.locator('#analysisInput').setInputFiles({name:'current.tsd.json',mimeType:'application/json',buffer:saved});
 await slowImport(page);await page.locator('#reconnectVideoInput').setInputFiles(resolve('tests/fixtures/media/landscape.mp4'));
 await expect(page.locator('#appConfirmDialog')).toBeVisible();await page.evaluate(()=>window.__releaseSlowRead());
 await expect(page.locator('#appConfirmTitle')).toContainText('元動画');await page.locator('#appConfirmCancel').click();
 await expect(page.locator('#appConfirmDialog')).not.toBeVisible();await expect(page.locator('#sourceName')).toHaveText('landscape.mp4');await expect(page.locator('#resultOverallMean')).toContainText('3.4');
 await expect(page.locator('video')).toHaveCount(0);
});
