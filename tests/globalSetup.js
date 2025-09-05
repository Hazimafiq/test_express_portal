const { chromium } = require('@playwright/test');
const setupTestDatabase = require('./setup');
const path = require('path');

module.exports = async () => {
  await setupTestDatabase();
  
  // Set up admin authentication state
  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();
  
  try {
    // Navigate to login page
    await page.goto('http://localhost:3000/login');
    
    // Login as admin
    await page.fill('#username', 'admin_test');
    await page.fill('#password', 'AdminPass123!');
    await page.click('.signin-button');
    
    // Wait for successful login
    await page.waitForURL('**/aligners-cases');
    
    // Save authentication state
    await context.storageState({ 
      path: path.join(__dirname, 'auth-state.json') 
    });
    
    console.log('Admin authentication state saved');
  } catch (error) {
    console.error('Failed to setup admin authentication:', error);
    throw error;
  } finally {
    await browser.close();
  }
};
