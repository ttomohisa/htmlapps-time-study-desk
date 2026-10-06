import {test,expect} from '@playwright/test';
import {openApp,selectFixtureVideo,seekVideo} from '../helpers/app.mjs';

test('background_does_not_insert_interruption and announces the paused state without autoplay',async({page})=>{
  await openApp(page);await selectFixtureVideo(page);await page.locator('#startCycleButton').click();await seekVideo(page,1);await page.locator('#markBoundaryButton').click();
  const before=await page.locator('#recordBreakdown').textContent();
  await page.evaluate(()=>{Object.defineProperty(document,'hidden',{configurable:true,value:true});document.dispatchEvent(new Event('visibilitychange'));});
  await expect(page.locator('#backgroundNotice')).toBeVisible();
  await expect(page.locator('#backgroundNotice')).toHaveAttribute('role','status');
  await expect(page.locator('#backgroundNotice')).toHaveAttribute('aria-live','polite');
  expect(await page.locator('video').evaluate(v=>v.paused)).toBe(true);
  await page.evaluate(()=>{Object.defineProperty(document,'hidden',{configurable:true,value:false});document.dispatchEvent(new Event('visibilitychange'));});
  await expect(page.locator('#recordBreakdown')).toHaveText(before);
  await expect(page.locator('#resumeCycleButton')).toBeEnabled();
  expect(await page.locator('video').evaluate(v=>v.paused)).toBe(true);
});
