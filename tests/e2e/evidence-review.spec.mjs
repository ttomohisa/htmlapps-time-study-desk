import {test,expect} from '@playwright/test';
import {openApp,selectFixtureVideo,measureFirstCycle} from '../helpers/app.mjs';
import {makeFixture} from '../helpers/fixtures.mjs';

test('number_opens_exact_evidence_range while detached and never autoplays',async({page})=>{
  await openApp(page);await page.locator('#analysisInput').setInputFiles({name:'F1.tsd.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(makeFixture('F1')))});
  await page.locator('#timeTableRows > [data-cycle-id="cycle-3"] .cycle-total-evidence').click();
  await expect(page.locator('body')).toHaveAttribute('data-current-page','review');
  await expect(page.locator('#evidenceReviewCard')).toBeVisible();
  await expect(page.locator('#evidenceRange')).toContainText('77');
  await expect(page.locator('#evidenceRange')).toContainText('127');
  await expect(page.locator('#playEvidenceButton')).toBeDisabled();
  await expect(page.locator('video')).toHaveCount(0);
});

test('connected evidence seeks paused, then explicit range play stops near its end',async({page})=>{
  await openApp(page);await selectFixtureVideo(page);await measureFirstCycle(page);
  await page.locator('.workspace-switch [data-page="results"]').click();
  await page.locator('#timeTableRows .cycle-total-evidence').first().click();
  await expect(page.locator('#evidenceReviewCard')).toBeVisible();
  await expect.poll(()=>page.locator('video').evaluate(v=>v.currentTime)).toBeLessThan(.08);
  expect(await page.locator('video').evaluate(v=>v.paused)).toBe(true);
  await page.locator('#playbackRate').selectOption('2');
  await page.locator('#playEvidenceButton').click();
  await expect.poll(()=>page.locator('video').evaluate(v=>v.paused),{timeout:5000}).toBe(true);
  const stopped=await page.locator('video').evaluate(v=>v.currentTime);
  expect(stopped).toBeGreaterThan(3.1);expect(stopped).toBeLessThanOrEqual(3.7);
});

test('phase aggregates expose exact constituent segments rather than hiding interruptions',async({page})=>{
  await openApp(page);await page.locator('#analysisInput').setInputFiles({name:'F1.tsd.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(makeFixture('F1')))});
  await page.locator('#timeTableRows > [data-cycle-id="cycle-3"] [data-phase-id="phase-3"] button').click();
  await expect(page.locator('#evidenceSegmentField')).toBeVisible();
  await expect(page.locator('#evidenceSegmentSelect option')).toHaveCount(2);
  await expect(page.locator('#evidenceRange')).toContainText('96');
  await expect(page.locator('#evidenceRange')).toContainText('101');
});
