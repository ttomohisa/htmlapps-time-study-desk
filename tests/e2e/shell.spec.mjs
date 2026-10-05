import { test, expect } from '@playwright/test';
import { openApp } from '../helpers/app.mjs';
for (const variant of ['readable', 'self-extract']) {
  test(`shell_is_local_bilingual_and_not_starter: ${variant}`, async ({ page }) => {
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await openApp(page, variant);
    await expect(page.locator('#brandName')).toContainText('Time Study Desk');
    await expect(page.getByRole('button', { name: '動画を選択', exact: true })).toBeVisible();
    await expect(page.getByRole('button', { name: '保存した分析を開く', exact: true })).toBeEnabled();
    await expect(page.locator('#editor')).toHaveCount(0);
    await expect(page.locator('html')).toHaveCSS('color-scheme', 'light');
    await page.locator('#languageButton').click();
    await expect(page.getByRole('button', { name: 'Choose video', exact: true })).toBeVisible();
    await page.setViewportSize({ width: 320, height: 640 });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    expect(errors).toEqual([]);
  });
}
