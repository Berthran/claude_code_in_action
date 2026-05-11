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
    - heading "FocusFlow" [level=1] [ref=e3]
    - generic [ref=e4]:
      - paragraph [ref=e5]: "\"Productivity is never an accident.\""
      - paragraph [ref=e6]: "- Paul J. Meyer"
    - generic [ref=e7]:
      - img [ref=e9]
      - generic [ref=e30]:
        - generic [ref=e31]:
          - textbox [ref=e32]: "25"
          - generic [ref=e33]: mins
        - generic [ref=e34]:
          - button [ref=e35] [cursor=pointer]:
            - img [ref=e36]
          - button [ref=e38] [cursor=pointer]:
            - img [ref=e39]
      - button [ref=e41] [cursor=pointer]:
        - img [ref=e42]
    - button "Create Task" [ref=e45] [cursor=pointer]:
      - img [ref=e46]
      - text: Create Task
    - generic [ref=e47]:
      - heading "Task List" [level=2] [ref=e48]
      - generic [ref=e50]:
        - img [ref=e51]
        - textbox "Search tasks..." [ref=e54]
      - generic [ref=e55]:
        - generic [ref=e56]:
          - generic [ref=e57]:
            - checkbox [ref=e58]
            - generic [ref=e59]: Task 2
          - generic [ref=e60]:
            - generic [ref=e61]: 0 sessions
            - img [ref=e62] [cursor=pointer]
        - generic [ref=e66]:
          - generic [ref=e67]:
            - checkbox [checked] [active] [ref=e68]
            - generic [ref=e69]: Task 1
          - generic [ref=e70]:
            - generic [ref=e71]: 0 sessions
            - img [ref=e72] [cursor=pointer]
        - generic [ref=e76]:
          - generic [ref=e77]:
            - checkbox [ref=e78]
            - generic [ref=e79]: Wash clothes
          - generic [ref=e80]:
            - generic [ref=e81]: 11 sessions
            - img [ref=e82] [cursor=pointer]
        - generic [ref=e86]:
          - generic [ref=e87]:
            - checkbox [ref=e88]
            - generic [ref=e89]: Finish Chillers post
          - generic [ref=e90]:
            - generic [ref=e91]: 12 sessions
            - img [ref=e92] [cursor=pointer]
        - generic [ref=e96]:
          - generic [ref=e97]:
            - checkbox [ref=e98]
            - generic [ref=e99]: Task 3
          - generic [ref=e100]:
            - generic [ref=e101]: 8 sessions
            - img [ref=e102] [cursor=pointer]
        - generic [ref=e106]:
          - generic [ref=e107]:
            - checkbox [ref=e108]
            - generic [ref=e109]: Task 2
          - generic [ref=e110]:
            - generic [ref=e111]: 5 sessions
            - img [ref=e112] [cursor=pointer]
        - generic [ref=e116]:
          - generic [ref=e117]:
            - checkbox [ref=e118]
            - generic [ref=e119]: Task 1
          - generic [ref=e120]:
            - generic [ref=e121]: 3 sessions
            - img [ref=e122] [cursor=pointer]
        - generic [ref=e126]:
          - generic [ref=e127]:
            - checkbox [ref=e128]
            - generic [ref=e129]: Talk to Debbie
          - generic [ref=e130]:
            - generic [ref=e131]: 2 sessions
            - img [ref=e132] [cursor=pointer]
        - generic [ref=e136]:
          - generic [ref=e137]:
            - checkbox [ref=e138]
            - generic [ref=e139]: Check up on campus ambassadors management team
          - generic [ref=e140]:
            - generic [ref=e141]: 2 sessions
            - img [ref=e142] [cursor=pointer]
        - generic [ref=e146]:
          - generic [ref=e147]:
            - checkbox [ref=e148]
            - generic [ref=e149]: Update Dev List for warranty features
          - generic [ref=e150]:
            - generic [ref=e151]: 1 sessions
            - img [ref=e152] [cursor=pointer]
        - generic [ref=e156]:
          - generic [ref=e157]:
            - checkbox [ref=e158]
            - generic [ref=e159]: Read richest man in babylon
          - generic [ref=e160]:
            - generic [ref=e161]: 1 sessions
            - img [ref=e162] [cursor=pointer]
        - generic [ref=e166]:
          - generic [ref=e167]:
            - checkbox [ref=e168]
            - generic [ref=e169]: Read Bible
          - generic [ref=e170]:
            - generic [ref=e171]: 1 sessions
            - img [ref=e172] [cursor=pointer]
  - alert [ref=e176]
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