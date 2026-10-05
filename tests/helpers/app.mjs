import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
export async function openApp(page, variant = 'readable') {
  const filename = variant === 'self-extract' ? 'index.self-extract.html' : 'index.html';
  await page.goto(pathToFileURL(resolve('dist', filename)).href);
  await page.locator('#versionBadge').waitFor();
}
export async function selectFixtureVideo(page, name = 'landscape.mp4') {
  await page.locator('#videoInput').setInputFiles(resolve('tests/fixtures/media', name));
}
