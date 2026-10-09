import {test,expect} from '@playwright/test';
import {readFile} from 'node:fs/promises';
import {openApp,selectFixtureVideo,measureFirstCycle} from '../helpers/app.mjs';
async function exported(page){await page.locator('.workspace-switch [data-page="results"]').click();const download=page.waitForEvent('download');await page.locator('#saveAnalysisButton').click();return JSON.parse(await readFile(await (await download).path(),'utf8'));}
for(const variant of ['readable','self-extract']){
 test(`${variant}: exact seconds seek pauses at the typed time without editing recorded boundaries`,async({page})=>{
  await openApp(page,variant);await selectFixtureVideo(page);await measureFirstCycle(page);const before=await exported(page);
  await page.locator('.workspace-switch [data-page="review"]').click();await page.locator('#adjustments summary').click();
  await page.locator('#seekTime').fill('1.234567');await page.locator('#seekTime').press('Enter');
  await expect.poll(()=>page.locator('video').evaluate(v=>v.currentTime)).toBeCloseTo(1.234567,5);expect(await page.locator('video').evaluate(v=>v.paused)).toBe(true);
  expect((await exported(page)).cycles).toEqual(before.cycles);
  await page.locator('.workspace-switch [data-page="review"]').click();
  for(const value of ['', '-1','1e2','NaN','Infinity','1:20','4.1','1.0000001']){
   await page.locator('#seekTime').fill(value);await page.locator('#seekTimeButton').click();await expect(page.locator('#seekTimeError')).toBeVisible();await expect(page.locator('#seekTime')).toHaveAttribute('aria-invalid','true');
   expect(await page.locator('video').evaluate(v=>v.currentTime)).toBeCloseTo(1.234567,5);
  }
  expect((await exported(page)).cycles).toEqual(before.cycles);
  await page.locator('.workspace-switch [data-page="review"]').click();
  for(const value of ['0','4']){await page.locator('#seekTime').fill(value);await page.locator('#seekTimeButton').click();await expect.poll(()=>page.locator('video').evaluate(v=>v.currentTime)).toBeCloseTo(Number(value),5);await expect(page.locator('#seekTimeError')).toBeHidden();}
  expect((await exported(page)).cycles).toEqual(before.cycles);
  await page.reload();await page.locator('#versionBadge').waitFor();await expect(page.locator('#seekTimeButton')).toBeDisabled();
 });
}
test('exact seek and destination-language tooltip are localized on a narrow screen',async({page})=>{
 await page.setViewportSize({width:320,height:740});await openApp(page);await selectFixtureVideo(page);await page.locator('#adjustments summary').click();
 await expect(page.locator('#languageButton')).toHaveAttribute('title','英語に切り替え');
 await expect(page.locator('#seekTimeButton')).toHaveText('この位置へ移動');await page.locator('#languageButton').click();
 await expect(page.locator('#languageButton')).toHaveAttribute('title','Switch to Japanese');await expect(page.locator('#seekTimeButton')).toHaveText('Go to position');
 await page.locator('#seekTime').fill('2.5');await page.locator('#seekTime').press('Enter');await expect(page.locator('#position')).toHaveText('00:02.5');
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
});

test('exact seek to the video end leaves an active cycle unchanged',async({page})=>{
 await openApp(page);await selectFixtureVideo(page);await page.locator('#startCycleButton').click();
 const before=await exported(page);await page.locator('.workspace-switch [data-page="review"]').click();await page.locator('#adjustments summary').click();
 await page.locator('#seekTime').fill('4');await page.locator('#seekTime').press('Enter');await expect(page.locator('#mediaStatus')).toHaveAttribute('data-state','ready');
 await expect.poll(()=>page.locator('video').evaluate(v=>v.currentTime)).toBe(4);
 const after=await exported(page);expect(after.cycles).toEqual(before.cycles);expect(after.cycles[0].status).toBe('open');
});
