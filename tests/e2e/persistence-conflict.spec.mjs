import {resolve} from 'node:path';
import {test,expect} from '@playwright/test';
import {openHttpApp,selectFixtureVideo} from '../helpers/app.mjs';

test('stale tab cannot overwrite a newer revision and keeps manual export available',async({page,context})=>{
 await openHttpApp(page);await selectFixtureVideo(page);await page.locator('#startCycleButton').click();await expect(page.locator('#autosaveStatus')).toContainText('自動保存済み',{timeout:5000});
 const other=await context.newPage();await openHttpApp(other);await expect(other.locator('#restoreCard')).toBeVisible();await other.locator('#restoreAnalysisButton').click();await other.locator('.workspace-switch [data-page="results"]').click();
 await page.locator('.workspace-switch [data-page="results"]').click();await page.locator('#projectTitle').fill('newer');await page.locator('#projectTitle').press('Tab');await expect(page.locator('#autosaveStatus')).toContainText('自動保存済み',{timeout:5000});
 await other.locator('#projectTitle').fill('stale');await other.locator('#projectTitle').press('Tab');await expect(other.locator('#autosaveStatus')).toContainText('別タブ',{timeout:5000});await expect(other.locator('#saveAnalysisButton')).toBeEnabled();
 await other.locator('#analysisInput').setInputFiles(resolve('tests/fixtures/v0.2.0-first-cycle.tsd.json'));await other.locator('#appConfirmOk').click();await expect(other.locator('#autosaveStatus')).toHaveAttribute('data-state','default');await expect(other.locator('#autosaveStatus')).not.toContainText('別タブ');
 await other.reload();await other.locator('#versionBadge').waitFor();await other.locator('#restoreAnalysisButton').click();await other.locator('.workspace-switch [data-page="results"]').click();await expect(other.locator('#projectTitle')).toHaveValue('newer');
});
