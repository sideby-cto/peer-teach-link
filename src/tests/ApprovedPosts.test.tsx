import { test, expect } from '@playwright/test';

test.describe('Approved Posts Page', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the approved posts page
    await page.goto('/approved-posts');
  });

  test('displays approved posts', async ({ page }) => {
    // Wait for posts to load
    await page.waitForSelector('[data-testid="post-card"]');
    
    // Check if posts are visible
    const posts = await page.$$('[data-testid="post-card"]');
    expect(posts.length).toBeGreaterThan(0);
  });

  test('shows loading state', async ({ page }) => {
    // Intercept the posts query to simulate loading
    await page.route('**/rest/v1/posts*', async (route) => {
      await new Promise(resolve => setTimeout(resolve, 1000));
      await route.continue();
    });

    // Check if loading message is shown
    const loadingText = await page.getByText('Loading posts...');
    expect(loadingText).toBeVisible();
  });

  test('handles no posts state', async ({ page }) => {
    // Mock empty response
    await page.route('**/rest/v1/posts*', async (route) => {
      await route.fulfill({ json: [] });
    });

    // Check if empty state message is shown
    const emptyText = await page.getByText('No posts yet.');
    expect(emptyText).toBeVisible();
  });

  test('admin can approve posts', async ({ page }) => {
    // Login as admin first (you'll need to implement this)
    await page.evaluate(() => {
      localStorage.setItem('supabase.auth.token', 'admin-token');
    });

    // Wait for unapproved post
    await page.waitForSelector('button:has-text("Approve Post")');

    // Click approve button
    await page.click('button:has-text("Approve Post")');

    // Verify success toast appears
    const successToast = await page.getByText('Post approved successfully');
    expect(successToast).toBeVisible();
  });

  test('non-admin cannot see approve button', async ({ page }) => {
    // Login as regular user
    await page.evaluate(() => {
      localStorage.setItem('supabase.auth.token', 'user-token');
    });

    // Check that approve button is not visible
    const approveButton = await page.$$('button:has-text("Approve Post")');
    expect(approveButton.length).toBe(0);
  });
});