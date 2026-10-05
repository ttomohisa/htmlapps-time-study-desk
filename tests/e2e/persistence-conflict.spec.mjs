import {test,expect} from '@playwright/test';
import {openHttpApp,selectFixtureVideo} from '../helpers/app.mjs';

test('stale tab cannot overwrite a newer revision and keeps manual export available',async({page,context})=>{
 await openHttpApp(page);await selectFixtureVideo(page);await page.locator('#startCycleButton').click();await expect(page.locator('#autosaveStatus')).toContainText('自動保存済み',{timeout:5000});
 const other=await context.newPage();await openHttpApp(other);await expect(other.locator('#restoreCard')).toBeVisible();await other.locator('#restoreAnalysisButton').click();
 await page.locator('#projectTitle').fill('newer');await page.locator('#projectTitle').press('Tab');await expect(page.locator('#autosaveStatus')).toContainText('自動保存済み',{timeout:5000});
 await other.locator('#projectTitle').fill('stale');await other.locator('#projectTitle').press('Tab');await expect(other.locator('#autosaveStatus')).toContainText('別タブ',{timeout:5000});await expect(other.locator('#saveAnalysisButton')).toBeEnabled();
 await other.reload();await other.locator('#versionBadge').waitFor();await other.locator('#restoreAnalysisButton').click();await expect(other.locator('#projectTitle')).toHaveValue('newer');
});
