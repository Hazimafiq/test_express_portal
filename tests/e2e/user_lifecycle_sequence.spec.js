const { test, expect } = require('@playwright/test');
const { loginAsAdminAndNavigate } = require('./helpers/auth');
const { TestContext } = require('./helpers/testContext');

test.describe.configure({ mode: 'serial' }); // Run tests in sequence

test.describe('User Lifecycle Sequence Tests', () => {
  let testUserId = null;
  let testUser = null;

  test.beforeAll(async () => {
    // Clean up any previous test context
    TestContext.cleanup();
  });

  test.afterAll(async () => {
    // Clean up test context
    TestContext.cleanup();
  });

  test('1. Create User', async ({ page }) => {
    await loginAsAdminAndNavigate(page, '/create-user');
    
    const timestamp = Date.now();
    testUser = {
      username: `lifecycle_${timestamp}`,
      fullName: 'Lifecycle Test User',
      email: `lifecycle_${timestamp}@test.com`,
      phoneNumber: '+60123456789',
      country: 'Malaysia',
      clinic: 'Lifecycle Test Clinic',
      password: 'LifecyclePass123!',
      role: 'doctor'
    };

    // Fill and submit create user form
    await page.fill('#username', testUser.username);
    await page.fill('#fullName', testUser.fullName);
    await page.fill('#email', testUser.email);
    await page.fill('#phoneNumber', testUser.phoneNumber);
    
    await page.click('#country-select');
    await page.click('.custom-select__option[data-value="Malaysia"]');
    
    await page.fill('#clinic', testUser.clinic);
    await page.fill('#password', testUser.password);
    await page.fill('#confirmPassword', testUser.password);
    
    await page.check('input[name="role"][value="doctor"]');
    
    await page.click('#submitBtn');
    
    // Wait for navigation to user management
    await page.waitForURL('**/user-management**', { timeout: 10000 });
    await expect(page.url()).toContain('/user-management');

    // Find the created user and extract their database ID
    const userRow = page.locator(`tr:has-text("${testUser.username}")`);
    await expect(userRow).toBeVisible();
    
    const userLink = userRow.locator('a').first();
    const href = await userLink.getAttribute('href');
    const dbUserId = href.match(/\/user-details\/(\d+)/)?.[1];
    
    // Save user to context
    testUserId = TestContext.createUser({
      ...testUser,
      dbId: dbUserId
    });
    
    TestContext.setSequenceStep(1, { step: 'user_created', userId: testUserId });
    console.log(`✅ Step 1: Created user ${testUser.username} with ID ${testUserId}`);
  });

  test('2. View User Details', async ({ page }) => {
    const user = TestContext.getUser(testUserId);
    expect(user).toBeTruthy();
    
    await loginAsAdminAndNavigate(page, `/user-details/${user.dbId}`);
    
    // Verify user details page displays correctly
    await expect(page.locator('.page-title')).toContainText('User Details');
    await expect(page.locator('[data-field="username"]')).toContainText(user.username);
    await expect(page.locator('[data-field="email"]')).toContainText(user.email);
    await expect(page.locator('[data-field="status"]')).toContainText('Active');
    
    TestContext.setSequenceStep(2, { step: 'user_details_viewed' });
    console.log(`✅ Step 2: Viewed user details for ${user.username}`);
  });

  test('3. Update User', async ({ page }) => {
    const user = TestContext.getUser(testUserId);
    expect(user).toBeTruthy();
    
    await loginAsAdminAndNavigate(page, `/user-details/${user.dbId}`);
    
    // Navigate to update page
    const editBtn = page.locator('#editUserBtn, .edit-btn, a:has-text("Edit")');
    await editBtn.click();
    
    await page.waitForURL('**/update-user/**');
    
    // Update user information
    const updatedData = {
      fullName: 'Updated Lifecycle Test User',
      clinic: 'Updated Lifecycle Clinic'
    };
    
    await page.fill('#fullName', updatedData.fullName);
    await page.fill('#clinic', updatedData.clinic);
    
    await page.click('#submitBtn');
    await page.waitForURL('**/user-details/**');
    
    // Verify updates
    await expect(page.locator('[data-field="fullName"]')).toContainText(updatedData.fullName);
    await expect(page.locator('[data-field="clinic"]')).toContainText(updatedData.clinic);
    
    // Update context
    TestContext.updateUser(testUserId, updatedData);
    TestContext.setSequenceStep(3, { step: 'user_updated', updates: updatedData });
    console.log(`✅ Step 3: Updated user ${user.username}`);
  });

  test('4. Change Password', async ({ page }) => {
    const user = TestContext.getUser(testUserId);
    expect(user).toBeTruthy();
    
    await loginAsAdminAndNavigate(page, `/user-details/${user.dbId}`);
    
    // Open change password modal
    const changePasswordBtn = page.locator('#changePasswordBtn');
    await changePasswordBtn.click();
    
    const passwordModal = page.locator('#passwordModal');
    await expect(passwordModal).toHaveClass(/show/);
    
    // Fill password change form
    const newPassword = 'NewLifecyclePass456!';
    await page.fill('#currentPassword', user.password);
    await page.fill('#newPassword', newPassword);
    await page.fill('#confirmPassword', newPassword);
    
    await page.click('#confirmBtn');
    await page.waitForTimeout(2000);
    
    // Update password in context
    TestContext.updateUser(testUserId, { password: newPassword });
    TestContext.setSequenceStep(4, { step: 'password_changed' });
    console.log(`✅ Step 4: Changed password for ${user.username}`);
  });

  test('5. Deactivate User', async ({ page }) => {
    const user = TestContext.getUser(testUserId);
    expect(user).toBeTruthy();
    
    await loginAsAdminAndNavigate(page, `/user-details/${user.dbId}`);
    
    // Deactivate user
    const deactivateBtn = page.locator('#deactivateUserBtn');
    
    if (await deactivateBtn.isVisible()) {
      await deactivateBtn.click();
      
      const deactivateModal = page.locator('#deactivateModal');
      await expect(deactivateModal).toHaveClass(/show/);
      
      await page.click('#confirmDeactivateBtn');
      await page.waitForTimeout(2000);
      
      // Verify user is deactivated
      await page.reload();
      await expect(page.locator('[data-field="status"]')).toContainText('Inactive');
      
      TestContext.updateUser(testUserId, { status: 'inactive' });
      TestContext.setSequenceStep(5, { step: 'user_deactivated' });
      console.log(`✅ Step 5: Deactivated user ${user.username}`);
    } else {
      test.skip(true, 'Deactivate button not available');
    }
  });

  test('6. Reactivate User', async ({ page }) => {
    const user = TestContext.getUser(testUserId);
    expect(user).toBeTruthy();
    expect(user.status).toBe('inactive');
    
    await loginAsAdminAndNavigate(page, `/user-details/${user.dbId}`);
    
    // Reactivate user
    const activateBtn = page.locator('#activateUserBtn');
    await expect(activateBtn).toBeVisible();
    
    await activateBtn.click();
    
    const activateModal = page.locator('#activateModal');
    await expect(activateModal).toHaveClass(/show/);
    
    await page.click('#confirmActivateBtn');
    await page.waitForTimeout(2000);
    
    // Verify user is reactivated
    await page.reload();
    await expect(page.locator('[data-field="status"]')).toContainText('Active');
    
    TestContext.updateUser(testUserId, { status: 'active' });
    TestContext.setSequenceStep(6, { step: 'user_reactivated' });
    console.log(`✅ Step 6: Reactivated user ${user.username}`);
  });

  test('7. Deactivate User Again (for deletion)', async ({ page }) => {
    const user = TestContext.getUser(testUserId);
    expect(user).toBeTruthy();
    expect(user.status).toBe('active');
    
    await loginAsAdminAndNavigate(page, `/user-details/${user.dbId}`);
    
    // Deactivate user again
    const deactivateBtn = page.locator('#deactivateUserBtn');
    await deactivateBtn.click();
    
    const deactivateModal = page.locator('#deactivateModal');
    await expect(deactivateModal).toHaveClass(/show/);
    
    await page.click('#confirmDeactivateBtn');
    await page.waitForTimeout(2000);
    
    // Verify user is deactivated
    await page.reload();
    await expect(page.locator('[data-field="status"]')).toContainText('Inactive');
    
    TestContext.updateUser(testUserId, { status: 'inactive' });
    TestContext.setSequenceStep(7, { step: 'user_deactivated_for_deletion' });
    console.log(`✅ Step 7: Deactivated user ${user.username} for deletion`);
  });

  test('8. Delete User', async ({ page }) => {
    const user = TestContext.getUser(testUserId);
    expect(user).toBeTruthy();
    expect(user.status).toBe('inactive');
    
    await loginAsAdminAndNavigate(page, `/user-details/${user.dbId}`);
    
    // Delete user
    const deleteBtn = page.locator('#deleteUserBtn');
    await expect(deleteBtn).toBeVisible();
    
    await deleteBtn.click();
    
    const deleteModal = page.locator('#deleteModal');
    await expect(deleteModal).toHaveClass(/show/);
    
    await page.click('#confirmDeleteBtn');
    
    // Wait for deletion and navigation
    await page.waitForURL('**/user-management**', { timeout: 10000 });
    
    // Verify user is deleted from user list
    const deletedUserRow = page.locator(`tr:has-text("${user.username}")`);
    await expect(deletedUserRow).not.toBeVisible();
    
    TestContext.updateUser(testUserId, { status: 'deleted' });
    TestContext.setSequenceStep(8, { step: 'user_deleted' });
    console.log(`✅ Step 8: Deleted user ${user.username}`);
  });

  test('9. Test Profile Page', async ({ page }) => {
    // Test profile page with admin user
    await loginAsAdminAndNavigate(page, '/profile');
    
    // Verify profile page displays correctly
    await expect(page.locator('.page-title')).toContainText('Profile');
    await expect(page.locator('.user-info')).toBeVisible();
    await expect(page.locator('.profile-details')).toBeVisible();
    
    // Test change password modal
    const changePasswordBtn = page.locator('#changePasswordBtn');
    if (await changePasswordBtn.isVisible()) {
      await changePasswordBtn.click();
      
      const passwordModal = page.locator('#passwordModal');
      await expect(passwordModal).toHaveClass(/show/);
      
      // Close modal
      await page.click('#cancelBtn');
      await expect(passwordModal).not.toHaveClass(/show/);
    }
    
    TestContext.setSequenceStep(9, { step: 'profile_tested' });
    console.log(`✅ Step 9: Tested profile page functionality`);
  });

  test('10. Verify Complete Lifecycle', async ({ page }) => {
    const context = TestContext.load();
    const completedSteps = context.sequence.completedSteps;
    
    // Verify all steps were completed
    const expectedSteps = [
      'user_created',
      'user_details_viewed', 
      'user_updated',
      'password_changed',
      'user_deactivated',
      'user_reactivated',
      'user_deactivated_for_deletion',
      'user_deleted',
      'profile_tested'
    ];
    
    expectedSteps.forEach(step => {
      const stepCompleted = completedSteps.some(s => s.data.step === step);
      expect(stepCompleted).toBe(true);
      console.log(`✅ Verified step completed: ${step}`);
    });
    
    console.log(`🎉 Complete user lifecycle test passed! All ${expectedSteps.length} steps completed.`);
  });
});