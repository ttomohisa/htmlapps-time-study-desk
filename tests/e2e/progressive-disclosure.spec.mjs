import { test, expect } from '@playwright/test';
import { openApp, selectFixtureVideo, seekVideo, measureFirstCycle } from '../helpers/app.mjs';

test('opening screen presents one primary path and defers analysis navigation', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await openApp(page);
  await expect(page.locator('#chooseVideoButton')).toBeVisible();
  await expect(page.locator('#openAnalysisInlineButton')).toBeVisible();
  await expect(page.locator('.workspace-switch')).toBeHidden();
  await expect(page.locator('.mobile-tabs')).toBeHidden();
  await expect(page.locator('.transport')).toBeHidden();
  await expect(page.locator('#measurePanel')).toBeHidden();
  await expect(page.locator('.side-column')).toBeHidden();
  const secondary = await page.locator('#openAnalysisInlineButton').evaluate(el => {
    const s=getComputedStyle(el);return {background:s.backgroundColor,border:s.borderTopWidth,decoration:s.textDecorationLine};
  });
  expect(secondary.background).toBe('rgba(0, 0, 0, 0)');
  expect(secondary.border).toBe('0px');
  expect(secondary.decoration).toContain('underline');
});

test('video first reveals measurement only, then record navigation after measurement starts', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await openApp(page); await selectFixtureVideo(page);
  await expect(page.locator('#measurePanel')).toBeVisible();
  await expect(page.locator('#startCycleButton')).toBeVisible();
  await expect(page.locator('.workspace-switch')).toBeHidden();
  await expect(page.locator('#recordCard')).toBeHidden();
  await page.locator('#startCycleButton').click();
  await expect(page.locator('.workspace-switch')).toBeVisible();
  await expect(page.locator('#activeStepCard')).toBeVisible();
  await expect(page.locator('#recordCard')).toBeHidden();
  await seekVideo(page,.6); await page.locator('#markBoundaryButton').click();
  await expect(page.locator('#recordCard')).toBeHidden();
});

test('finishing a cycle stays in measurement and offers next, edit and results choices', async ({ page }) => {
  await openApp(page); await selectFixtureVideo(page); await measureFirstCycle(page);
  await expect(page.locator('body')).toHaveAttribute('data-current-page','measure');
  await expect(page.locator('#cycleCompleteCard')).toBeVisible();
  await expect(page.locator('#cycleCompleteDuration')).toContainText('3.4');
  await expect(page.locator('#cycleCompleteBreakdown')).toContainText('中断');
  await expect(page.locator('#recordCard')).toBeHidden();
  await expect(page.locator('#startCycleButton')).toBeVisible();
  await expect(page.locator('#reviewCompletedButton')).toBeVisible();
  await expect(page.locator('#viewResultsButton')).toBeVisible();
  await expect(page.locator('#startCycleButton')).toContainText('次の回');
  await page.locator('#reviewCompletedButton').click();
  await expect(page.locator('body')).toHaveAttribute('data-current-page','review');
  await expect(page.locator('#reviewTitle')).toContainText('記録を編集');
});

test('measurement workspace uses the desktop width for a video-plus-action workbench', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await openApp(page); await selectFixtureVideo(page);
  const panel=await page.locator('.player-panel').boundingBox();
  const player=await page.locator('#playerRegion').boundingBox();
  const measure=await page.locator('#measurePanel').boundingBox();
  expect(panel.width).toBeGreaterThanOrEqual(1180);
  expect(panel.width).toBeLessThanOrEqual(1240);
  expect(player.width).toBeGreaterThan(measure.width);
  expect(measure.x).toBeGreaterThan(player.x);
});
