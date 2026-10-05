import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
export async function openApp(page, variant = 'readable') {
  const filename = variant === 'self-extract' ? 'index.self-extract.html' : 'index.html';
  const url = process.env.TSD_BASE_URL ? new URL(filename, process.env.TSD_BASE_URL).href : pathToFileURL(resolve('dist', filename)).href;
  // Supplemental rendering only. CI never enables this: it navigates to the generated file.
  if (process.env.TSD_IN_MEMORY === '1') await page.setContent(await readFile(resolve('dist', filename), 'utf8'));
  else await page.goto(url);
  await page.locator('#versionBadge').waitFor();
}
export async function selectFixtureVideo(page, name = 'landscape.mp4') {
  await page.locator('#videoInput').setInputFiles(resolve('tests/fixtures/media', name));
}
export async function seekVideo(page, seconds) {
  await page.locator('#seekBar').evaluate((input,value) => { input.value=String(value); input.dispatchEvent(new Event('change',{bubbles:true})); },seconds);
  await page.waitForFunction(() => document.querySelector('#mediaStatus').dataset.state === 'ready');
}
export async function measureFirstCycle(page) {
  await page.locator('#startCycleButton').click();
  for (const seconds of [.6,1.8,2.8]) { await seekVideo(page,seconds); await page.locator('#markBoundaryButton').click(); }
  await seekVideo(page,3.4); await page.locator('#finishCycleButton').click();
}

export async function openHttpApp(page) { await page.goto('http://127.0.0.1:4173/index.html'); await page.locator('#versionBadge').waitFor(); }
