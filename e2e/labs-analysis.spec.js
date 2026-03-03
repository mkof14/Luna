import { expect, test } from '@playwright/test';

test('labs analysis renders local-mode result', async ({ page }) => {
  await page.goto('/');

  await page.getByRole('button', { name: /begin journey/i }).click();
  await page.getByTestId('top-nav-labs').click();

  const input = page.getByPlaceholder(/paste marker values here/i);
  await expect(input).toBeVisible();
  await input.fill('TSH 2.4, Ferritin 45, Vitamin D 28');

  await page.getByRole('button', { name: /see results|reading/i }).click();
  await expect(page.getByText(/local mode without ai/i)).toBeVisible();
});
