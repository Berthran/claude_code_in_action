import { test, expect } from '@playwright/test';

test('edit task name via overflow menu', async ({ page }) => {
  // Navigate to the app
  await page.goto('http://localhost:3000');

  // Wait for task list to load
  await expect(page.locator('h2', { hasText: 'Task List' })).toBeVisible();

  // Locate the first task's overflow menu icon (MoreVertical)
  const overflowIcon = page.locator('svg.text-zinc-400.cursor-pointer').first();
  await overflowIcon.click();

  // Click the Edit option in the overflow menu
  await page.locator('button', { hasText: 'Edit' }).click();

  // Fill in the new task name
  const input = page.locator('input[type="text"]').first();
  await input.fill('Updated Task Name');

  // Click Save button
  await page.locator('button', { hasText: 'Save' }).click();

  // Verify the task name updated in the list
  await expect(page.locator('span.text-lg', { hasText: 'Updated Task Name' })).toBeVisible();
});
