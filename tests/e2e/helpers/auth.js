/**
 * Authentication helper for Playwright tests
 */

const adminUser = {
  username: 'admin_test',
  password: 'AdminPass123!',
  email: 'admin@test.com',
  fullName: 'Admin Test User',
  phoneNumber: '+60123456789',
  country: 'malaysia',
  clinic: 'Test Clinic',
  role: 'superadmin'
};

/**
 * Login as admin user
 * @param {Page} page - Playwright page object
 */
async function loginAsAdmin(page) {
  await page.goto('/login');
  
  // Fill login form
  await page.fill('#username', adminUser.username);
  await page.fill('#password', adminUser.password);
  
  // Submit login form
  await page.click('.signin-button');
  
  // Wait for successful login (redirect to aligners-cases)
  await page.waitForURL('/aligners-cases');
}

/**
 * Login as admin and navigate to a specific page
 * @param {Page} page - Playwright page object
 * @param {string} targetPath - Path to navigate to after login
 */
async function loginAsAdminAndNavigate(page, targetPath) {
  await loginAsAdmin(page);
  await page.goto(targetPath);
}

module.exports = {
  adminUser,
  loginAsAdmin,
  loginAsAdminAndNavigate
};
