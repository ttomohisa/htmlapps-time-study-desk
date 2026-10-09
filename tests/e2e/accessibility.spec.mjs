import {test,expect} from '@playwright/test';
import {openApp,selectFixtureVideo,seekVideo,measureFirstCycle} from '../helpers/app.mjs';

test('space_does_not_mark_and_play_together',async({page})=>{
  await openApp(page);await selectFixtureVideo(page);await page.locator('#startCycleButton').click();await seekVideo(page,.6);
  await page.locator('#markBoundaryButton').focus();await page.keyboard.press('Space');
  expect(await page.locator('video').evaluate(v=>v.paused)).toBe(true);
  await expect(page.locator('#phaseList .phase-row')).toHaveCount(2);
});

test('text_undo_is_not_project_undo',async({page})=>{
  await openApp(page);await selectFixtureVideo(page);await page.locator('#startCycleButton').click();await page.locator('.workspace-switch [data-page="results"]').click();await page.locator('#projectTitle').fill('abc');await page.locator('#projectTitle').press('Tab');
  const undoBefore=await page.locator('#undoButton').isEnabled();expect(undoBefore).toBe(true);
  await page.locator('#projectTitle').focus();await page.keyboard.type('def');await page.keyboard.press('Control+z');
  await expect(page.locator('#projectTitle')).toHaveValue('abc');
  expect(await page.locator('#undoButton').isEnabled()).toBe(true);
});

test('help_last_item_is_reachable and focus returns to its trigger',async({page})=>{
  await page.setViewportSize({width:320,height:568});await openApp(page);
  await page.locator('#helpButton').focus();await page.keyboard.press('Enter');
  await page.locator('#helpDialog .dialog-note').scrollIntoViewIfNeeded();await expect(page.locator('#helpDialog .dialog-note')).toBeInViewport();
  await page.keyboard.press('Escape');await expect(page.locator('#helpButton')).toBeFocused();
});

test('mobile navigation exposes controlled panels and 200 percent zoom keeps the page horizontal-scroll free',async({page})=>{
  await page.setViewportSize({width:320,height:640});await openApp(page);await selectFixtureVideo(page);await page.locator('#startCycleButton').click();
  for(const [name,id] of [['measure','measurePanel'],['review','reviewPanel'],['results','resultsWorkspace']]){
    const button=page.locator(`.mobile-tabs [data-page="${name}"]`);
    await expect(button).toHaveAttribute('aria-controls',id);await button.click();await expect(button).toHaveAttribute('aria-current','page');
  }
  await page.evaluate(()=>{document.documentElement.style.zoom='2';});
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
});

test('keyboard_and_safe_area_do_not_cover_dialog_end and save is reachable without a pointer',async({page})=>{
  await page.setViewportSize({width:320,height:568});await openApp(page);await selectFixtureVideo(page);await measureFirstCycle(page);
  await page.locator('.mobile-tabs [data-page="results"]').click();
  await page.locator('#outputFilename').focus();
  let reachedSave=false;
  for(let i=0;i<12;i++){ if(await page.evaluate(()=>document.activeElement?.id)==='saveAnalysisButton'){reachedSave=true;break;} await page.keyboard.press('Tab'); }
  expect(reachedSave).toBe(true);
  await page.locator('#saveAnalysisButton').scrollIntoViewIfNeeded();
  const save=await page.locator('#saveAnalysisButton').boundingBox(),tabs=await page.locator('.mobile-tabs').boundingBox();
  expect(save.y+save.height).toBeLessThanOrEqual(tabs.y);
  expect(await page.evaluate(()=>getComputedStyle(document.documentElement).scrollPaddingBottom)).not.toBe('auto');
  await page.locator('#clearBrowserDataButton').click();await expect(page.locator('#appConfirmDialog')).toBeVisible();
  await page.locator('#appConfirmOk').scrollIntoViewIfNeeded();await expect(page.locator('#appConfirmOk')).toBeInViewport();
  await page.keyboard.press('Escape');await expect(page.locator('#clearBrowserDataButton')).toBeFocused();
});
