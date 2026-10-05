import { defineConfig } from '@playwright/test';
export default defineConfig({
  testDir: './tests/e2e',
  timeout: 20000,
  expect: { timeout: 5000 },
  fullyParallel: false,
  workers: 1,
  reporter: [['list'], ['html', { open: 'never' }]],
  use: { locale: 'ja-JP', viewport: { width: 1360, height: 900 }, trace: 'retain-on-failure' },
  projects: [{ name: 'chromium', use: { browserName: 'chromium', launchOptions: process.env.TSD_CHROMIUM_PATH ? { executablePath: process.env.TSD_CHROMIUM_PATH, args: ['--no-sandbox'] } : {} } }]
});
