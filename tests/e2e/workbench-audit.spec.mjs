import {test,expect} from '@playwright/test';
import {openApp,selectFixtureVideo,measureFirstCycle} from '../helpers/app.mjs';

test('leaving evidence review for Measure pauses any range playback',async({page})=>{
  await openApp(page);await selectFixtureVideo(page);await measureFirstCycle(page);
  await page.locator('.workspace-switch [data-page="results"]').click();
  await page.locator('#timeTableRows .cycle-total-evidence').first().click();
  await expect(page.locator('#evidenceReviewCard')).toBeVisible();
  await page.locator('#playEvidenceButton').click();
  await expect.poll(()=>page.locator('video').evaluate(v=>v.paused)).toBe(false);
  await page.locator('.workspace-switch [data-page="measure"]').click();
  await expect.poll(()=>page.locator('video').evaluate(v=>v.paused)).toBe(true);
});

for(const [width,height] of [[980,700],[981,700],[1024,600]]){
  test(`workbench breakpoint ${width}x${height} has no overflow and keeps primary controls reachable`,async({page})=>{
    await page.setViewportSize({width,height});await openApp(page);await selectFixtureVideo(page);await measureFirstCycle(page);
    expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);

    await page.locator(width<=600?'.mobile-tabs [data-page="review"]':'.workspace-switch [data-page="review"]').click();
    expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
    await page.locator('#cycleSelect').scrollIntoViewIfNeeded();await expect(page.locator('#cycleSelect')).toBeInViewport();

    await page.locator(width<=600?'.mobile-tabs [data-page="results"]':'.workspace-switch [data-page="results"]').click();
    expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
    await page.locator('#saveAnalysisButton').scrollIntoViewIfNeeded();await expect(page.locator('#saveAnalysisButton')).toBeInViewport();
  });
}

test('desktop-to-phone resize preserves the active Results screen without overflow',async({page})=>{
  await page.setViewportSize({width:1440,height:900});await openApp(page);await selectFixtureVideo(page);await measureFirstCycle(page);
  await page.locator('.workspace-switch [data-page="results"]').click();
  await page.setViewportSize({width:390,height:844});
  await expect(page.locator('body')).toHaveAttribute('data-current-page','results');
  await expect(page.locator('.mobile-tabs [data-page="results"]')).toHaveAttribute('aria-current','page');
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  await page.setViewportSize({width:1440,height:900});
  await expect(page.locator('body')).toHaveAttribute('data-current-page','results');
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
});
