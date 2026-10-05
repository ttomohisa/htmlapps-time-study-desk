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
