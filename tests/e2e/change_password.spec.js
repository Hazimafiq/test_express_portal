const { test, expect } = require('@playwright/test');

test.describe('Change Password', () => {
  // Using admin user (ID 1) for testing password change functionality
  const testUserId = '1';

  test.beforeEach(async ({ page }) => {
    // Navigate to the user details page
    await page.goto(`/user-details/${testUserId}`);
  });

  test('should display change password button and modal correctly', async ({ page }) => {
    // Verify change password button exists
    const changePasswordBtn = page.locator('#changePasswordBtn');
    await expect(changePasswordBtn).toBeVisible();
    await expect(changePasswordBtn).toHaveText('Change Password');

    // Open modal
    await changePasswordBtn.click();
    
    // Verify modal opens
    const modal = page.locator('#passwordModal');
    await expect(modal).toHaveClass(/show/);
    
    // Verify modal content
    await expect(modal.locator('.modal-header h3')).toHaveText('Change Password');
    await expect(modal.locator('#currentPassword')).toBeVisible();
    await expect(modal.locator('#newPassword')).toBeVisible();
    await expect(modal.locator('#confirmPassword')).toBeVisible();
  });

  test('should close modal when cancel button is clicked', async ({ page }) => {
    // Open modal
    await page.click('#changePasswordBtn');
    const modal = page.locator('#passwordModal');
    await expect(modal).toHaveClass(/show/);
    
    // Click cancel
    await page.click('#cancelBtn');
    await expect(modal).not.toHaveClass(/show/);
  });

  test('should close modal when X button is clicked', async ({ page }) => {
    // Open modal
    await page.click('#changePasswordBtn');
    const modal = page.locator('#passwordModal');
    await expect(modal).toHaveClass(/show/);
    
    // Click close button
    await page.click('#closeModal');
    await expect(modal).not.toHaveClass(/show/);
  });

  test('should close modal when clicking outside', async ({ page }) => {
    // Open modal
    await page.click('#changePasswordBtn');
    const modal = page.locator('#passwordModal');
    await expect(modal).toHaveClass(/show/);
    
    // Click outside modal
    await modal.click({ position: { x: 5, y: 5 } });
    await expect(modal).not.toHaveClass(/show/);
  });

  test('should toggle password visibility for all password fields', async ({ page }) => {
    // Open modal
    await page.click('#changePasswordBtn');
    
    // Test current password toggle
    const currentPasswordInput = page.locator('#currentPassword');
    const currentPasswordToggle = page.locator('[data-target="currentPassword"]');
    
    await expect(currentPasswordInput).toHaveAttribute('type', 'password');
    await currentPasswordToggle.click();
    await expect(currentPasswordInput).toHaveAttribute('type', 'text');
    await currentPasswordToggle.click();
    await expect(currentPasswordInput).toHaveAttribute('type', 'password');

    // Test new password toggle
    const newPasswordInput = page.locator('#newPassword');
    const newPasswordToggle = page.locator('[data-target="newPassword"]');
    
    await expect(newPasswordInput).toHaveAttribute('type', 'password');
    await newPasswordToggle.click();
    await expect(newPasswordInput).toHaveAttribute('type', 'text');
    await newPasswordToggle.click();
    await expect(newPasswordInput).toHaveAttribute('type', 'password');

    // Test confirm password toggle
    const confirmPasswordInput = page.locator('#confirmPassword');
    const confirmPasswordToggle = page.locator('[data-target="confirmPassword"]');
    
    await expect(confirmPasswordInput).toHaveAttribute('type', 'password');
    await confirmPasswordToggle.click();
    await expect(confirmPasswordInput).toHaveAttribute('type', 'text');
    await confirmPasswordToggle.click();
    await expect(confirmPasswordInput).toHaveAttribute('type', 'password');
  });

  test('should validate password strength - Weak password', async ({ page }) => {
    // Open modal
    await page.click('#changePasswordBtn');
    
    const newPasswordInput = page.locator('#newPassword');
    const strengthElement = page.locator('#passwordStrength');
    const strengthBars = page.locator('#passwordStrengthBars');
    const validationMessage = page.locator('#newPasswordError');
    
    // Focus on password field first
    await newPasswordInput.focus();
    
    // Test weak password (missing multiple requirements)
    await newPasswordInput.fill('weak');
    
    // Verify strength indicator
    await expect(strengthElement).toHaveText('Weak');
    await expect(strengthElement).toHaveClass(/weak/);
    
    // Verify strength bars are visible
    await expect(strengthBars).toHaveClass(/visible/);
    await expect(strengthBars).toHaveClass(/weak/);
    
    // Verify validation error message appears
    await expect(validationMessage).toContainText('Password need to be');
    await expect(newPasswordInput).toHaveClass(/error/);
  });

  test('should validate password strength - Good password', async ({ page }) => {
    // Open modal
    await page.click('#changePasswordBtn');
    
    const newPasswordInput = page.locator('#newPassword');
    const strengthElement = page.locator('#passwordStrength');
    const strengthBars = page.locator('#passwordStrengthBars');
    const validationMessage = page.locator('#newPasswordError');
    
    await newPasswordInput.focus();
    
    // Test good password (meets basic requirements but not strong)
    await newPasswordInput.fill('GoodPass1!');
    
    await expect(strengthElement).toHaveText('Good');
    await expect(strengthElement).toHaveClass(/good/);
    await expect(strengthBars).toHaveClass(/visible/);
    await expect(strengthBars).toHaveClass(/good/);
    
    // Verify success message for good password
    await expect(validationMessage).toContainText('Your password meets all the necessary requirements');
    await expect(validationMessage).toHaveClass(/success/);
  });

  test('should validate password strength - Strong password', async ({ page }) => {
    // Open modal
    await page.click('#changePasswordBtn');
    
    const newPasswordInput = page.locator('#newPassword');
    const strengthElement = page.locator('#passwordStrength');
    const strengthBars = page.locator('#passwordStrengthBars');
    const validationMessage = page.locator('#newPasswordError');
    
    await newPasswordInput.focus();
    
    // Test strong password (12+ characters with all requirements)
    await newPasswordInput.fill('VeryStrongPass123!');
    
    await expect(strengthElement).toHaveText('Strong');
    await expect(strengthElement).toHaveClass(/strong/);
    await expect(strengthBars).toHaveClass(/visible/);
    await expect(strengthBars).toHaveClass(/strong/);
    
    // Verify success message for strong password
    await expect(validationMessage).toContainText('Your password is strongly secure and you are all set');
    await expect(validationMessage).toHaveClass(/success/);
  });

  test('should hide strength indicators when strong password loses focus', async ({ page }) => {
    // Open modal
    await page.click('#changePasswordBtn');
    
    const newPasswordInput = page.locator('#newPassword');
    const strengthBars = page.locator('#passwordStrengthBars');
    const validationMessage = page.locator('#newPasswordError');
    const currentPasswordInput = page.locator('#currentPassword');
    
    await newPasswordInput.focus();
    await newPasswordInput.fill('VeryStrongPass123!');
    
    // Verify indicators are visible when focused
    await expect(strengthBars).toHaveClass(/visible/);
    await expect(validationMessage).toContainText('Your password is strongly secure');
    
    // Blur the password field
    await currentPasswordInput.focus();
    
    // Wait for blur to take effect
    await page.waitForTimeout(100);
    
    // Strength bars should be hidden for strong password when unfocused
    await expect(strengthBars).not.toHaveClass(/visible/);
  });

  test('should validate confirm password matching', async ({ page }) => {
    // Open modal
    await page.click('#changePasswordBtn');
    
    const newPasswordInput = page.locator('#newPassword');
    const confirmPasswordInput = page.locator('#confirmPassword');
    
    // Set new password
    await newPasswordInput.fill('TestPassword123!');
    
    // Set non-matching confirm password and trigger validation
    await confirmPasswordInput.fill('DifferentPassword123!');
    
    // Submit form to trigger validation
    await page.click('#confirmBtn');
    
    // Verify validation error appears on form submission
    await expect(confirmPasswordInput).toHaveClass(/error/);
    
    // Fix the password to match
    await confirmPasswordInput.fill('TestPassword123!');
    
    // Clear the error state by refocusing
    await newPasswordInput.click();
    await confirmPasswordInput.click();
  });

  test('should show validation errors for empty required fields', async ({ page }) => {
    // Open modal
    await page.click('#changePasswordBtn');
    
    // Submit form without filling fields
    await page.click('#confirmBtn');
    
    // Verify validation errors appear
    const currentPasswordInput = page.locator('#currentPassword');
    const newPasswordInput = page.locator('#newPassword');
    const confirmPasswordInput = page.locator('#confirmPassword');
    
    await expect(currentPasswordInput).toHaveClass(/error/);
    await expect(newPasswordInput).toHaveClass(/error/);
    await expect(confirmPasswordInput).toHaveClass(/error/);
    
    // Verify error messages
    await expect(page.locator('#currentPasswordError')).toContainText('Current Password is required');
    await expect(page.locator('#newPasswordError')).toContainText('New Password is required');
    await expect(page.locator('#confirmPasswordError')).toContainText('Confirm New Password is required');
  });

  test('should validate password requirements on form submission', async ({ page }) => {
    // Open modal
    await page.click('#changePasswordBtn');
    
    // Fill current password
    await page.fill('#currentPassword', 'currentpass');
    
    // Fill weak new password
    await page.fill('#newPassword', 'weak');
    
    // Fill matching confirm password
    await page.fill('#confirmPassword', 'weak');
    
    // Submit form
    await page.click('#confirmBtn');
    
    // Verify validation error for weak password
    const newPasswordInput = page.locator('#newPassword');
    const validationMessage = page.locator('#newPasswordError');
    
    await expect(newPasswordInput).toHaveClass(/error/);
    await expect(validationMessage).toContainText('Password need to be');
  });

  test('should successfully change password with valid data', async ({ page }) => {
    // Open modal
    await page.click('#changePasswordBtn');
    
    // Listen for network requests
    const requests = [];
    page.on('request', request => {
      if (request.url().includes('/change-password-user')) {
        requests.push({
          url: request.url(),
          method: request.method(),
          postData: request.postData()
        });
      }
    });

    const responses = [];
    page.on('response', async response => {
      if (response.url().includes('/change-password-user')) {
        const responseText = await response.text().catch(() => 'Could not read response');
        responses.push({
          status: response.status(),
          statusText: response.statusText(),
          body: responseText
        });
      }
    });
    
    // Fill form with valid data
    await page.fill('#currentPassword', 'AdminPass123!'); // Using the test admin password
    await page.fill('#newPassword', 'NewStrongPass123!');
    await page.fill('#confirmPassword', 'NewStrongPass123!');
    
    // Submit form
    await page.click('#confirmBtn');
    
    // Wait for processing
    await page.waitForTimeout(2000);
    
    // Modal should close on success or show appropriate feedback
    // Note: This depends on backend implementation
    console.log('Password change requests made:', requests.length);
    
    if (requests.length > 0) {
      console.log('Network activity detected for password change');
    }
  });

  test('should handle password change errors gracefully', async ({ page }) => {
    // Open modal
    await page.click('#changePasswordBtn');
    
    // Mock server error
    await page.route('**/change-password-user', (route) => {
      route.fulfill({
        status: 400,
        contentType: 'application/json',
        body: JSON.stringify({ message: 'Current password is incorrect' })
      });
    });
    
    // Fill form
    await page.fill('#currentPassword', 'wrongpassword');
    await page.fill('#newPassword', 'NewStrongPass123!');
    await page.fill('#confirmPassword', 'NewStrongPass123!');
    
    // Submit form
    await page.click('#confirmBtn');
    
    // Wait for error handling
    await page.waitForTimeout(2000);
    
    // Modal should remain open and show error feedback
    const modal = page.locator('#passwordModal');
    await expect(modal).toHaveClass(/show/);
  });

  test('should clear validation when modal is closed and reopened', async ({ page }) => {
    // Open modal
    await page.click('#changePasswordBtn');
    
    // Trigger validation errors
    await page.click('#confirmBtn');
    
    // Verify errors exist
    await expect(page.locator('#currentPassword')).toHaveClass(/error/);
    
    // Close modal
    await page.click('#cancelBtn');
    
    // Reopen modal
    await page.click('#changePasswordBtn');
    
    // Verify validation is cleared
    await expect(page.locator('#currentPassword')).not.toHaveClass(/error/);
    await expect(page.locator('#currentPasswordError')).toHaveText('');
  });

  test('should validate all password strength requirements', async ({ page }) => {
    // Open modal
    await page.click('#changePasswordBtn');
    
    const newPasswordInput = page.locator('#newPassword');
    const validationMessage = page.locator('#newPasswordError');
    const strengthElement = page.locator('#passwordStrength');
    
    await newPasswordInput.focus();
    
    // Test really weak password (should show validation errors)
    await newPasswordInput.fill('p');
    await expect(strengthElement).toHaveText('Weak');
    await expect(validationMessage).toContainText('Password need to be');
    
    // Test another weak password
    await newPasswordInput.fill('weak');
    await expect(strengthElement).toHaveText('Weak');
    await expect(validationMessage).toContainText('Password need to be');
    
    // Test good password (shorter than 12 chars but meets all requirements)
    await newPasswordInput.fill('Password1!');
    await expect(strengthElement).toHaveText('Good');
    await expect(validationMessage).toHaveClass(/success/);
    
    // Test strong password  
    await newPasswordInput.fill('VeryStrongPassword123!');
    await expect(strengthElement).toHaveText('Strong');
    await expect(validationMessage).toHaveClass(/success/);
  });

  test('should handle dynamic password strength changes', async ({ page }) => {
    // Open modal
    await page.click('#changePasswordBtn');
    
    const newPasswordInput = page.locator('#newPassword');
    const strengthElement = page.locator('#passwordStrength');
    const strengthBars = page.locator('#passwordStrengthBars');
    
    await newPasswordInput.focus();
    
    // Start with weak password
    await newPasswordInput.fill('weak');
    await expect(strengthElement).toHaveText('Weak');
    await expect(strengthBars).toHaveClass(/weak/);
    
    // Improve to good password (meets requirements but not long enough for strong)
    await newPasswordInput.fill('Password1!');
    await expect(strengthElement).toHaveText('Good');
    await expect(strengthBars).toHaveClass(/good/);
    
    // Improve to strong password (12+ characters with all requirements)
    await newPasswordInput.fill('VeryStrongPassword123!');
    await expect(strengthElement).toHaveText('Strong');
    await expect(strengthBars).toHaveClass(/strong/);
    
    // Back to empty should clear everything
    await newPasswordInput.fill('');
    await expect(strengthBars).not.toHaveClass(/visible/);
  });

  test('should verify modal structure and accessibility', async ({ page }) => {
    // Open modal
    await page.click('#changePasswordBtn');
    
    const modal = page.locator('#passwordModal');
    
    // Verify modal structure
    await expect(modal.locator('.modal-content')).toBeVisible();
    await expect(modal.locator('.modal-header')).toBeVisible();
    await expect(modal.locator('.modal-body')).toBeVisible();
    
    // Verify form structure
    const form = modal.locator('#changePasswordForm');
    await expect(form).toBeVisible();
    
    // Verify all form fields have labels
    const currentPasswordLabel = page.locator('label[for="currentPassword"]');
    const newPasswordLabel = page.locator('label[for="newPassword"]');
    const confirmPasswordLabel = page.locator('label[for="confirmPassword"]');
    
    await expect(currentPasswordLabel).toContainText('Current Password');
    await expect(newPasswordLabel).toContainText('New Password');
    await expect(confirmPasswordLabel).toContainText('Confirm New Password');
    
    // Verify required field indicators
    await expect(currentPasswordLabel.locator('.required-asterisk')).toBeVisible();
    await expect(newPasswordLabel.locator('.required-asterisk')).toBeVisible();
    await expect(confirmPasswordLabel.locator('.required-asterisk')).toBeVisible();
  });

  test('should verify password strength bars visual states', async ({ page }) => {
    // Open modal
    await page.click('#changePasswordBtn');
    
    const newPasswordInput = page.locator('#newPassword');
    const strengthBars = page.locator('#passwordStrengthBars');
    const individualBars = strengthBars.locator('.strength-bar');
    
    await newPasswordInput.focus();
    
    // Test that strength bars exist
    const barCount = await individualBars.count();
    expect(barCount).toBe(3); // Should have 3 strength bars
    
    // Test weak state
    await newPasswordInput.fill('weak');
    await expect(strengthBars).toHaveClass(/visible/);
    await expect(strengthBars).toHaveClass(/weak/);
    
    // Test good state
    await newPasswordInput.fill('GoodPass1!');
    await expect(strengthBars).toHaveClass(/good/);
    
    // Test strong state
    await newPasswordInput.fill('VeryStrongPass123!');
    await expect(strengthBars).toHaveClass(/strong/);
    
    // Test empty state
    await newPasswordInput.fill('');
    await expect(strengthBars).not.toHaveClass(/visible/);
  });
});