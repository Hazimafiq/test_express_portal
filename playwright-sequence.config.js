// @ts-check
const { defineConfig, devices } = require('@playwright/test');

/**
 * Playwright config for running user lifecycle tests in sequence
 * @see https://playwright.dev/docs/test-configuration
 */
module.exports = defineConfig({
  testDir: './tests/e2e',
  /* Run tests sequentially instead of in parallel */
  fullyParallel: false,
  workers: 1, // Single worker to ensure sequence
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: 'html',
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Base URL to use in actions like `await page.goto('/')`. */
    baseURL: 'http://localhost:3000',

    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: 'on-first-retry',
    
    /* Load authentication state */
    storageState: './tests/auth-state.json',
  },

  /* Configure single browser project for sequential testing */
  projects: [
    {
      name: 'user-lifecycle-sequence',
      use: { ...devices['Desktop Chrome'] },
      testMatch: [
        'user_lifecycle_sequence.spec.js'
      ]
    }
  ],

  /* Run your local dev server before starting the tests */
  webServer: {
    command: 'npm run start',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    env: {
      NODE_ENV: 'test',
    },
  },

  /* Global setup and teardown */
  globalSetup: require.resolve('./tests/globalSetup.js'),
  globalTeardown: require.resolve('./tests/globalTeardown.js'),
});