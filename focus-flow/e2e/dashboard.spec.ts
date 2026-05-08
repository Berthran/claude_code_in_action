import { test, expect } from '@playwright/test';

test('Dashboard task creation, allocation, and timer navigation', async ({ page }) => {
  // Go to dashboard (dev server running on port 3001)
  await page.goto('http://localhost:3001');

  // Click Create Task button
  await page.getByRole('button', { name: /Create Task/i }).click();

  // Prompt modal appears – fill task name and submit
  const taskName = 'Playwright Test Task';
  await page.locator('input[placeholder="Task name"]').fill(taskName);
  await page.getByRole('button', { name: 'OK' }).click();

  // Wait for task list to include the new task
  await expect(page.getByText(taskName)).toBeVisible();

  // Select the task
  const checkbox = page.locator(`input[type="checkbox"]`).first();
  await checkbox.check();

  // Click Start Session (Play button)
  await page.getByRole('button', { name: '' }).locator('svg[data-icon="play"]').click({ force: true }).catch(async () => {
    // fallback: click the button containing the Play icon
    await page.getByRole('button').filter({ has: page.getByRole('img', { name: /Play/ }) }).click();
  });

  // Allocation modal appears – allocate full duration (default 25 minutes)
  const allocationInput = page.locator('input[type="number"]').first();
  await allocationInput.fill('25');
  // Confirm allocation
  await page.getByRole('button', { name: 'Confirm' }).click();

  // Verify navigation to timer page
  await expect(page).toHaveURL(/\/timer/);

  // Verify timer displays 25:00
  await expect(page.getByText('25:00')).toBeVisible();
});
