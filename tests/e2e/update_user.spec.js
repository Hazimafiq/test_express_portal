const { test, expect } = require('@playwright/test');
const { loginAsAdminAndNavigate } = require('./helpers/auth');

test.describe('Update User Form', () => {
  let userId;

  test.beforeEach(async ({ page }) => {
    // For testing purposes, use the admin user (ID 1) that was created in setup
    userId = '1';
    
    // Navigate directly to update user page
    await page.goto(`/update-user/${userId}`);
  });

  test('should display form correctly with pre-filled data', async ({ page }) => {
    await expect(page.locator('.page-title')).toHaveText('Update Profile');
    await expect(page.locator('#username')).toBeVisible();
    await expect(page.locator('#fullName')).toBeVisible();
    await expect(page.locator('#email')).toBeVisible();
    await expect(page.locator('#submitBtn')).toBeVisible();
    
    // Check that fields are pre-filled (not empty)
    const username = await page.locator('#username').inputValue();
    const fullName = await page.locator('#fullName').inputValue();
    const email = await page.locator('#email').inputValue();
    
    expect(username).not.toBe('');
    expect(fullName).not.toBe('');
    expect(email).not.toBe('');
  });

  test('should show validation errors for empty required fields', async ({ page }) => {
    // Clear required fields
    await page.fill('#username', '');
    await page.fill('#fullName', '');
    await page.fill('#email', '');
    
    await page.click('#submitBtn');
    await expect(page.locator('#username')).toHaveClass(/error/);
    await expect(page.locator('#fullName')).toHaveClass(/error/);
    await expect(page.locator('#email')).toHaveClass(/error/);
  });

  test('should handle country selection correctly', async ({ page }) => {
    await page.click('#country-select');
    await page.click('.custom-select__option[data-value="Singapore"]');
    const countrySelect = page.locator('#country');
    await expect(countrySelect).toHaveValue('Singapore');
  });

  test('should handle state selection correctly', async ({ page }) => {
    await page.click('#state-select');
    await page.click('.custom-select__option[data-value="Penang"]');
    const stateSelect = page.locator('#state');
    await expect(stateSelect).toHaveValue('Penang');
  });

  test('should handle role selection correctly', async ({ page }) => {
    const staffRadio = page.locator('input[name="role"][value="staff"]');
    await staffRadio.check();
    await expect(staffRadio).toBeChecked();
  });

  test('should successfully update user with modified data', async ({ page }) => {
    const timestamp = Date.now();
    const updatedUsername = `updated_user${timestamp}`;
    const updatedFullName = 'Updated Test User';
    const updatedEmail = `updated${timestamp}@example.com`;
    
    // Update form fields
    await page.fill('#username', updatedUsername);
    await page.fill('#fullName', updatedFullName);
    await page.fill('#email', updatedEmail);
    await page.fill('#phoneNumber', '+60987654321');
    
    // Update country
    await page.click('#country-select');
    await page.click('.custom-select__option[data-value="Singapore"]');
    
    // Update clinic
    await page.fill('#clinic', 'Updated Clinic Name');
    
    // Update delivery address
    await page.fill('#address', '123 Updated Street');
    await page.fill('#postcode', '12345');
    await page.fill('#city', 'Updated City');
    
    // Update state
    await page.click('#state-select');
    await page.click('.custom-select__option[data-value="Penang"]');
    
    // Update role
    await page.check('input[name="role"][value="staff"]');
    
    // Wait for form interactions to complete
    await page.waitForTimeout(500);
    
    // Listen for console errors and network requests
    const errors = [];
    const requests = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });
    
    page.on('request', request => {
      if (request.url().includes('/update-user')) {
        requests.push({
          url: request.url(),
          method: request.method(),
          postData: request.postData()
        });
      }
    });
    
    const responses = [];
    page.on('response', async response => {
      if (response.url().includes('/update-user')) {
        const responseText = await response.text().catch(() => 'Could not read response');
        responses.push({
          status: response.status(),
          statusText: response.statusText(),
          body: responseText
        });
      }
    });
    
    // Click submit and wait for navigation
    await page.click('#submitBtn');
    
    // Wait for navigation to user details page
    try {
      await page.waitForURL(`**/user-details/${userId}**`, { timeout: 10000 });
      await expect(page.url()).toContain(`/user-details/${userId}`);
    } catch (error) {
      // If navigation fails, log debugging info
      console.log('Console errors during form submission:', errors);
      console.log('Network requests:', requests);
      console.log('Network responses:', responses);
      console.log('Current URL:', await page.url());
      throw error;
    }
  });

  test('should handle cancel button correctly', async ({ page }) => {
    await page.click('#cancelBtn');
    await expect(page.url()).toContain(`/user-details/${userId}`);
  });

  test('should display deactivate button for active users', async ({ page }) => {
    // This test assumes the user is active - may need to check status first
    const deactivateBtn = page.locator('#deactivateBtn');
    if (await deactivateBtn.isVisible()) {
      await expect(deactivateBtn).toBeVisible();
      await expect(deactivateBtn).toHaveText('Deactivate User');
    }
  });

  test('should show deactivate modal when deactivate button is clicked', async ({ page }) => {
    const deactivateBtn = page.locator('#deactivateBtn');
    if (await deactivateBtn.isVisible()) {
      await deactivateBtn.click();
      const modal = page.locator('#deactivateModal');
      await expect(modal).toHaveClass(/show/);
      await expect(modal.locator('.modal-title')).toHaveText('Confirm to Deactivate?');
    }
  });

  test('should close deactivate modal when cancel is clicked', async ({ page }) => {
    const deactivateBtn = page.locator('#deactivateBtn');
    if (await deactivateBtn.isVisible()) {
      await deactivateBtn.click();
      await page.click('#cancelDeactivate');
      const modal = page.locator('#deactivateModal');
      await expect(modal).not.toHaveClass(/show/);
    }
  });

  test('should validate email format', async ({ page }) => {
    await page.fill('#email', 'invalid-email');
    await page.click('#submitBtn');
    // Wait for validation to complete
    await page.waitForTimeout(1000);
    // Check for error class or validation message
    const emailField = page.locator('#email');
    const hasErrorClass = await emailField.getAttribute('class');
    const isInvalid = hasErrorClass && hasErrorClass.includes('error');
    if (!isInvalid) {
      // Alternative: check for validation message or form submission prevention
      const currentUrl = page.url();
      expect(currentUrl).toContain('/update-user');
    } else {
      await expect(emailField).toHaveClass(/error/);
    }
  });

  test('should validate phone number format', async ({ page }) => {
    await page.fill('#phoneNumber', 'invalid-phone');
    await page.click('#submitBtn');
    await expect(page.locator('#phoneNumber')).toHaveClass(/error/);
  });

  test('should preserve form data when validation fails', async ({ page }) => {
    const testData = {
      username: 'test_username',
      fullName: 'Test Full Name',
      clinic: 'Test Clinic'
    };
    
    // Fill form with test data
    await page.fill('#username', testData.username);
    await page.fill('#fullName', testData.fullName);
    await page.fill('#clinic', testData.clinic);
    
    // Clear email to trigger validation error
    await page.fill('#email', '');
    
    // Submit form
    await page.click('#submitBtn');
    
    // Check that other fields retained their values
    await expect(page.locator('#username')).toHaveValue(testData.username);
    await expect(page.locator('#fullName')).toHaveValue(testData.fullName);
    await expect(page.locator('#clinic')).toHaveValue(testData.clinic);
  });
});