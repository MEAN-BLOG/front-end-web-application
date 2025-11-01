import { test, expect } from '@playwright/test';

/**
 * Base URL and admin credentials are read from environment variables
 */
const BASE_URL = process.env.PLAYWRIGHT_TEST_BASE_URL!;
const ADMIN_EMAIL = process.env.ADMIN_EMAIL!;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD!;

/**
 * @suite Admin Blog Details & Comment E2E Test
 * Logs in as admin, verifies blog cards, navigates to details page,
 * checks header info, posts a comment, and verifies it appears.
 */
test.describe('Admin Blog Details & Comment E2E Test', () => {

  /**
   * Navigate to login page before each test
   */
  test.beforeEach(async ({ page }) => {
    await page.goto(`${BASE_URL}auth/login`);
  });

  /**
   * @test login, open first blog card, verify header, post comment
   */
  test('login, open first blog card, verify header, post comment', async ({ page }) => {

    // --- Step 1: Login ---
    await page.getByLabel('Email').fill(ADMIN_EMAIL);
    await page.getByLabel('Password').fill(ADMIN_PASSWORD);
    await page.getByRole('button', { name: /Sign In/i }).click();

    // --- Step 2: Wait for redirect to /blog ---
    await page.waitForURL('**/blog');
    await expect(page).toHaveURL(/\/blog$/);

    // --- Step 3: Wait for blog cards ---
    const blogCards = page.locator('div.grid mat-card');
    await blogCards.first().waitFor({ state: 'visible', timeout: 10000 });
    const cardCount = await blogCards.count();
    expect(cardCount).toBeGreaterThan(1);

    // --- Step 4: Save first card info ---
    const firstCard = blogCards.nth(0);
    const cardTitle = await firstCard.locator('h2').innerText();
    const cardAuthor = await firstCard.locator('span:has(mat-icon:text("person"))').first().innerText();

    // --- Step 5: Click "Read More" ---
    await firstCard.locator('button:has-text("Read More")').click();
    await page.waitForURL('**/blog/*');

    // --- Step 6: Verify header title and author on details page ---
    const postHeader = page.locator('header h1');
    await expect(postHeader).toHaveText(cardTitle);

    // Narrow locator to exact author div
    const postAuthor = page.locator('header div.flex.items-center:has(mat-icon:text("person"))');
    await expect(postAuthor).toHaveText(cardAuthor);

    // --- Step 7: Add a comment ---
    const commentTextarea = page.locator('textarea[formcontrolname="content"]');
    const commentButton = page.getByRole('button', { name: /Post Comment/i });
    const testComment = 'This is a test comment from Playwright!';

    await commentTextarea.fill(testComment);
    await commentButton.click();

    // --- Step 8: Wait for the comment to appear ---
    const postedComment = page.locator(`div:has-text("${testComment}")`);
    await postedComment.waitFor({ state: 'visible', timeout: 5000 });

    // --- Step 9: Verify comment exists ---
    await expect(postedComment).toBeVisible();
  });
});
