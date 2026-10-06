import {test,expect} from '@playwright/test';
import {readFile} from 'node:fs/promises';
import {openApp,selectFixtureVideo,measureFirstCycle} from '../helpers/app.mjs';
async function start(page,variant='readable'){await openApp(page,variant);await selectFixtureVideo(page);await measureFirstCycle(page);await page.locator('.workspace-switch [data-page="review"]').click();await page.locator('#intervalDetails > summary').click();}
for(const variant of ['readable','self-extract'])test(`split merge reassign and delete are reversible: ${variant}`,async({page})=>{
 await start(page,variant);await page.locator('#spanSelect').selectOption({index:0});await page.locator('#splitTime').fill('0.3');await page.locator('#splitSpanButton').click();await expect(page.locator('#spanSelect option')).toHaveCount(5);
 await page.locator('#mergeSpanButton').click();await expect(page.locator('#spanSelect option')).toHaveCount(4);await expect(page.locator('#cycleDuration')).toHaveText('3.4 秒');
 await page.locator('#spanKind').selectOption('unobserved');await page.locator('#assignSpanButton').click();await expect(page.locator('#phaseList .phase-duration').first()).toContainText('未観測');
 await page.locator('#undoButton').click();await expect(page.locator('#phaseList .phase-duration').first()).toHaveText('0.6 秒');
 await page.locator('#deleteCycleButton').click();await expect(page.locator('#cycleList .cycle-row')).toHaveCount(0);
 await page.locator('#appToastAction').click();await expect(page.locator('#cycleList .cycle-row')).toHaveCount(1);
 await expect(page.locator('#cycleDuration')).toHaveText('3.4 秒');
});
test('merging different assignments requires explicit confirmation and preserves time',async({page})=>{
 await start(page);await page.locator('#spanSelect').selectOption({index:0});await page.locator('#mergeSpanButton').click();
 await expect(page.locator('#appConfirmDialog')).toBeVisible();await page.locator('#appConfirmCancel').click();await expect(page.locator('#spanSelect option')).toHaveCount(4);
 await page.locator('#mergeSpanButton').click();await page.locator('#appConfirmOk').click();await expect(page.locator('#spanSelect option')).toHaveCount(3);
 await expect(page.locator('#cycleState')).toHaveText('未完了');await expect(page.locator('#cycleDuration')).toHaveText('3.4 秒');
 await expect(page.locator('#completeReviewedButton')).toBeDisabled();
});
test('adding a rework occurrence does not modify the saved procedure',async({page})=>{
 await start(page);await page.locator('#occurrenceTools summary').click();await page.locator('#insertOccurrenceButton').click();
 await expect(page.locator('#phaseList .phase-row')).toHaveCount(5);await expect(page.locator('#cycleState')).toHaveText('未完了');
 await page.locator('.workspace-switch [data-page="results"]').click();const waiting=page.waitForEvent('download');await page.locator('#saveAnalysisButton').click();const p=JSON.parse(await readFile(await (await waiting).path(),'utf8'));
 expect(p.procedures[0].phaseIds).toHaveLength(4);expect(p.cycles[0].occurrences.at(-1).planned).toBe(false);
 await page.locator('#undoButton').click();await expect(page.locator('#cycleState')).toHaveText('完了');await expect(page.locator('#phaseList .phase-row')).toHaveCount(4);
});
for(const lang of ['ja','en'])test(`phone advanced editing keeps fields and dialog within viewport: ${lang}`,async({page})=>{
 await page.setViewportSize({width:320,height:740});await start(page);if(lang==='en')await page.locator('#languageButton').click();
 for(const id of ['spanSelect','spanKind','splitTime','assignSpanButton']) {await page.locator('#'+id).scrollIntoViewIfNeeded();expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);}
 await page.locator('#spanSelect').selectOption({index:0});await page.locator('#mergeSpanButton').click();
 const rect=await page.locator('#appConfirmDialog').boundingBox();expect(rect.width).toBeLessThanOrEqual(320);
 await page.locator('#appConfirmCancel').click();
});

test('unchanged assignment does not offer Undo for an earlier operation',async({page})=>{
 await start(page);await page.locator('#spanSelect').selectOption({index:0});
 await page.locator('#assignSpanButton').click();
 expect(await page.locator('#appToast').getAttribute('class')).not.toMatch(/\bshow\b/);
 await expect(page.locator('#cycleState')).toHaveText('完了');
});
