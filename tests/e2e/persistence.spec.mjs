import {test,expect} from '@playwright/test';
import {openHttpApp,selectFixtureVideo,seekVideo} from '../helpers/app.mjs';

test('autosave appears only after a successful transaction and restores analysis without video',async({page})=>{
 await openHttpApp(page);await selectFixtureVideo(page);await page.locator('#startCycleButton').click();await seekVideo(page,.5);await page.locator('#markBoundaryButton').click();
 await expect(page.locator('#autosaveStatus')).toContainText('自動保存済み',{timeout:5000});
 await page.reload();await page.locator('#versionBadge').waitFor();await expect(page.locator('#restoreCard')).toBeVisible();
 await page.locator('#restoreAnalysisButton').click();await expect(page.locator('#cycleList .cycle-row')).toHaveCount(1);await page.locator('.workspace-switch [data-page="results"]').click();await expect(page.locator('#reconnectOriginalButton')).toBeVisible();await expect(page.locator('video')).toHaveCount(0);
});

test('autosave can be disabled before editing and manual save remains available',async({page})=>{
 await openHttpApp(page);await page.locator('#autosaveToggle').uncheck();await selectFixtureVideo(page);await page.locator('#startCycleButton').click();
 await page.waitForTimeout(1100);await page.reload();await page.locator('#versionBadge').waitFor();await expect(page.locator('#restoreCard')).toBeHidden();
});

test('storage failure is explicit and does not block manual JSON download',async({page})=>{
 await page.addInitScript(()=>{Object.defineProperty(window,'indexedDB',{configurable:true,value:{open(){throw new Error('blocked')}}});});
 await openHttpApp(page);await expect(page.locator('#autosaveStatus')).toContainText('自動保存できません');
 await selectFixtureVideo(page);await page.locator('#startCycleButton').click();await page.locator('.workspace-switch [data-page="results"]').click();
 const pending=page.waitForEvent('download');await page.locator('#saveAnalysisButton').click();await pending;await expect(page.locator('#saveStatus')).toContainText('ダウンロードを開始しました');
});

test('clearing browser analysis cancels an already queued delayed save',async({page})=>{
 await openHttpApp(page);await selectFixtureVideo(page);await page.locator('#startCycleButton').click();await page.locator('.workspace-switch [data-page="results"]').click();
 await page.locator('#clearBrowserDataButton').click();await page.locator('#appConfirmOk').click();await expect(page.locator('#autosaveStatus')).toContainText('削除');
 await page.waitForTimeout(1200);await page.reload();await page.locator('#versionBadge').waitFor();await expect(page.locator('#restoreCard')).toBeHidden();
});
