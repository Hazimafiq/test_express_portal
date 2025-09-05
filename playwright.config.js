// @ts-check
const { defineConfig, devices } = require('@playwright/test');

/**
 * @see https://playwright.dev/docs/test-configuration
 */
module.exports = defineConfig({
  testDir: './tests/e2e',
  /* Run tests in files in sequence for proper user lifecycle */
  fullyParallel: false,
  /* Use single worker to ensure proper test sequence */
  workers: 1,
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

  /* Configure single browser project for sequential user lifecycle testing */
  projects: [
    {
      name: 'user-lifecycle',
      use: { ...devices['Desktop Chrome'] },
      testMatch: [
        'create_user.spec.js',
        'user_details_page.spec.js', 
        'update_user.spec.js',
        'change_password.spec.js',
        'deactivate_user_simple.spec.js',
        'reactivate_user.spec.js',
        'delete_user.spec.js',
        'profile.spec.js'
      ]
    },

    /* Test against mobile viewports. */
    // {
    //   name: 'Mobile Chrome',
    //   use: { ...devices['Pixel 5'] },
    // },
    // {
    //   name: 'Mobile Safari',
    //   use: { ...devices['iPhone 12'] },
    // },

    /* Test against branded browsers. */
    // {
    //   name: 'Microsoft Edge',
    //   use: { ...devices['Desktop Edge'], channel: 'msedge' },
    // },
    // {
    //   name: 'Google Chrome',
    //   use: { ...devices['Desktop Chrome'], channel: 'chrome' },
    // },
  ],

  /* Run your local dev server before starting the tests */
  webServer: process.env.CI ? undefined : {
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
