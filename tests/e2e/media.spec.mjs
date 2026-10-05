import { test, expect } from '@playwright/test';
import { resolve } from 'node:path';
import { readFile } from 'node:fs/promises';
import { openApp, selectFixtureVideo } from '../helpers/app.mjs';
test('media_loads_or_preserves_previous_source', async ({ page }) => {
  await openApp(page); await selectFixtureVideo(page);
  await expect(page.locator('#mediaStatus')).toHaveAttribute('data-state', 'ready');
  await expect(page.locator('#sourceName')).toHaveText('landscape.mp4');
  for (const [name, bytes] of [['empty.mp4', []], ['broken.mp4', [1,2,3,4]]]) {
    await page.locator('#videoInput').setInputFiles({name, mimeType: 'video/mp4', buffer: Buffer.from(bytes)});
    await expect(page.locator('#errorMessage')).toBeVisible();
    await expect(page.locator('#sourceName')).toHaveText('landscape.mp4');
    await expect(page.locator('#playButton')).toBeEnabled();
  }
  await page.locator('#videoInput').setInputFiles(resolve('tests/fixtures/media/audio.wav'));
  await expect(page.locator('#errorMessage')).toBeVisible();
  await expect(page.locator('#sourceName')).toHaveText('landscape.mp4');
});
test('successful replacement requires confirmation; cancel preserves playback position', async ({ page }) => {
  await openApp(page); await selectFixtureVideo(page);
  await expect(page.locator('#playButton')).toBeEnabled();
  await page.locator('#adjustments summary').click();
  await page.locator('[data-seek="1"]').click();
  await expect(page.locator('#position')).toHaveText('00:01.0');
  await selectFixtureVideo(page, 'portrait.mp4');
  await expect(page.locator('#appConfirmDialog')).toBeVisible();
  await page.locator('#appConfirmCancel').click();
  await expect(page.locator('#sourceName')).toHaveText('landscape.mp4');
  await expect(page.locator('#position')).toHaveText('00:01.0');
  await selectFixtureVideo(page, 'portrait.mp4');
  await page.locator('#appConfirmOk').click();
  await expect(page.locator('#sourceName')).toHaveText('portrait.mp4');
  expect(await page.locator('video').evaluate(v => v.videoHeight > v.videoWidth)).toBe(true);
  await expect(page.locator('video')).toHaveCSS('object-fit', 'contain');
});
test('playback rate and direct seek work; player shortcuts do not steal button keys', async ({ page }) => {
  await openApp(page); await selectFixtureVideo(page);
  await expect(page.locator('#playButton')).toBeEnabled();
  for (const rate of ['0.25','0.5','0.75','1','1.5','2']) {
    await page.locator('#playbackRate').selectOption(rate);
    expect(await page.locator('video').evaluate(v => v.playbackRate)).toBe(Number(rate));
  }
  await page.locator('#playerRegion').focus(); await page.keyboard.press('ArrowRight');
  await expect(page.locator('#position')).toHaveText('00:00.1');
  await page.keyboard.press('Shift+ArrowRight');
  await expect(page.locator('#position')).toHaveText('00:01.1');
  await page.locator('#playButton').click();
  await expect(page.locator('#playButton')).toHaveAccessibleName('再生を一時停止');
  await page.locator('#playButton').click();
  expect(await page.locator('video').evaluate(v => v.paused)).toBe(true);
});
test('source filename is text, not executable HTML, and local operations do not request network resources', async ({ page }) => {
  const requests = [], errors = [];
  page.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });
  page.on('request', r => { if (/^https?:/.test(r.url()) && r.resourceType() !== 'document') requests.push(r.url()); });
  page.on('pageerror', e => errors.push(e.message));
  await page.addInitScript(() => {
    window.__testCsp = []; window.__testNetworkAttempts = [];
    for (const name of ['fetch', 'WebSocket', 'EventSource']) {
      window[name] = new Proxy(window[name], {
        apply(target, receiver, args) { window.__testNetworkAttempts.push(name); return Reflect.apply(target, receiver, args); },
        construct(target, args) { window.__testNetworkAttempts.push(name); return Reflect.construct(target, args); }
      });
    }
    const open = XMLHttpRequest.prototype.open;
    XMLHttpRequest.prototype.open = function(...args) { window.__testNetworkAttempts.push('XHR'); return open.apply(this, args); };
    const beacon = navigator.sendBeacon.bind(navigator);
    navigator.sendBeacon = (...args) => { window.__testNetworkAttempts.push('beacon'); return beacon(...args); };
    document.addEventListener('securitypolicyviolation', e => window.__testCsp.push(e.violatedDirective));
  });
  await openApp(page);
  const name = '<img src=x onerror=alert(1)>.mp4';
  await page.locator('#videoInput').setInputFiles({name, mimeType: '', buffer: await readFile(resolve('tests/fixtures/media/landscape.mp4'))});
  await expect(page.locator('#playButton')).toBeEnabled();
  await expect(page.locator('#sourceName')).toHaveText(name);
  await expect(page.locator('#sourceName img')).toHaveCount(0);
  await page.locator('#adjustments summary').click();
  await page.locator('[data-seek="0.1"]').click(); await page.locator('#languageButton').click();
  expect(requests).toEqual([]); expect(errors).toEqual([]);
  if (!process.env.TSD_IN_MEMORY) {
    expect(await page.evaluate(() => window.__testCsp)).toEqual([]);
    expect(await page.evaluate(() => window.__testNetworkAttempts)).toEqual([]);
  }
});
test('self-extracting variant opens and plays a local video', async ({page}) => {
  await openApp(page, 'self-extract'); await selectFixtureVideo(page);
  await expect(page.locator('#playButton')).toBeEnabled();
  await page.locator('#playbackRate').selectOption('0.5'); await page.locator('#playButton').click();
  await expect(page.locator('#playButton')).toHaveAccessibleName('再生を一時停止');
  await page.locator('#playButton').click();
  expect(await page.locator('video').evaluate(v => v.paused)).toBe(true);
});
