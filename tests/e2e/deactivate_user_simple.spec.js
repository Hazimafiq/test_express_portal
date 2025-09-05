const { test, expect } = require('@playwright/test');

test.describe('Deactivate User Modal Tests', () => {
  // Using admin user (ID 1) for testing modal functionality only
  // NOTE: These tests only test UI interactions, not actual deactivation
  const testUserId = '1';

  test.beforeEach(async ({ page }) => {
    // Navigate to the admin user's update page for modal testing
    await page.goto(`/update-user/${testUserId}`);
  });

  test('should display deactivate button for active user', async ({ page }) => {
    const deactivateBtn = page.locator('#deactivateBtn');
    
    // Check if button exists (depends on user status)
    if (await deactivateBtn.isVisible()) {
      await expect(deactivateBtn).toHaveText('Deactivate User');
    } else {
      // User might already be deactivated, check for delete button
      const deleteBtn = page.locator('#deleteBtn');
      if (await deleteBtn.isVisible()) {
        await expect(deleteBtn).toHaveText('Delete User');
      }
    }
  });

  test('should show deactivate modal when button is clicked', async ({ page }) => {
    const deactivateBtn = page.locator('#deactivateBtn');
    
    if (await deactivateBtn.isVisible()) {
      await deactivateBtn.click();
      
      const modal = page.locator('#deactivateModal');
      await expect(modal).toHaveClass(/show/);
      await expect(modal.locator('.modal-title')).toHaveText('Confirm to Deactivate?');
      await expect(modal.locator('.modal-message')).toContainText('User will not be able to access the features once the account is deactivated');
    } else {
      test.skip(true, 'User is not in active state, cannot test deactivate modal');
    }
  });

  test('should close modal when cancel button is clicked', async ({ page }) => {
    const deactivateBtn = page.locator('#deactivateBtn');
    
    if (await deactivateBtn.isVisible()) {
      // Open modal
      await deactivateBtn.click();
      const modal = page.locator('#deactivateModal');
      await expect(modal).toHaveClass(/show/);
      
      // Click cancel
      await page.click('#cancelDeactivate');
      await expect(modal).not.toHaveClass(/show/);
    } else {
      test.skip(true, 'User is not in active state, cannot test deactivate modal');
    }
  });

  test('should close modal when X button is clicked', async ({ page }) => {
    const deactivateBtn = page.locator('#deactivateBtn');
    
    if (await deactivateBtn.isVisible()) {
      // Open modal
      await deactivateBtn.click();
      const modal = page.locator('#deactivateModal');
      await expect(modal).toHaveClass(/show/);
      
      // Click X button
      await page.click('#closeModal');
      await expect(modal).not.toHaveClass(/show/);
    } else {
      test.skip(true, 'User is not in active state, cannot test deactivate modal');
    }
  });

  test('should close modal when clicking outside', async ({ page }) => {
    const deactivateBtn = page.locator('#deactivateBtn');
    
    if (await deactivateBtn.isVisible()) {
      // Open modal
      await deactivateBtn.click();
      const modal = page.locator('#deactivateModal');
      await expect(modal).toHaveClass(/show/);
      
      // Click outside modal (on overlay)
      await modal.click({ position: { x: 10, y: 10 } });
      await expect(modal).not.toHaveClass(/show/);
    } else {
      test.skip(true, 'User is not in active state, cannot test deactivate modal');
    }
  });

  test('should close modal with Escape key', async ({ page }) => {
    const deactivateBtn = page.locator('#deactivateBtn');
    
    if (await deactivateBtn.isVisible()) {
      // Open modal
      await deactivateBtn.click();
      const modal = page.locator('#deactivateModal');
      await expect(modal).toHaveClass(/show/);
      
      // Press Escape key
      await page.keyboard.press('Escape');
      await expect(modal).not.toHaveClass(/show/);
    } else {
      test.skip(true, 'User is not in active state, cannot test deactivate modal');
    }
  });

  test('should show delete modal when delete button is clicked', async ({ page }) => {
    // Check if delete button is available (user should be deactivated)
    const deleteBtn = page.locator('#deleteBtn');
    
    if (await deleteBtn.isVisible()) {
      await deleteBtn.click();
      
      const deleteModal = page.locator('#deleteModal');
      await expect(deleteModal).toHaveClass(/show/);
      await expect(deleteModal.locator('.modal-title')).toHaveText('Confirm to Delete?');
      await expect(deleteModal.locator('.modal-message')).toContainText('You will not be able to recover this user once it is deleted');
    } else {
      test.skip(true, 'User is not deactivated, cannot test delete functionality');
    }
  });

  test('should close delete modal when cancel is clicked', async ({ page }) => {
    const deleteBtn = page.locator('#deleteBtn');
    
    if (await deleteBtn.isVisible()) {
      await deleteBtn.click();
      
      const deleteModal = page.locator('#deleteModal');
      await expect(deleteModal).toHaveClass(/show/);
      
      // Click cancel
      await page.click('#cancelDelete');
      await expect(deleteModal).not.toHaveClass(/show/);
    } else {
      test.skip(true, 'User is not deactivated, cannot test delete functionality');
    }
  });

  test('should handle modal interactions correctly', async ({ page }) => {
    // Test that modals don't interfere with each other
    const deactivateBtn = page.locator('#deactivateBtn');
    const deleteBtn = page.locator('#deleteBtn');
    
    const hasDeactivate = await deactivateBtn.isVisible();
    const hasDelete = await deleteBtn.isVisible();
    
    // Should have either deactivate OR delete button, not both
    expect(hasDeactivate || hasDelete).toBe(true);
    expect(hasDeactivate && hasDelete).toBe(false);
  });

  test('should display correct modal content based on user status', async ({ page }) => {
    // Check page title to understand context
    const pageTitle = await page.locator('.page-title').textContent();
    expect(pageTitle).toBe('Update Profile');
    
    // Verify that appropriate action buttons are shown
    const deactivateBtn = page.locator('#deactivateBtn');
    const deleteBtn = page.locator('#deleteBtn');
    
    const hasDeactivate = await deactivateBtn.isVisible();
    const hasDelete = await deleteBtn.isVisible();
    
    if (hasDeactivate) {
      console.log('User is active - deactivate button shown');
    } else if (hasDelete) {
      console.log('User is inactive - delete button shown');
    } else {
      console.log('No action buttons visible - unexpected state');
    }
    
    // At least one action should be available
    expect(hasDeactivate || hasDelete).toBe(true);
  });
});