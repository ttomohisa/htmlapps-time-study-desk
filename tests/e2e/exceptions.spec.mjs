import {test,expect} from '@playwright/test';
import {readFile} from 'node:fs/promises';
import {openApp,selectFixtureVideo,seekVideo} from '../helpers/app.mjs';
async function prepare(page,names='準備\n確認') {
 await page.locator('#predefineButton').click();await page.locator('#presetNames').fill(names);await page.locator('#saveProcedureButton').click();await page.locator('#startCycleButton').click();
}
async function saved(page){const wait=page.waitForEvent('download');await page.locator('#saveAnalysisButton').click();return JSON.parse(await readFile(await (await wait).path(),'utf8'));}
for(const variant of ['readable','self-extract'])test(`interruption and missing observation retain exact spans: ${variant}`,async({page})=>{
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await openApp(page,variant);await selectFixtureVideo(page);await prepare(page);
 await seekVideo(page,.3);await page.locator('#exceptionsDetails summary').click();await page.locator('#exceptionNote').fill('材料待ち');
 await page.locator('#beginInterruptionButton').click();await expect(page.locator('#exceptionReturnButton')).toHaveText('工程へ戻る');
 await seekVideo(page,.7);await page.locator('#exceptionReturnButton').click();await seekVideo(page,1);await page.locator('#markBoundaryButton').click();
 await seekVideo(page,1.3);await page.locator('#exceptionsDetails summary').click();await page.locator('#beginUnobservedButton').click();await seekVideo(page,1.8);await page.locator('#exceptionReturnButton').click();
 await seekVideo(page,2.2);await page.locator('#markBoundaryButton').click();
 await expect(page.locator('#cycleState')).toHaveText('完了');
 const p=await saved(page),c=p.cycles[0];expect(c.spans.map(s=>s.kind)).toEqual(['phase','interruption','phase','phase','unobserved','phase']);
 expect(c.occurrences.map(o=>o.resolution)).toEqual(['measured','unobserved']);expect(c.spans[0].occurrenceId).toBe(c.spans[2].occurrenceId);
 expect(c.boundaries.map(b=>b.timeUs)).toEqual([0,300000,700000,1000000,1300000,1800000,2200000]);
 await expect(page.locator('#phaseList .phase-duration').last()).toContainText('未観測');expect(errors).toEqual([]);
});
test('skipping final step never invents zero-time work or automatic completion',async({page})=>{
 await openApp(page);await selectFixtureVideo(page);await prepare(page);
 await seekVideo(page,.5);await page.locator('#markBoundaryButton').click();await page.locator('#exceptionsDetails summary').click();await page.locator('#skipOccurrenceButton').click();
 await expect(page.locator('#cycleState')).toHaveText('未完了');await page.locator('.workspace-switch [data-page="review"]').click();
 await page.locator('#completeReviewedButton').click();await expect(page.locator('#cycleState')).toHaveText('完了');
 const c=(await saved(page)).cycles[0];expect(c.spans).toHaveLength(1);expect(c.occurrences[1].resolution).toBe('not-performed');expect(c.boundaries.map(b=>b.timeUs)).toEqual([0,500000]);
});
test('video-end exception is kept incomplete and can be explicitly resolved',async({page})=>{
 await openApp(page);await selectFixtureVideo(page);await prepare(page,'確認');
 await seekVideo(page,.5);await page.locator('#exceptionsDetails summary').click();await page.locator('#beginInterruptionButton').click();
 await seekVideo(page,3.8);await page.locator('#playButton').click();await expect(page.locator('#cycleState')).toHaveText('未完了');
 await page.locator('.workspace-switch [data-page="review"]').click();
 await page.locator('#phaseList .resolution-details summary').first().click();await page.locator('#phaseList .occurrence-resolution').first().selectOption('measured');await page.locator('#phaseList .apply-resolution').first().click();
 await expect(page.locator('#completeReviewedButton')).toBeEnabled();await page.locator('#completeReviewedButton').click();
 const c=(await saved(page)).cycles[0];expect(c.status).toBe('complete');expect(c.spans.map(s=>s.kind)).toEqual(['phase','interruption']);expect(c.boundaries).toHaveLength(3);
});
