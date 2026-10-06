import {test,expect} from '@playwright/test';
import {openApp,selectFixtureVideo,measureFirstCycle} from '../helpers/app.mjs';
import {makeFixture} from '../helpers/fixtures.mjs';

test('failed download reports an analysis-save error and keeps the measured record',async ({page})=>{
 await openApp(page);await selectFixtureVideo(page);await measureFirstCycle(page);
 await page.evaluate(()=>{URL.createObjectURL=()=>{throw new DOMException('Denied','SecurityError');};});
 await page.locator('#saveAnalysisButton').click();
 await expect(page.locator('#saveStatus')).toContainText('分析データを保存できませんでした');
 await expect(page.locator('#errorMessage')).toContainText('分析データを保存できませんでした');
 await expect(page.locator('#cycleState')).toHaveText('完了');await expect(page.locator('#phaseList .phase-row')).toHaveCount(4);
});

test('failed CSV handoff reports an export error and preserves the result table',async({page})=>{
 await openApp(page);await page.locator('#analysisInput').setInputFiles({name:'F1.tsd.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(makeFixture('F1')))});
 await page.evaluate(()=>{URL.createObjectURL=()=>{throw new DOMException('Denied','SecurityError');};});
 await page.locator('#exportTimeTableCsvButton').click();
 await expect(page.locator('#csvStatus')).toContainText('CSVを保存できませんでした');
 await expect(page.locator('#errorMessage')).toContainText('CSVを保存できませんでした');
 await expect(page.locator('#timeTableRows > [data-cycle-id]')).toHaveCount(3);
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
