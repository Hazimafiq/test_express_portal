const { test, expect } = require('@playwright/test');
const { loginAsAdminAndNavigate } = require('./helpers/auth');

test.describe('Create User Form', () => {
  test.beforeEach(async ({ page }) => {
    // Login as admin and navigate to create user page
    await loginAsAdminAndNavigate(page, '/create-user');
  });

  test('should display form correctly', async ({ page }) => {
    await expect(page.locator('.page-title')).toHaveText('Create User');
    await expect(page.locator('#username')).toBeVisible();
    await expect(page.locator('#submitBtn')).toBeVisible();
  });

  test('should show validation errors for empty required fields', async ({ page }) => {
    await page.click('#submitBtn');
    await expect(page.locator('#username')).toHaveClass(/error/);
  });

  test('should handle country selection correctly', async ({ page }) => {
    await page.click('#country-select');
    await page.click('.custom-select__option[data-value="Malaysia"]');
    const countrySelect = page.locator('#country');
    await expect(countrySelect).toHaveValue('Malaysia');
  });

  test('should handle role selection correctly', async ({ page }) => {
    const doctorRadio = page.locator('input[name="role"][value="doctor"]');
    await doctorRadio.check();
    await expect(doctorRadio).toBeChecked();
  });

  test('should toggle password visibility', async ({ page }) => {
    const passwordInput = page.locator('#password');
    const passwordToggle = page.locator('[data-target="password"]');
    
    await expect(passwordInput).toHaveAttribute('type', 'password');
    await passwordToggle.click();
    await expect(passwordInput).toHaveAttribute('type', 'text');
  });

  test('should validate password strength in real-time', async ({ page }) => {
    const passwordInput = page.locator('#password');
    const strengthElement = page.locator('#passwordStrength');
    
    await passwordInput.fill('weak');
    await expect(strengthElement).toHaveText('Weak');
    
    await passwordInput.fill('GoodPass1!');
    await expect(strengthElement).toHaveText('Good');
  });

  test('should successfully submit form with valid data', async ({ page }) => {
    const randomUsername = `testuser${Date.now()}`;
    await page.fill('#username', randomUsername);
    await page.fill('#fullName', 'Test User');
    await page.fill('#email', randomUsername+'@example.com');
    await page.fill('#phoneNumber', '+60123456789');
    
    await page.click('#country-select');
    await page.click('.custom-select__option[data-value="Malaysia"]');
    
    await page.fill('#clinic', 'Test Clinic');
    await page.fill('#password', 'TestPass123!');
    await page.fill('#confirmPassword', 'TestPass123!');
    
    await page.check('input[name="role"][value="doctor"]');
    
    // Wait a moment for all form interactions to complete
    await page.waitForTimeout(500);
    
    // Listen for console errors and network requests
    const errors = [];
    const requests = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });
    
    // Monitor network requests and responses
    page.on('request', request => {
      if (request.url().includes('/register')) {
        requests.push({
          url: request.url(),
          method: request.method(),
          postData: request.postData()
        });
      }
    });
    
    const responses = [];
    page.on('response', async response => {
      if (response.url().includes('/register')) {
        const responseText = await response.text().catch(() => 'Could not read response');
        responses.push({
          status: response.status(),
          statusText: response.statusText(),
          body: responseText
        });
      }
    });
    
    // Verify form data before submission
    const countryValue = await page.locator('#country').inputValue();
    console.log('Country value before submission:', countryValue);
    
    // Click submit and wait for either navigation or error
    await page.click('#submitBtn');
    
    // Wait for either navigation to user-management or timeout
    try {
      await page.waitForURL('**/user-management**', { timeout: 10000 });
      await expect(page.url()).toContain('/user-management');
    } catch (error) {
      // If navigation fails, log debugging info
      console.log('Console errors during form submission:', errors);
      console.log('Network requests:', requests);
      console.log('Network responses:', responses);
      console.log('Current URL:', await page.url());
      console.log('Country value after submission:', await page.locator('#country').inputValue());
      throw error;
    }
  });
});
