import { defineConfig, devices } from '@playwright/test';
import dotenv from 'dotenv';
import path from 'path';

// Load .env file from project root
dotenv.config({ path: path.resolve(__dirname, '.env') });

export default defineConfig({
  // Directory where tests are located
  testDir: './src/tests',

  // Maximum time a single test can run (2 minutes for network operations)
  timeout: 120_000,

  // Maximum time expect() assertions can wait
  expect: {
    timeout: 15_000,
  },

  // Run tests sequentially — we work with a single Wikipedia account
  fullyParallel: false,
  workers: 1,

  // Fail the build on CI if test.only is accidentally left in code
  forbidOnly: !!process.env.CI,

  // No retries — we want clear pass/fail signals
  retries: 0,

  // HTML reporter for human-readable results
  reporter: [
    ['html', { open: 'never', outputFolder: 'playwright-report' }],
    ['list'],
  ],

  use: {
    // Base URL for Wikipedia
    baseURL: 'https://en.wikipedia.org',

    // Collect trace on first retry for debugging
    trace: 'on-first-retry',

    // Take screenshot on failure for debugging
    screenshot: 'only-on-failure',

    // Record video on failure
    video: 'on-first-retry',

    // Increase action timeout for slow Wikipedia pages
    actionTimeout: 15_000,

    // Increase navigation timeout
    navigationTimeout: 30_000,
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});
