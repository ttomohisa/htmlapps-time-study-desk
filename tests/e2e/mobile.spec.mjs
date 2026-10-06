import { test, expect } from '@playwright/test';
import { openApp, selectFixtureVideo } from '../helpers/app.mjs';
for (const width of [320, 360, 390, 430, 768, 1360]) {
  test(`no horizontal overflow, portrait contained, help reachable: ${width}px`, async ({page}) => {
    await page.setViewportSize({width, height: 740});
    await openApp(page); await selectFixtureVideo(page, 'portrait.mp4');
    await expect(page.locator('#playButton')).toBeEnabled();
    for (const language of ['ja', 'en']) {
      if (language === 'en') await page.locator('#languageButton').click();
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
      const button = await page.locator('#playButton').boundingBox(); expect(button.height).toBeGreaterThanOrEqual(48);
      await page.locator('#helpButton').click();
      await page.locator('#helpDialog .dialog-note').scrollIntoViewIfNeeded();
      await expect(page.locator('#helpDialog .dialog-note')).toBeInViewport();
      await page.keyboard.press('Escape'); await expect(page.locator('#helpButton')).toBeFocused();
    }
  });
}
test('short landscape viewport keeps help scrollable and player controls usable', async ({page}) => {
  await page.setViewportSize({width: 640, height: 360}); await openApp(page); await selectFixtureVideo(page);
  await expect(page.locator('#playButton')).toBeEnabled();
  await page.locator('#playButton').scrollIntoViewIfNeeded(); await expect(page.locator('#playButton')).toBeInViewport();
  await page.locator('#helpButton').click(); await page.locator('#helpDialog .dialog-note').scrollIntoViewIfNeeded();
  await expect(page.locator('#helpDialog .dialog-note')).toBeInViewport();
  await page.locator('#closeHelpButton').click(); await expect(page.locator('#helpButton')).toBeFocused();
});

test('mobile_primary_flow_never_hides_controls',async({page})=>{
  for(const width of [320,360,390,430]){
    await page.setViewportSize({width,height:568});await openApp(page);await selectFixtureVideo(page,'portrait.mp4');
    await page.locator('#startCycleButton').click();await page.evaluate(()=>window.scrollTo(0,0));
    const primary=await page.locator('#finishCycleButton').boundingBox(),tabs=await page.locator('.mobile-tabs').boundingBox();
    expect(primary.y).toBeGreaterThanOrEqual(0);expect(primary.y+primary.height).toBeLessThanOrEqual(tabs.y);
    expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
    for(const name of ['review','results','measure']){
      await page.locator(`.mobile-tabs [data-page="${name}"]`).click();
      expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
    }
  }
});
