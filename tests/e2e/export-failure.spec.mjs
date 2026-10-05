import {test,expect} from '@playwright/test';
import {openApp,selectFixtureVideo,measureFirstCycle} from '../helpers/app.mjs';
test('failed download reports an analysis-save error and keeps the measured record',async ({page})=>{
 await openApp(page);await selectFixtureVideo(page);await measureFirstCycle(page);
 await page.evaluate(()=>{URL.createObjectURL=()=>{throw new DOMException('Denied','SecurityError');};});
 await page.locator('#saveAnalysisButton').click();
 await expect(page.locator('#saveStatus')).toContainText('分析データを保存できませんでした');
 await expect(page.locator('#errorMessage')).toContainText('分析データを保存できませんでした');
 await expect(page.locator('#cycleState')).toHaveText('完了');await expect(page.locator('#phaseList .phase-row')).toHaveCount(4);
});
test('a later edit dismisses an older boundary Undo notification',async ({page})=>{
 await openApp(page);await selectFixtureVideo(page);await measureFirstCycle(page);
 await page.locator('#boundarySelect').selectOption({index:1});await page.locator('#boundaryTime').fill('0.7');await page.locator('#applyBoundaryButton').click();
 await expect(page.locator('#appToast')).toHaveClass(/show/);
 const name=page.locator('#phaseList .phase-name').first();await name.fill('準備');await name.press('Tab');
 expect(await page.locator('#appToast').getAttribute('class')).not.toMatch(/\bshow\b/);
});
test('an unchanged boundary does not offer Undo for an earlier command',async ({page})=>{
 await openApp(page);await selectFixtureVideo(page);await measureFirstCycle(page);
 await page.locator('#boundarySelect').selectOption({index:0});await page.locator('#boundaryTime').fill('0');await page.locator('#applyBoundaryButton').click();
 expect(await page.locator('#appToast').getAttribute('class')).not.toMatch(/\bshow\b/);
});
