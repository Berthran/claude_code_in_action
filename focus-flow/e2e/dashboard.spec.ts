import { test, expect } from '@playwright/test';

test('Dashboard two tasks allocation and timer navigation', async ({ page }) => {
  // Navigate to dashboard on port 3000
  await page.goto('http://localhost:3000');

  // Create first task
  await page.getByRole('button', { name: /Create Task/i }).click();
  await page.locator('input[placeholder="Task name"]').fill('Task 1');
  await page.getByRole('button', { name: 'OK' }).click();
  await expect(page.getByText('Task 1')).toBeVisible();

  // Create second task
  await page.getByRole('button', { name: /Create Task/i }).click();
  await page.locator('input[placeholder="Task name"]').fill('Task 2');
  await page.getByRole('button', { name: 'OK' }).click();
  await expect(page.getByText('Task 2')).toBeVisible();

  // Select both tasks using checkboxes
  const checkboxes = page.locator('input[type="checkbox"]');
  await checkboxes.nth(0).check();
  await checkboxes.nth(1).check();

  // Click Start Session (Play button)
  await page.getByRole('button').filter({ has: page.getByRole('img', { name: /Play/ }) }).click();

  // Validate that allocation modal appears with both tasks
  await expect(page.getByText('Allocate Time')).toBeVisible();
  await expect(page.getByText('Task 1')).toBeVisible();
  await expect(page.getByText('Task 2')).toBeVisible();

  // Verify two allocation inputs are present (one per task)
  const allocationInputs = page.locator('input[type="number"]');
  await expect(allocationInputs).toHaveCount(2);

  // Allocate 10 minutes to first task, 15 to second (total equals session duration 25)
  await allocationInputs.nth(0).fill('10');
  await allocationInputs.nth(1).fill('15');

  // Confirm allocation
  await page.getByRole('button', { name: 'Confirm' }).click();

  // Verify navigation to timer page
  await expect(page).toHaveURL(/\/timer/);

  // Verify timer displays total duration (25:00)
  await expect(page.getByText('25:00')).toBeVisible();

  // Verify both tasks are listed with correct allocations
  await expect(page.getByText('10M')).toBeVisible();
  await expect(page.getByText('15M')).toBeVisible();
});
