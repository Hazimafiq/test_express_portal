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
    // Submit form without filling any required fields
    await page.click('#submitBtn');
    
    // Wait for validation to trigger
    await page.waitForTimeout(500);
    
    // Test all required fields have field-error class (based on FormValidation class)
    await expect(page.locator('#username')).toHaveClass(/field-error/);
    await expect(page.locator('#fullName')).toHaveClass(/field-error/);
    await expect(page.locator('#email')).toHaveClass(/field-error/);
    await expect(page.locator('#phoneNumber')).toHaveClass(/field-error/);
    await expect(page.locator('#country')).toHaveClass(/field-error/);
    await expect(page.locator('#clinic')).toHaveClass(/field-error/);
    await expect(page.locator('#password')).toHaveClass(/field-error/);
    await expect(page.locator('#confirmPassword')).toHaveClass(/field-error/);
    
    // const roleSelection = page.locator('#roleSelection');
    // await expect(roleSelection).toHaveClass(/field-error/);
  });

  test('should show specific validation messages for required fields', async ({ page }) => {
    // Submit form without filling any required fields
    await page.click('#submitBtn');
    
    // Wait for validation messages to appear
    await page.waitForTimeout(500);
    
    // Check that validation messages are displayed using the class structure from FormValidation
    // The validation system creates .field-error-message elements dynamically
    
    // Count all visible error messages - should have one for each required field
    const errorMessages = page.locator('.field-error-message.show');
    await expect(errorMessages).toHaveCount(9); // 8 form fields + 1 role group
    
    // Check for specific error message content using exact text matches
    await expect(page.getByText('Username is required.', { exact: true })).toBeVisible();
    await expect(page.getByText('Full Name is required.', { exact: true })).toBeVisible();
    await expect(page.getByText('Email is required.', { exact: true })).toBeVisible();
    await expect(page.getByText('Phone number is required.', { exact: true })).toBeVisible();
    await expect(page.getByText('Country is required.', { exact: true })).toBeVisible();
    await expect(page.getByText('Clinic is required.', { exact: true })).toBeVisible();
    await expect(page.getByText('Password is required.', { exact: true })).toBeVisible();
    await expect(page.getByText('Confirm Password is required.', { exact: true })).toBeVisible();
    await expect(page.getByText('Role is required.', { exact: true })).toBeVisible();
  });

  test('should clear validation errors when fields are filled', async ({ page }) => {
    // First trigger validation errors
    await page.click('#submitBtn');
    await page.waitForTimeout(500);
    
    // Verify errors are present
    await expect(page.locator('#username')).toHaveClass(/field-error/);
    
    // Fill username and verify error is cleared
    await page.fill('#username', 'testuser');
    await page.waitForTimeout(100);
    await expect(page.locator('#username')).not.toHaveClass(/field-error/);
    
    // Fill email and verify error is cleared
    await page.fill('#email', 'test@example.com');
    await page.waitForTimeout(100);
    await expect(page.locator('#email')).not.toHaveClass(/field-error/);
    
    // Select country and verify error is cleared
    await page.click('#country-select');
    await page.click('.custom-select__option[data-value="Malaysia"]');
    await page.waitForTimeout(100);
    await expect(page.locator('#country')).not.toHaveClass(/field-error/);
    
    // Select role and verify error is cleared
    await page.check('input[name="role"][value="doctor"]');
    await page.waitForTimeout(100);
    await expect(page.locator('#roleSelection')).not.toHaveClass(/field-error/);
  });

  test('should validate password requirements', async ({ page }) => {
    // Fill other required fields first
    await page.fill('#username', 'testuser');
    await page.fill('#fullName', 'Test User');
    await page.fill('#email', 'test@example.com');
    await page.fill('#phoneNumber', '+60123456789');
    await page.click('#country-select');
    await page.click('.custom-select__option[data-value="Malaysia"]');
    await page.fill('#clinic', 'Test Clinic');
    await page.fill('#confirmPassword', 'weak');
    await page.check('input[name="role"][value="doctor"]');
    
    // Fill weak password
    await page.fill('#password', 'weak');
    await page.click('#submitBtn');
    await page.waitForTimeout(500);
    
    // Check password validation error for weak password (from inline validation in create_user.ejs)
    await expect(page.locator('#passwordError')).toBeVisible();
    await expect(page.locator('#passwordError')).toContainText('Password need to be');
  });

  test('should validate password confirmation match', async ({ page }) => {
    // Fill password and mismatching confirmation
    await page.fill('#password', 'TestPass123!');
    await page.fill('#confirmPassword', 'DifferentPass123!');
    await page.click('#submitBtn');
    await page.waitForTimeout(500);
    
    // Check password confirmation validation error (from inline validation in create_user.ejs)
    await expect(page.locator('#confirmPasswordError')).toBeVisible();
    await expect(page.locator('#confirmPasswordError')).toContainText('Passwords do not match');
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
    
    await page.waitForTimeout(500);
    
    const errors = [];
    const requests = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });
    
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
      console.log('Console errors during form submission:', errors);
      console.log('Network requests:', requests);
      console.log('Network responses:', responses);
      console.log('Current URL:', await page.url());
      console.log('Country value after submission:', await page.locator('#country').inputValue());
      throw error;
    }
  });
});
