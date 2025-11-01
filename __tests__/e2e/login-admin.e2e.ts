import { test, expect } from '@playwright/test';

const BASE_URL = process.env.PLAYWRIGHT_TEST_BASE_URL!;
const ADMIN_EMAIL = process.env.ADMIN_EMAIL!;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD!;

/**
 * @suite Admin Blog Details & Comment E2E Test
 * End-to-end tests for logging in as admin, verifying blog cards, 
 * navigating to a blog post, and posting a comment.
 */
test.describe('Admin Blog Details & Comment E2E Test', () => {

  /**
   * Navigate to the login page before each test.
   * @param {import('@playwright/test').Page} page - Playwright Page object.
   */
  test.beforeEach(async ({ page }) => {
    await page.goto(BASE_URL + 'auth/login');
  });

  /**
   * @test Login as admin, open first blog card, verify header, and post a comment.
   * Steps:
   * 1. Fill in admin credentials and submit login form.
   * 2. Wait for redirect to /blog.
   * 3. Verify at least 2 blog cards exist.
   * 4. Click the "Read More" button on the first card.
   * 5. Verify that the details page header (title and author) matches the clicked card.
   * 6. Post a test comment.
   * 7. Verify the comment is visible in the comments section.
   * 
   * @param {import('@playwright/test').Page} page - Playwright Page object.
   */
  test('login, open first blog card, verify header, post comment', async ({ page }) => {

    // --- Step 1: Login ---
    await page.getByLabel('Email').fill(ADMIN_EMAIL);
    await page.getByLabel('Password').fill(ADMIN_PASSWORD);
    await page.getByRole('button', { name: /Sign In/i }).click();

    // --- Step 2: Wait for redirect to /blog ---
    await page.waitForURL('**/blog');
    await expect(page).toHaveURL(/\/blog$/);

    // --- Step 3: Wait for blog cards to render ---
    const blogCards = page.locator('div.grid mat-card');
    await blogCards.first().waitFor({ state: 'visible', timeout: 5000 });
    const cardCount = await blogCards.count();
    expect(cardCount).toBeGreaterThan(1);

    // --- Step 4: Save first card info ---
    const firstCard = blogCards.nth(0);
    const cardTitle = await firstCard.locator('h2').innerText();
    const cardAuthor = await firstCard.locator('span:has(mat-icon:text("person"))').innerText();

    // --- Step 5: Click "Read More" ---
    await firstCard.locator('button:has-text("Read More")').click();
    await page.waitForURL('**/blog/*');

    // --- Step 6: Verify header title and author on details page ---
    const postHeader = page.locator('header h1');
    await expect(postHeader).toHaveText(cardTitle);

    const postAuthor = page.locator('header div:has(mat-icon:text("person"))');
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
