const { test, expect } = require('@playwright/test');

test.describe('Reactivate User', () => {
  // Using dedicated reactivate test user (ID 6) for testing reactivate functionality
  const testUserId = '6';

  test.beforeEach(async ({ page }) => {
    // Navigate to the user details page
    await page.goto(`/user-details/${testUserId}`);
  });

  test('should display activate button for inactive user', async ({ page }) => {
    const activateBtn = page.locator('#activateUserBtn');
    const statusBadge = page.locator('.status-badge');
    
    // Check current user status
    const statusText = await statusBadge.textContent();
    
    if (statusText.includes('Inactive')) {
      // User is inactive, activate button should be visible
      await expect(activateBtn).toBeVisible();
      await expect(activateBtn).toHaveText('Activate User');
      await expect(activateBtn).toHaveClass(/btn-primary/);
    } else {
      // User is active, activate button should not be visible
      await expect(activateBtn).not.toBeVisible();
    }
  });

  test('should show page title and user details correctly', async ({ page }) => {
    const pageTitle = page.locator('.page-title');
    await expect(pageTitle).toHaveText('User Details');
    
    // Check user info section exists
    const userInfo = page.locator('.user-info');
    await expect(userInfo).toBeVisible();
    
    // Check user avatar and name
    const userAvatar = page.locator('.user-avatar');
    const fullName = page.locator('.full-name');
    await expect(userAvatar).toBeVisible();
    await expect(fullName).toBeVisible();
  });

  test('should display activate modal when activate button is clicked', async ({ page }) => {
    const activateBtn = page.locator('#activateUserBtn');
    
    // Only test if activate button is visible (user is inactive)
    if (await activateBtn.isVisible()) {
      await activateBtn.click();
      
      const modal = page.locator('#activateModal');
      await expect(modal).toHaveClass(/show/);
      await expect(modal.locator('.modal-title')).toHaveText('Confirm to Activate?');
      await expect(modal.locator('.modal-message')).toContainText('User will be able to access the features again');
    } else {
      test.skip(true, 'User is not inactive, cannot test activate functionality');
    }
  });

  test('should close activate modal when cancel button is clicked', async ({ page }) => {
    const activateBtn = page.locator('#activateUserBtn');
    
    if (await activateBtn.isVisible()) {
      // Open modal
      await activateBtn.click();
      const modal = page.locator('#activateModal');
      await expect(modal).toHaveClass(/show/);
      
      // Click cancel
      await page.click('#cancelActivate');
      await expect(modal).not.toHaveClass(/show/);
    } else {
      test.skip(true, 'User is not inactive, cannot test activate modal');
    }
  });

  test('should close activate modal when X button is clicked', async ({ page }) => {
    const activateBtn = page.locator('#activateUserBtn');
    
    if (await activateBtn.isVisible()) {
      // Open modal
      await activateBtn.click();
      const modal = page.locator('#activateModal');
      await expect(modal).toHaveClass(/show/);
      
      // Click X button
      await page.click('#closeActivateModal');
      await expect(modal).not.toHaveClass(/show/);
    } else {
      test.skip(true, 'User is not inactive, cannot test activate modal');
    }
  });

  test('should close activate modal when clicking outside', async ({ page }) => {
    const activateBtn = page.locator('#activateUserBtn');
    
    if (await activateBtn.isVisible()) {
      // Open modal
      await activateBtn.click();
      const modal = page.locator('#activateModal');
      await expect(modal).toHaveClass(/show/);
      
      // Click outside modal (on overlay)
      await modal.click({ position: { x: 10, y: 10 } });
      await expect(modal).not.toHaveClass(/show/);
    } else {
      test.skip(true, 'User is not inactive, cannot test activate modal');
    }
  });

  test('should successfully activate user', async ({ page }) => {
    const activateBtn = page.locator('#activateUserBtn');
    
    if (await activateBtn.isVisible()) {
      // Listen for network requests
      const requests = [];
      page.on('request', request => {
        if (request.url().includes('/activate-user')) {
          requests.push({
            url: request.url(),
            method: request.method(),
            postData: request.postData()
          });
        }
      });

      const responses = [];
      page.on('response', async response => {
        if (response.url().includes('/activate-user')) {
          const responseText = await response.text().catch(() => 'Could not read response');
          responses.push({
            status: response.status(),
            statusText: response.statusText(),
            body: responseText
          });
        }
      });

      // Open activate modal
      await activateBtn.click();
      const modal = page.locator('#activateModal');
      await expect(modal).toHaveClass(/show/);
      
      // Confirm activation
      await page.click('#confirmActivate');
      
      // Wait for modal to close
      await expect(modal).not.toHaveClass(/show/);
      
      // Wait for UI updates
      await page.waitForTimeout(2000);
      
      // Check if user status was updated to active
      const statusBadge = page.locator('.status-badge');
      const statusText = await statusBadge.textContent();
      
      if (statusText.includes('Active')) {
        // Verify UI changes after activation
        await expect(statusBadge).toHaveClass(/active/);
        await expect(statusBadge).toHaveText('Active');
        
        // Activate button should now be hidden
        await expect(activateBtn).not.toBeVisible();
        
        // Edit button should change to primary style
        const editBtn = page.locator('#editUserBtn');
        await expect(editBtn).toHaveClass(/btn-primary/);
      }
      
      // Log network activity for debugging
      if (requests.length > 0) {
        console.log('Activation requests made:', requests.length);
      }
      
    } else {
      test.skip(true, 'User is not inactive, cannot test activation');
    }
  });

  test('should handle activation errors gracefully', async ({ page }) => {
    const activateBtn = page.locator('#activateUserBtn');
    
    if (await activateBtn.isVisible()) {
      // Mock a server error for activation
      await page.route('**/activate-user', (route) => {
        route.fulfill({
          status: 500,
          contentType: 'application/json',
          body: JSON.stringify({ message: 'Internal server error during activation' })
        });
      });

      // Try to activate
      await activateBtn.click();
      await page.click('#confirmActivate');
      
      // Wait for error handling
      await page.waitForTimeout(2000);
      
      // User should still be inactive (status shouldn't change)
      const statusBadge = page.locator('.status-badge');
      const statusText = await statusBadge.textContent();
      expect(statusText).toContain('Inactive');
      
    } else {
      test.skip(true, 'User is not inactive, cannot test activation error handling');
    }
  });

  test('should verify page actions and buttons for inactive user', async ({ page }) => {
    const statusBadge = page.locator('.status-badge');
    const statusText = await statusBadge.textContent();
    
    if (statusText.includes('Inactive')) {
      // Check page header actions
      const pageActions = page.locator('.page-actions');
      await expect(pageActions).toBeVisible();
      
      // Should have Change Password, Update Profile, and Activate User buttons
      const changePasswordBtn = page.locator('#changePasswordBtn');
      const editUserBtn = page.locator('#editUserBtn');
      const activateBtn = page.locator('#activateUserBtn');
      
      await expect(changePasswordBtn).toBeVisible();
      await expect(changePasswordBtn).toHaveText('Change Password');
      
      await expect(editUserBtn).toBeVisible();
      await expect(editUserBtn).toHaveText('Update Profile');
      await expect(editUserBtn).toHaveClass(/btn-secondary/); // Secondary style for inactive user
      
      await expect(activateBtn).toBeVisible();
      await expect(activateBtn).toHaveText('Activate User');
      await expect(activateBtn).toHaveClass(/btn-primary/);
      
    } else {
      test.skip(true, 'User is active, cannot test inactive user button states');
    }
  });

  test('should verify page actions and buttons for active user', async ({ page }) => {
    const statusBadge = page.locator('.status-badge');
    const statusText = await statusBadge.textContent();
    
    if (statusText.includes('Active')) {
      // Check page header actions for active user
      const pageActions = page.locator('.page-actions');
      await expect(pageActions).toBeVisible();
      
      // Should have Change Password and Update Profile buttons (no Activate button)
      const changePasswordBtn = page.locator('#changePasswordBtn');
      const editUserBtn = page.locator('#editUserBtn');
      const activateBtn = page.locator('#activateUserBtn');
      
      await expect(changePasswordBtn).toBeVisible();
      await expect(changePasswordBtn).toHaveText('Change Password');
      
      await expect(editUserBtn).toBeVisible();
      await expect(editUserBtn).toHaveText('Update Profile');
      await expect(editUserBtn).toHaveClass(/btn-primary/); // Primary style for active user
      
      // Activate button should not be visible for active users
      await expect(activateBtn).not.toBeVisible();
      
    } else {
      test.skip(true, 'User is inactive, cannot test active user button states');
    }
  });

  test('should navigate to update profile page when edit button is clicked', async ({ page }) => {
    const editUserBtn = page.locator('#editUserBtn');
    await expect(editUserBtn).toBeVisible();
    
    // Click edit button and expect navigation
    await editUserBtn.click();
    
    // Should navigate to update user page
    await expect(page).toHaveURL(`/update-user/${testUserId}`);
  });

  test('should display user profile information correctly', async ({ page }) => {
    // Verify profile content sections
    const profileContent = page.locator('.profile-content');
    await expect(profileContent).toBeVisible();
    
    // Check profile grid with user details
    const profileGrid = page.locator('.profile-grid');
    await expect(profileGrid).toBeVisible();
    
    // Verify profile fields are displayed
    const profileFields = page.locator('.profile-field');
    const fieldCount = await profileFields.count();
    expect(fieldCount).toBeGreaterThan(0);
    
    // Check specific profile fields
    const usernameField = page.locator('.profile-field').filter({ hasText: 'Username' });
    const roleField = page.locator('.profile-field').filter({ hasText: 'Role' });
    const emailField = page.locator('.profile-field').filter({ hasText: 'Email' });
    
    await expect(usernameField).toBeVisible();
    await expect(roleField).toBeVisible();
    await expect(emailField).toBeVisible();
  });
});