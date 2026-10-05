import {test,expect} from '@playwright/test';
import {openApp,selectFixtureVideo,seekVideo,measureFirstCycle} from '../helpers/app.mjs';
for (const variant of ['readable','self-extract']) {
  test(`four steps, shared boundary edits and Undo/Redo: ${variant}`,async ({page})=>{
    await openApp(page,variant); await selectFixtureVideo(page); await measureFirstCycle(page);
    await expect(page.locator('#cycleState')).toHaveText('完了');
    await expect(page.locator('#phaseList .phase-row')).toHaveCount(4);
    await expect(page.locator('#cycleDuration')).toHaveText('3.4 秒');
    await page.locator('#boundarySelect').selectOption({index:1});
    await page.locator('#boundaryTime').fill('0.7'); await page.locator('#applyBoundaryButton').click();
    await expect(page.locator('#phaseList .phase-duration').nth(0)).toHaveText('0.7 秒');
    await expect(page.locator('#phaseList .phase-duration').nth(1)).toHaveText('1.1 秒');
    await page.locator('#undoButton').click(); await expect(page.locator('#boundaryTime')).toHaveValue('0.6');
    await page.locator('#redoButton').click(); await expect(page.locator('#boundaryTime')).toHaveValue('0.7');
    await page.locator('#boundaryTime').fill('1.8'); await page.locator('#applyBoundaryButton').click();
    await expect(page.locator('#boundaryError')).toBeVisible();
    await expect(page.locator('#cycleDuration')).toHaveText('3.4 秒');
    expect(await page.locator('video').evaluate(v=>v.paused)).toBe(true);
  });
}
test('marking cannot happen while seeking, before a boundary, or from a repeated key',async ({page})=>{
  await openApp(page); await selectFixtureVideo(page); await page.locator('#startCycleButton').click();
  await expect(page.locator('#markBoundaryButton')).toBeDisabled();
  await seekVideo(page,.6); await page.locator('#markBoundaryButton').click();
  await seekVideo(page,.2); await expect(page.locator('#markBoundaryButton')).toBeDisabled();
  await expect(page.locator('#measurementHint')).toContainText('前の区切り');
  await seekVideo(page,1); await page.locator('#markBoundaryButton').focus();
  await page.keyboard.press('Space');
  expect(await page.locator('video').evaluate(v=>v.paused)).toBe(true);
  await expect(page.locator('#phaseList .phase-row')).toHaveCount(3);
});
test('video end retains an incomplete cycle; saving does not invent completion',async ({page})=>{
  await openApp(page); await selectFixtureVideo(page); await page.locator('#startCycleButton').click();
  await seekVideo(page,3.8); await page.locator('#playButton').click();
  await expect(page.locator('#cycleState')).toHaveText('未完了');
  await expect(page.locator('#saveAnalysisButton')).toBeEnabled();
  await expect(page.locator('#resumeCycleButton')).toBeVisible();
});
test('phone tabs keep primary work usable without horizontal overflow',async ({page})=>{
  await page.setViewportSize({width:320,height:740}); await openApp(page); await selectFixtureVideo(page);
  await measureFirstCycle(page);
  for (const language of ['ja','en']) {
    if(language==='en') await page.locator('#languageButton').click();
    for (const tab of ['measure','review','results']) {
      await page.locator(`.mobile-tabs [data-page="${tab}"]`).click();
      expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
    }
    await expect(page.locator('#saveAnalysisButton')).toBeVisible();
    await page.locator('.mobile-tabs [data-page="review"]').click();
    await expect(page.locator('#applyBoundaryButton')).toBeVisible();
  }
});
for (const width of [320,390]) {
 test(`primary measurement buttons fit above phone navigation without scrolling: ${width}`,async ({page})=>{
  await page.setViewportSize({width,height:740});await openApp(page);await selectFixtureVideo(page);await page.locator('#startCycleButton').click();
  await page.evaluate(()=>window.scrollTo(0,0));
  const button=await page.locator('#finishCycleButton').boundingBox(), tabs=await page.locator('.mobile-tabs').boundingBox();
  expect(button.y).toBeGreaterThanOrEqual(0);expect(button.y+button.height).toBeLessThanOrEqual(tabs.y);
  const video=await page.locator('video').boundingBox();expect(video.y).toBeGreaterThanOrEqual(0);
 });
}
test('visibility transition simulation enables explicit resume when returning',async ({page})=>{
 await openApp(page);await selectFixtureVideo(page);await page.locator('#startCycleButton').click();await seekVideo(page,1);await page.locator('#markBoundaryButton').click();await seekVideo(page,2);
 await page.evaluate(()=>{Object.defineProperty(document,'hidden',{configurable:true,value:true});document.dispatchEvent(new Event('visibilitychange'));});
 await expect(page.locator('#resumeCycleButton')).toBeDisabled();
 await page.evaluate(()=>{Object.defineProperty(document,'hidden',{configurable:true,value:false});document.dispatchEvent(new Event('visibilitychange'));});
 await expect(page.locator('#resumeCycleButton')).toBeEnabled();await page.locator('#resumeCycleButton').click();
 await expect(page.locator('#position')).toHaveText('00:01.0');await expect(page.locator('#phaseList .phase-row')).toHaveCount(2);
 expect(await page.locator('video').evaluate(v=>v.paused)).toBe(true);
});
