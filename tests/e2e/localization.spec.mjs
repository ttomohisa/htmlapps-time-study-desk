import {test,expect} from '@playwright/test';
import {openApp} from '../helpers/app.mjs';

test('v1.0.1 shows useful local-save help rather than release-candidate instructions in both languages',async({page})=>{
  await openApp(page);
  await expect(page.locator('#versionBadge')).toHaveText('v1.0.1');
  await expect(page.locator('[data-i18n="nextStage"]')).toContainText('分析データの保管');
  await page.locator('#languageButton').click();
  await expect(page.locator('[data-i18n="nextStage"]')).toContainText('Keep a copy');
  await expect(page.locator('[data-i18n="nextStage"]')).not.toContainText('release-candidate');
});

test('playback pause and work interruption remain distinct bilingual labels',async({page})=>{
  await openApp(page);
  await expect(page.locator('#playLabel')).toHaveText('再生');
  await expect(page.locator('#beginInterruptionButton')).toHaveText('中断を記録');
  await page.locator('#languageButton').click();
  await expect(page.locator('#playLabel')).toHaveText('Play');
  await expect(page.locator('#beginInterruptionButton')).toHaveText('Mark interruption');
});
