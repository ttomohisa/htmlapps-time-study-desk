import {test,expect} from '@playwright/test';
import {readFile} from 'node:fs/promises';
import {openApp,selectFixtureVideo,seekVideo} from '../helpers/app.mjs';
export async function firstTwo(page) {
 await page.locator('#startCycleButton').click();await seekVideo(page,.4);await page.locator('#markBoundaryButton').click();await seekVideo(page,.8);await page.locator('#finishCycleButton').click();
}
for (const variant of ['readable','self-extract']) test(`three cycles without renamed steps or automatic starts: ${variant}`,async({page})=>{
 await openApp(page,variant);await selectFixtureVideo(page);await firstTwo(page);
 for(const start of [1,2]) {
  await page.locator('.workspace-switch [data-page="measure"]').click();await seekVideo(page,start);await page.locator('#startCycleButton').click();
  await expect(page.locator('#measureTitle')).toContainText(`${start+1}回目`);
  await seekVideo(page,start+.4);await page.locator('#markBoundaryButton').click();
  await expect(page.locator('#markBoundaryButton')).toHaveText('この回を終了');
  await seekVideo(page,start+.8);await page.locator('#markBoundaryButton').click();await expect(page.locator('#cycleState')).toHaveText('完了');
 }
 await page.locator('.workspace-switch [data-page="review"]').click();
 await expect(page.locator('#cycleList .cycle-row')).toHaveCount(3);
 await expect(page.locator('#cycleSelect option')).toHaveCount(3);
 await page.locator('#cycleSelect').selectOption({index:0});await expect(page.locator('#cycleDuration')).toHaveText('0.8 秒');
 await page.locator('.workspace-switch [data-page="results"]').click();const pending=page.waitForEvent('download');await page.locator('#saveAnalysisButton').click();const d=await pending;
 const p=JSON.parse(await readFile(await d.path(),'utf8'));expect(p.phases).toHaveLength(2);expect(p.procedures).toHaveLength(1);expect(p.cycles).toHaveLength(3);expect(p.cycles.every(c=>c.status==='complete')).toBe(true);
 expect(p.cycles.map(c=>c.boundaries.map(b=>b.timeUs))).toEqual([[0,400000,800000],[1000000,1400000,1800000],[2000000,2400000,2800000]]);
});
test('reviewing an old cycle never sends a measurement or video-end event to it',async({page})=>{
 await openApp(page);await selectFixtureVideo(page);await firstTwo(page);
 await page.locator('.workspace-switch [data-page="measure"]').click();await seekVideo(page,1);await page.locator('#startCycleButton').click();
 await page.locator('.workspace-switch [data-page="review"]').click();await page.locator('#cycleSelect').selectOption({index:0});
 await page.locator('.workspace-switch [data-page="measure"]').click();await expect(page.locator('#measureTitle')).toContainText('2回目');
 await seekVideo(page,1.4);await page.locator('#markBoundaryButton').click();await seekVideo(page,3.8);await page.locator('#playButton').click();
 await expect(page.locator('#cycleState')).toHaveText('未完了');await page.locator('.workspace-switch [data-page="review"]').click();await page.locator('#cycleSelect').selectOption({index:0});
 await expect(page.locator('#cycleDuration')).toHaveText('0.8 秒');await expect(page.locator('#cycleState')).toHaveText('完了');
});
test('long current and next step names do not push phone measurement controls under navigation',async({page})=>{
 await page.setViewportSize({width:320,height:740});await openApp(page);await selectFixtureVideo(page);
 await page.locator('#predefineButton').click();await page.locator('#presetNames').fill('長い工程名'.repeat(16)+'\n'+'次の工程名'.repeat(16));await page.locator('#saveProcedureButton').click();await page.locator('#startCycleButton').click();
 await page.evaluate(()=>window.scrollTo(0,0));const button=await page.locator('#markBoundaryButton').boundingBox(),tabs=await page.locator('.mobile-tabs').boundingBox();
 expect(button.y+button.height).toBeLessThanOrEqual(tabs.y);expect(await page.locator('#currentStep').getAttribute('title')).toBe('長い工程名'.repeat(16));
});
