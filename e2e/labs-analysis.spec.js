import { expect, test } from '@playwright/test';
import { completeOnboardingIfVisible, signInFromPublicHome } from './helpers/auth';

test('labs analysis renders local-mode result', async ({ page }) => {
  await signInFromPublicHome(page);
  await completeOnboardingIfVisible(page);
  await page.getByTestId('top-nav-more').click();
  await page.getByTestId('sidebar-nav-labs').click();

  const input = page.getByTestId('labs-report-input');
  await expect(input).toBeVisible();
  await input.fill('TSH 2.4, Ferritin 45, Vitamin D 28');

  await page.getByTestId('labs-generate-report').click();
  await expect(page.getByText(/local mode without ai/i).first()).toBeVisible();
});
