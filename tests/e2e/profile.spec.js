const { test, expect } = require('@playwright/test');

test.describe('Profile Page', () => {
  // Using admin user for testing profile page display
  
  test.beforeEach(async ({ page }) => {
    // Navigate to the profile page
    await page.goto('/profile');
  });

  test('should display page title and navigation correctly', async ({ page }) => {
    // Verify page title
    const pageTitle = page.locator('.page-title');
    await expect(pageTitle).toHaveText('Profile');
    
    // Verify breadcrumb navigation
    const breadcrumb = page.locator('.breadcrumb');
    await expect(breadcrumb).toBeVisible();
    
    // Check breadcrumb items
    const homeLink = page.locator('.breadcrumb-item').first();
    const activeItem = page.locator('.breadcrumb-item.active');
    
    await expect(homeLink).toHaveText('Home');
    await expect(activeItem).toHaveText('Profile');
  });

  test('should display change password button correctly', async ({ page }) => {
    const changePasswordBtn = page.locator('#changePasswordBtn');
    await expect(changePasswordBtn).toBeVisible();
    await expect(changePasswordBtn).toHaveText('Change Password');
    await expect(changePasswordBtn).toHaveClass(/btn-primary/);
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

  test('should verify change password modal closes correctly', async ({ page }) => {
    // Open modal
    const changePasswordBtn = page.locator('#changePasswordBtn');
    await changePasswordBtn.click();
    
    const modal = page.locator('#passwordModal');
    await expect(modal).toHaveClass(/show/);
    
    // Test close button
    await page.click('#closeModal');
    await expect(modal).not.toHaveClass(/show/);
    
    // Test cancel button
    await changePasswordBtn.click();
    await expect(modal).toHaveClass(/show/);
    await page.click('#cancelBtn');
    await expect(modal).not.toHaveClass(/show/);
    
    // Test clicking outside modal
    await changePasswordBtn.click();
    await expect(modal).toHaveClass(/show/);
    await modal.click({ position: { x: 5, y: 5 } });
    await expect(modal).not.toHaveClass(/show/);
  });

  test('should verify user details structure matches profile data', async ({ page }) => {
    // Verify user info section structure
    const userDetails = page.locator('.user-details');
    await expect(userDetails).toBeVisible();
    
    // Check that full name and user ID are displayed
    const fullName = page.locator('.full-name');
    const userId = page.locator('.user-id');
    
    await expect(fullName).toBeVisible();
    await expect(userId).toBeVisible();
    
    // Verify the user ID format
    const userIdText = await userId.textContent();
    expect(userIdText).toMatch(/^User ID: \d+$/);
  });

  test('should verify page header structure', async ({ page }) => {
    const pageHeader = page.locator('.page-header');
    await expect(pageHeader).toBeVisible();
    
    // Check that both title and button are in header
    const titleInHeader = pageHeader.locator('.page-title');
    const buttonInHeader = pageHeader.locator('#changePasswordBtn');
    
    await expect(titleInHeader).toBeVisible();
    await expect(buttonInHeader).toBeVisible();
  });

  test('should verify breadcrumb navigation structure', async ({ page }) => {
    const breadcrumb = page.locator('.breadcrumb');
    
    // Check breadcrumb separator exists
    const separator = breadcrumb.locator('.breadcrumb-separator');
    await expect(separator).toBeVisible();
    
    // Check separator contains arrow image
    const arrowImage = separator.locator('img[alt="Breadcrumb Arrow"]');
    await expect(arrowImage).toBeVisible();
    
    // Verify breadcrumb link is clickable
    const homeLink = breadcrumb.locator('a.breadcrumb-item');
    await expect(homeLink).toHaveAttribute('href', '/');
  });
});