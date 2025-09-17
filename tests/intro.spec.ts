import { test, expect } from '@playwright/test';

// E2E for Intro flow and URL controls

test.describe('Intro flow', () => {
  test('force via #intro, start, and URL cleanup', async ({ page }) => {
    // Force Intro screen
    await page.goto('/#intro');

    // Intro visible
    await expect(page.getByRole('heading', { name: /focus on what matters/i })).toBeVisible();

    // Click Get started
    await page.getByRole('button', { name: /get started/i }).click();

    // Intro dismissed and todo app visible
    await expect(page.getByRole('heading', { name: /to-do list/i })).toBeVisible();

  // URL cleaned of intro params and routed to app (#app)
  await expect(page).toHaveURL((url) => url.hash === '#app' && !url.searchParams.has('intro'));
  });

  test('reset via #reset-intro', async ({ page }) => {
    // Simulate prior completion
    await page.addInitScript(() => {
      window.localStorage.setItem('seenIntro', 'true');
    });

    // Reset via hash
    await page.goto('/#reset-intro');

    // Intro should be visible after reset
    await expect(page.getByRole('heading', { name: /focus on what matters/i })).toBeVisible();
  });
});
