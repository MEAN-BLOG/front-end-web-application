import { test, expect } from '@playwright/test';
const BASE_URL = process.env.PLAYWRIGHT_TEST_BASE_URL!;

/**
 * Set up the environment for each test in this suite.
 * Navigates to the base application URL before running a test.
 */
test.beforeEach(async ({ page }) => {
  await page.goto(BASE_URL); 
});

/**
 * @suite Guest Navigation Bar E2E Tests
 * Focuses on testing navigation and responsiveness for unauthenticated users.
 */
test.describe('Guest Navigation Bar E2E Tests', () => {

  const menuButtonName = 'Toggle navigation menu';
  const mobileMenuPanelSelector = '.fixed.top-16.right-0.w-full'; 
  const mobileViewport = { width: 600, height: 800 };

  /**
   * @test should verify initial display and correctly open/close the mobile menu
   * Simulates a mobile viewport, verifies Logo and Toggle button, and tests menu functionality.
   */
  test('should verify initial display and correctly open/close the mobile menu', async ({ page }) => {
    await page.setViewportSize(mobileViewport); 

    const logoLink = page.getByRole('link', { name: 'Home' });
    const menuButton = page.getByRole('button', { name: menuButtonName });
    const mobileMenuPanel = page.locator(mobileMenuPanelSelector); 
    
    // Initial State Check (Closed)
    await expect(logoLink).toBeVisible();
    await expect(menuButton).toBeVisible();
    await expect(menuButton.locator('mat-icon')).toHaveText('menu');
    await expect(mobileMenuPanel).toHaveClass(/translate-x-full/); 

    // Open the Menu
    await menuButton.click();
    await expect(menuButton.locator('mat-icon')).toHaveText('close'); 
    await expect(mobileMenuPanel).toHaveClass(/translate-x-0/); 
    
    // Close the Menu
    await menuButton.click();
    await expect(menuButton.locator('mat-icon')).toHaveText('menu'); 
    await expect(mobileMenuPanel).toHaveClass(/translate-x-full/);
  });

  /**
   * @test should display all guest links in the mobile menu
   * Verifies that 'Articles', 'Login', and 'Sign Up' links are present when the mobile menu is open.
   */
  test('should display all guest links in the mobile menu', async ({ page }) => {
    await page.setViewportSize(mobileViewport);
    
    const menuButton = page.getByRole('button', { name: menuButtonName });
    const mobileMenuPanel = page.locator(mobileMenuPanelSelector);
    
    // Open the Menu
    await menuButton.click();
    await expect(mobileMenuPanel).toHaveClass(/translate-x-0/);

    // Assertions: Verify all three required links are visible
    const articlesLink = mobileMenuPanel.getByRole('link', { name: 'Articles' });
    await expect(articlesLink).toBeVisible();
    await expect(articlesLink).toHaveAttribute('routerlink', '/blog'); 

    const loginLink = mobileMenuPanel.getByRole('link', { name: 'Login' });
    await expect(loginLink).toBeVisible();
    await expect(loginLink).toHaveAttribute('routerlink', '/auth/login');

    const signUpLink = mobileMenuPanel.getByRole('link', { name: 'Sign Up' });
    await expect(signUpLink).toBeVisible();
    await expect(signUpLink).toHaveAttribute('routerlink', '/auth/register');

    // Close menu to clean up
    await menuButton.click();
  });
  
/**
   * @test should navigate and close menu for all guest links
   * Clicks 'Articles', 'Login', and 'Sign Up' sequentially, verifying navigation and menu auto-close after each click.
   */
  test('should navigate and close menu for all guest links', async ({ page }) => {
    await page.setViewportSize(mobileViewport);
    
    const menuButton = page.getByRole('button', { name: menuButtonName });
    const mobileMenuPanel = page.locator(mobileMenuPanelSelector);
    
    /** * @helper clickAndVerify
     * Opens menu, clicks link, verifies navigation, and verifies menu closure.
     */
    const clickAndVerify = async (linkName: string, expectedUrlPath: string) => {
      // 1. Open the menu
      await menuButton.click();
      await expect(mobileMenuPanel).toHaveClass(/translate-x-0/);
      
      // 2. Click the link
      const link = mobileMenuPanel.getByRole('link', { name: linkName });
      await expect(link).toBeVisible();
      await link.click();
      
      // Allow time for navigation and close animation
      await page.waitForTimeout(500); 

      // 3. Verify URL change
      await expect(page).toHaveURL(new RegExp(expectedUrlPath));

      // 4. Verify menu closed automatically
      await expect(mobileMenuPanel).toHaveClass(/translate-x-full/);
    };

    // --- Test 1: Articles ---
    await clickAndVerify('Articles', 'blog');
    
    // --- Test 2: Sign Up ---
    await page.goto('http://localhost:4200/'); 
    await clickAndVerify('Sign Up', 'auth/register');

    // --- Test 3: Login ---
    await page.goto('http://localhost:4200/'); 
    await clickAndVerify('Login', 'auth/login');
  });
  
});