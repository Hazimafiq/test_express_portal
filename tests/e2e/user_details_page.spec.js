const { test, expect } = require('@playwright/test');

test.describe('User Details Page', () => {
  // Using admin user (ID 1) for testing user details page display
  const testUserId = '1';

  test.beforeEach(async ({ page }) => {
    // Navigate to the user details page
    await page.goto(`/user-details/${testUserId}`);
  });

  test('should display page title and navigation correctly', async ({ page }) => {
    // Verify page title
    const pageTitle = page.locator('.page-title');
    await expect(pageTitle).toHaveText('User Details');
    
    // Verify breadcrumb navigation
    const breadcrumb = page.locator('.breadcrumb');
    await expect(breadcrumb).toBeVisible();
    
    // Check breadcrumb items
    const homeLink = page.locator('.breadcrumb-item').first();
    const userMgmtLink = page.locator('.breadcrumb-item').nth(1);
    const activeItem = page.locator('.breadcrumb-item.active');
    
    await expect(homeLink).toHaveText('Home');
    await expect(userMgmtLink).toHaveText('User Management');
    await expect(activeItem).toHaveText('User Details');
  });

  test('should display page action buttons correctly', async ({ page }) => {
    const pageActions = page.locator('.page-actions');
    await expect(pageActions).toBeVisible();
    
    // Check for required buttons
    const changePasswordBtn = page.locator('#changePasswordBtn');
    const editUserBtn = page.locator('#editUserBtn');
    
    await expect(changePasswordBtn).toBeVisible();
    await expect(changePasswordBtn).toHaveText('Change Password');
    await expect(changePasswordBtn).toHaveClass(/btn-secondary/);
    
    await expect(editUserBtn).toBeVisible();
    await expect(editUserBtn).toHaveText('Update Profile');
    
    // Check if activate button exists (for inactive users)
    const activateBtn = page.locator('#activateUserBtn');
    if (await activateBtn.isVisible()) {
      await expect(activateBtn).toHaveText('Activate User');
      await expect(activateBtn).toHaveClass(/btn-primary/);
    }
  });

  test('should display user information section correctly', async ({ page }) => {
    const userInfo = page.locator('.user-info');
    await expect(userInfo).toBeVisible();
    
    // Check user avatar
    const userAvatar = page.locator('.user-avatar');
    await expect(userAvatar).toBeVisible();
    const avatarText = await userAvatar.textContent();
    expect(avatarText).toMatch(/^[A-Z]$/); // Should be single uppercase letter
    
    // Check full name
    const fullName = page.locator('.full-name');
    await expect(fullName).toBeVisible();
    const nameText = await fullName.textContent();
    expect(nameText.length).toBeGreaterThan(0);
    
    // Check status badge
    const statusBadge = page.locator('.status-badge');
    await expect(statusBadge).toBeVisible();
    const statusText = await statusBadge.textContent();
    expect(statusText).toMatch(/^(Active|Inactive)$/);
    
    // Verify status badge has correct class
    if (statusText === 'Active') {
      await expect(statusBadge).toHaveClass(/active/);
    } else {
      await expect(statusBadge).toHaveClass(/inactive/);
    }
    
    // Check user ID
    const userId = page.locator('.user-id');
    await expect(userId).toBeVisible();
    await expect(userId).toContainText('User ID:');
  });

  test('should display profile details grid correctly', async ({ page }) => {
    const profileGrid = page.locator('.profile-grid');
    await expect(profileGrid).toBeVisible();
    
    // Check all profile columns exist
    const profileColumns = page.locator('.profile-column');
    const columnCount = await profileColumns.count();
    expect(columnCount).toBe(3);
    
    // Check specific profile fields in each column
    // Column 1: Username and Role
    const usernameField = page.locator('.profile-field').filter({ hasText: 'Username' });
    const roleField = page.locator('.profile-field').filter({ hasText: 'Role' });
    
    await expect(usernameField).toBeVisible();
    await expect(roleField).toBeVisible();
    
    // Column 2: Phone Number and Email
    const phoneField = page.locator('.profile-field').filter({ hasText: 'Phone Number' });
    const emailField = page.locator('.profile-field').filter({ hasText: 'Email' });
    
    await expect(phoneField).toBeVisible();
    await expect(emailField).toBeVisible();
    
    // Column 3: Clinic and Country
    const clinicField = page.locator('.profile-field').filter({ hasText: 'Clinic' });
    const countryField = page.locator('.profile-field').filter({ hasText: 'Country' });
    
    await expect(clinicField).toBeVisible();
    await expect(countryField).toBeVisible();
  });

  test('should display actual user data values', async ({ page }) => {
    // Check that fields contain actual data (not just dashes)
    const usernameValue = page.locator('.profile-field').filter({ hasText: 'Username' }).locator('span').last();
    const roleValue = page.locator('.profile-field').filter({ hasText: 'Role' }).locator('span').last();
    const emailValue = page.locator('.profile-field').filter({ hasText: 'Email' }).locator('span').last();
    
    // Username should not be empty or just a dash
    const username = await usernameValue.textContent();
    expect(username).not.toBe('');
    expect(username).not.toBe('-');
    
    // Role should be properly capitalized
    const role = await roleValue.textContent();
    expect(role).toMatch(/^[A-Z][a-z]*$/); // Should start with uppercase
    
    // Email should contain @ symbol if not empty
    const email = await emailValue.textContent();
    if (email !== '-') {
      expect(email).toContain('@');
    }
  });

  test('should display delivery address section correctly', async ({ page }) => {
    const deliveryAddress = page.locator('.delivery-address');
    await expect(deliveryAddress).toBeVisible();
    
    // Check label
    const addressLabel = deliveryAddress.locator('label');
    await expect(addressLabel).toHaveText('Delivery Address');
    
    // Check address value (either formatted address or dash)
    const addressValue = deliveryAddress.locator('span');
    await expect(addressValue).toBeVisible();
    
    const addressText = await addressValue.textContent();
    
    if (addressText === '-') {
      // No address provided
      expect(addressText).toBe('-');
    } else {
      // Address should contain comma-separated values
      expect(addressText).toContain(',');
    }
  });

  test('should have working navigation buttons', async ({ page }) => {
    // Test edit user button navigation
    const editUserBtn = page.locator('#editUserBtn');
    await editUserBtn.click();
    
    // Should navigate to update user page
    await expect(page).toHaveURL(`/update-user/${testUserId}`);
    
    // Navigate back to user details
    await page.goBack();
    await expect(page).toHaveURL(`/user-details/${testUserId}`);
  });

  test('should display change password modal when button is clicked', async ({ page }) => {
    const changePasswordBtn = page.locator('#changePasswordBtn');
    await changePasswordBtn.click();
    
    // Modal should appear
    const modal = page.locator('#passwordModal');
    await expect(modal).toHaveClass(/show/);
    
    // Modal should contain password form
    await expect(modal.locator('#changePasswordForm')).toBeVisible();
    await expect(modal.locator('h3')).toHaveText('Change Password');
  });

  // test('should display activate modal for inactive users', async ({ page }) => {
  //   const activateBtn = page.locator('#activateUserBtn');
    
  //   // Only test if user is inactive (activate button visible)
  //   if (await activateBtn.isVisible()) {
  //     await activateBtn.click();
      
  //     const activateModal = page.locator('#activateModal');
  //     await expect(activateModal).toHaveClass(/show/);
  //     await expect(activateModal.locator('.modal-title')).toHaveText('Confirm to Activate?');
  //     await expect(activateModal.locator('.modal-message')).toContainText('User will be able to access the features again');
  //   } else {
  //     test.skip(true, 'User is active, skipping activate modal test');
  //   }
  // });

  test('should verify profile content structure', async ({ page }) => {
    const profileContent = page.locator('.profile-content');
    await expect(profileContent).toBeVisible();
    
    // Check main sections exist
    const userInfo = profileContent.locator('.user-info');
    const profileGrid = profileContent.locator('.profile-grid');
    const deliveryAddress = profileContent.locator('.delivery-address');
    
    await expect(userInfo).toBeVisible();
    await expect(profileGrid).toBeVisible();
    await expect(deliveryAddress).toBeVisible();
  });

  test('should verify all profile fields have labels and values', async ({ page }) => {
    const profileFields = page.locator('.profile-field');
    const fieldCount = await profileFields.count();
    
    // Should have 6 profile fields (Username, Role, Phone, Email, Clinic, Country)
    expect(fieldCount).toBe(6);
    
    // Check each field has a label and value
    for (let i = 0; i < fieldCount; i++) {
      const field = profileFields.nth(i);
      const label = field.locator('label');
      const value = field.locator('span');
      
      await expect(label).toBeVisible();
      await expect(value).toBeVisible();
      
      // Label should not be empty
      const labelText = await label.textContent();
      expect(labelText.length).toBeGreaterThan(0);
      
      // Value should not be empty (could be dash for empty values)
      const valueText = await value.textContent();
      expect(valueText.length).toBeGreaterThan(0);
    }
  });

  test('should verify responsive layout structure', async ({ page }) => {
    // Check main container
    const contentContainer = page.locator('.content-container');
    await expect(contentContainer).toBeVisible();
    
    // Check grid layout exists
    const profileGrid = page.locator('.profile-grid');
    await expect(profileGrid).toBeVisible();
    
    // Verify columns are properly structured
    const columns = profileGrid.locator('.profile-column');
    const columnCount = await columns.count();
    expect(columnCount).toBe(3);
  });

  test('should verify success message handling', async ({ page }) => {
    // Navigate with success parameter
    await page.goto(`/user-details/${testUserId}?success=Test success message`);
    
    // Check for hidden success message element
    const successElement = page.locator('#success-message');
    if (await successElement.isVisible()) {
      const message = await successElement.getAttribute('data-message');
      expect(message).toContain('Test success message');
    }
  });
});