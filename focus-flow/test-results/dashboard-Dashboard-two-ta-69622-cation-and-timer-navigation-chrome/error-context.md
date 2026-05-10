# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: dashboard.spec.ts >> Dashboard two tasks allocation and timer navigation
- Location: e2e/dashboard.spec.ts:3:5

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: locator.click: Test timeout of 30000ms exceeded.
Call log:
  - waiting for getByRole('button').filter({ has: getByRole('img', { name: /Play/ }) })

```

# Page snapshot

```yaml
- generic [ref=e1]:
  - main [ref=e2]:
    - generic [ref=e3]:
      - img [ref=e5]
      - generic [ref=e26]:
        - generic [ref=e27]:
          - textbox [ref=e28]: "25"
          - generic [ref=e29]: mins
        - generic [ref=e30]:
          - button [ref=e31] [cursor=pointer]:
            - img [ref=e32]
          - button [ref=e34] [cursor=pointer]:
            - img [ref=e35]
      - button [ref=e37] [cursor=pointer]:
        - img [ref=e38]
    - generic [ref=e40]:
      - button "Create Task" [ref=e41] [cursor=pointer]:
        - img [ref=e42]
        - text: Create Task
      - button "Add Task to Session" [ref=e43] [cursor=pointer]
    - generic [ref=e44]:
      - heading "Task List" [level=2] [ref=e45]
      - generic [ref=e46]:
        - generic [ref=e47]:
          - generic [ref=e48]:
            - checkbox [checked] [ref=e49]
            - generic [ref=e50]: Task 2
          - generic [ref=e51]:
            - generic [ref=e52]: 5/9/2026
            - generic [ref=e53]: 0 sessions
        - generic [ref=e54]:
          - generic [ref=e55]:
            - checkbox [checked] [active] [ref=e56]
            - generic [ref=e57]: Task 1
          - generic [ref=e58]:
            - generic [ref=e59]: 5/9/2026
            - generic [ref=e60]: 0 sessions
        - generic [ref=e61]:
          - generic [ref=e62]:
            - checkbox [ref=e63]
            - generic [ref=e64]: Talk to Debbie
          - generic [ref=e65]:
            - generic [ref=e66]: 5/8/2026
            - generic [ref=e67]: 1 sessions
        - generic [ref=e68]:
          - generic [ref=e69]:
            - checkbox [ref=e70]
            - generic [ref=e71]: Check up on campus ambassadors management team
          - generic [ref=e72]:
            - generic [ref=e73]: 5/8/2026
            - generic [ref=e74]: 1 sessions
        - generic [ref=e75]:
          - generic [ref=e76]:
            - checkbox [ref=e77]
            - generic [ref=e78]: Update Dev List for warranty features
          - generic [ref=e79]:
            - generic [ref=e80]: 5/8/2026
            - generic [ref=e81]: 0 sessions
        - generic [ref=e82]:
          - generic [ref=e83]:
            - checkbox [ref=e84]
            - generic [ref=e85]: Read richest man in babylon
          - generic [ref=e86]:
            - generic [ref=e87]: 5/8/2026
            - generic [ref=e88]: 1 sessions
        - generic [ref=e89]:
          - generic [ref=e90]:
            - checkbox [ref=e91]
            - generic [ref=e92]: Read Bible
          - generic [ref=e93]:
            - generic [ref=e94]: 5/8/2026
            - generic [ref=e95]: 0 sessions
  - alert [ref=e96]
```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  | 
  3  | test('Dashboard two tasks allocation and timer navigation', async ({ page }) => {
  4  |   // Navigate to dashboard on port 3000
  5  |   await page.goto('http://localhost:3000');
  6  | 
  7  |   // Create first task
  8  |   await page.getByRole('button', { name: /Create Task/i }).click();
  9  |   await page.locator('input[placeholder="Task name"]').fill('Task 1');
  10 |   await page.getByRole('button', { name: 'OK' }).click();
  11 |   await expect(page.getByText('Task 1')).toBeVisible();
  12 | 
  13 |   // Create second task
  14 |   await page.getByRole('button', { name: /Create Task/i }).click();
  15 |   await page.locator('input[placeholder="Task name"]').fill('Task 2');
  16 |   await page.getByRole('button', { name: 'OK' }).click();
  17 |   await expect(page.getByText('Task 2')).toBeVisible();
  18 | 
  19 |   // Select both tasks using checkboxes
  20 |   const checkboxes = page.locator('input[type="checkbox"]');
  21 |   await checkboxes.nth(0).check();
  22 |   await checkboxes.nth(1).check();
  23 | 
  24 |   // Click Start Session (Play button)
> 25 |   await page.getByRole('button').filter({ has: page.getByRole('img', { name: /Play/ }) }).click();
     |                                                                                           ^ Error: locator.click: Test timeout of 30000ms exceeded.
  26 | 
  27 |   // Validate that allocation modal appears with both tasks
  28 |   await expect(page.getByText('Allocate Time')).toBeVisible();
  29 |   await expect(page.getByText('Task 1')).toBeVisible();
  30 |   await expect(page.getByText('Task 2')).toBeVisible();
  31 | 
  32 |   // Verify two allocation inputs are present (one per task)
  33 |   const allocationInputs = page.locator('input[type="number"]');
  34 |   await expect(allocationInputs).toHaveCount(2);
  35 | 
  36 |   // Allocate 10 minutes to first task, 15 to second (total equals session duration 25)
  37 |   await allocationInputs.nth(0).fill('10');
  38 |   await allocationInputs.nth(1).fill('15');
  39 | 
  40 |   // Confirm allocation
  41 |   await page.getByRole('button', { name: 'Confirm' }).click();
  42 | 
  43 |   // Verify navigation to timer page
  44 |   await expect(page).toHaveURL(/\/timer/);
  45 | 
  46 |   // Verify timer displays total duration (25:00)
  47 |   await expect(page.getByText('25:00')).toBeVisible();
  48 | 
  49 |   // Verify both tasks are listed with correct allocations
  50 |   await expect(page.getByText('10M')).toBeVisible();
  51 |   await expect(page.getByText('15M')).toBeVisible();
  52 | });
  53 | 
```