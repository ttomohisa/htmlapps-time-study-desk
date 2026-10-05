import {test,expect} from '@playwright/test';
import {mkdir} from 'node:fs/promises';
import {openApp,selectFixtureVideo,seekVideo} from '../helpers/app.mjs';
test('capture actual repeated-cycle UI using synthetic non-personal media',async({page})=>{
 await mkdir('test-results/screenshots',{recursive:true});
 await openApp(page);await selectFixtureVideo(page);
 await page.locator('#startCycleButton').click();await seekVideo(page,.4);await page.locator('#markBoundaryButton').click();await seekVideo(page,.8);await page.locator('#finishCycleButton').click();
 for(const start of [1,2]){
  await page.locator('.workspace-switch [data-page="measure"]').click();await seekVideo(page,start);await page.locator('#startCycleButton').click();await seekVideo(page,start+.4);await page.locator('#markBoundaryButton').click();await seekVideo(page,start+.8);await page.locator('#markBoundaryButton').click();
 }
 await page.locator('#phaseList .phase-name').first().fill('準備');await page.locator('#phaseList .phase-name').first().press('Tab');
 await page.locator('#phaseList .phase-name').nth(1).fill('確認');await page.locator('#phaseList .phase-name').nth(1).press('Tab');
 await page.locator('#boundarySelect').selectOption({index:1});await page.evaluate(()=>window.scrollTo(0,0));
 await page.screenshot({path:'test-results/screenshots/screenshot.png'});
 await page.locator('#languageButton').click();await page.evaluate(()=>window.scrollTo(0,0));await page.screenshot({path:'test-results/screenshots/screenshot-en.png'});
 await page.locator('#languageButton').click();await page.setViewportSize({width:390,height:844});
 await page.locator('.mobile-tabs [data-page="review"]').click();await page.screenshot({path:'test-results/screenshots/screenshot-mobile.png'});
 await page.locator('.mobile-tabs [data-page="results"]').click();await page.screenshot({path:'test-results/screenshots/screenshot-mobile-results.png'});
 await page.locator('.mobile-tabs [data-page="measure"]').click();await page.screenshot({path:'test-results/screenshots/screenshot-mobile-measure.png'});
 await expect(page.locator('#cycleList .cycle-row')).toHaveCount(3);
});
