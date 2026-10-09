import {test,expect} from '@playwright/test';
import {openApp} from '../helpers/app.mjs';

test('Japanese and English expose the v0.9 release-candidate scope without stale mobile-stage copy',async({page})=>{
  await openApp(page);
  await expect(page.locator('#versionBadge')).toHaveText('v0.9.0');
  await expect(page.locator('[data-i18n="stage"]')).toContainText('リリース候補');
  await expect(page.locator('[data-i18n="nextStage"]')).not.toContainText('モバイル・アクセシビリティ');
  await page.locator('#languageButton').click();
  await expect(page.locator('[data-i18n="stage"]')).toContainText('Release candidate');
  await expect(page.locator('[data-i18n="nextStage"]')).not.toContainText('Mobile & accessibility');
});

test('playback pause and work interruption remain distinct bilingual labels',async({page})=>{
  await openApp(page);
  await expect(page.locator('#playLabel')).toHaveText('再生');
  await expect(page.locator('#beginInterruptionButton')).toHaveText('中断を記録');
  await page.locator('#languageButton').click();
  await expect(page.locator('#playLabel')).toHaveText('Play');
  await expect(page.locator('#beginInterruptionButton')).toHaveText('Mark interruption');
});
