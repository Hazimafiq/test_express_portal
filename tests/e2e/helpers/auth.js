/**
 * Authentication helper for Playwright tests
 */

const path = require('path');

const adminUser = {
  username: 'admin_test',
  password: 'AdminPass123!',
  email: 'admin@test.com',
  fullName: 'Admin Test User',
  phoneNumber: '+60123456789',
  country: 'Malaysia',
  clinic: 'Test Clinic',
  role: 'superadmin'
};

/**
 * Login as admin using stored authentication state
 * @param {Page} page - Playwright page object
 */
async function loginAsAdmin(page) {
  // The authentication state is already loaded by the context
  // Just navigate to verify we're logged in
  await page.goto('/aligners-cases');
}

/**
 * Login as admin and navigate to a specific page
 * @param {Page} page - Playwright page object
 * @param {string} targetPath - Path to navigate to after login
 */
async function loginAsAdminAndNavigate(page, targetPath) {
  // The authentication state is already loaded by the context
  // Just navigate to the target page
  await page.goto(targetPath);
}

/**
 * Get the path to the stored authentication state
 * @returns {string} Path to auth-state.json
 */
function getAuthStatePath() {
  return path.join(__dirname, '../../auth-state.json');
}

module.exports = {
  adminUser,
  loginAsAdmin,
  loginAsAdminAndNavigate,
  getAuthStatePath
};
