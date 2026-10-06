import {test,expect} from '@playwright/test';
import {openApp} from '../helpers/app.mjs';

test('Japanese and English expose the v0.8 mobile-accessibility scope without stale next-stage copy',async({page})=>{
  await openApp(page);
  await expect(page.locator('#versionBadge')).toHaveText('v0.8.0');
  await expect(page.locator('[data-i18n="stage"]')).toContainText('モバイル');
  await expect(page.locator('[data-i18n="nextStage"]')).not.toContainText('モバイル・アクセシビリティ総点検');
  await page.locator('#languageButton').click();
  await expect(page.locator('[data-i18n="stage"]')).toContainText('Mobile');
  await expect(page.locator('[data-i18n="nextStage"]')).not.toContainText('mobile & accessibility review');
});

test('playback pause and work interruption remain distinct bilingual labels',async({page})=>{
  await openApp(page);
  await expect(page.locator('#playLabel')).toHaveText('再生');
  await expect(page.locator('#beginInterruptionButton')).toHaveText('中断を記録');
  await page.locator('#languageButton').click();
  await expect(page.locator('#playLabel')).toHaveText('Play');
  await expect(page.locator('#beginInterruptionButton')).toHaveText('Mark interruption');
});
