/// <reference types="node" />
import { test, expect } from '@playwright/test';

// Basic e2e + visual regression for the Todo app

test.describe('Todo App', () => {
  test('loads and matches layout screenshot', async ({ page }) => {
    // Skip Intro via URL override
    await page.goto('/#app');

    // Wait for title and input
    await expect(page.getByRole('heading', { level: 2, name: /to-do list/i })).toBeVisible();
    await expect(page.getByPlaceholder('Add a new task...')).toBeVisible();

    // Visual snapshot (baseline required locally first run)
    if (process.env.VISUAL === '1') {
      await expect(page).toHaveScreenshot('home.png', {
        fullPage: true,
        animations: 'disabled',
      });
    }
  });

  test('add + toggle + delete flow', async ({ page }) => {
    // Skip Intro via URL override
    await page.goto('/#app');
    const input = page.getByPlaceholder('Add a new task...');
    await input.fill('Write Playwright test');
    await page.getByRole('button', { name: /add/i }).click();

  // Ensure we're asserting on the list item, not the toast
  const listItem = page.getByRole('listitem').filter({ hasText: 'Write Playwright test' });
  await expect(listItem).toBeVisible();

    // toggle complete
  const item = listItem;
  await item.getByRole('checkbox').check();

    // delete
    await item.getByRole('button', { name: /delete/i }).click();

    await expect(page.getByText('Task deleted.')).toBeVisible();
  });
});
