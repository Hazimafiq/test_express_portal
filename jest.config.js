module.exports = {
  testEnvironment: 'node',
  testMatch: ['**/tests/**/*.test.js'],
  setupFilesAfterEnv: ['./tests/jest.setup.js'],
  globalSetup: './tests/jestGlobalSetup.js',
  globalTeardown: './tests/jestGlobalTeardown.js'
};
