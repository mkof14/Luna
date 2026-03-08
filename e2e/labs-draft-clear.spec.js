import { expect, test } from '@playwright/test';
import { completeOnboardingIfVisible, signInFromPublicHome } from './helpers/auth';

test('labs clear draft removes saved input', async ({ page }) => {
  await signInFromPublicHome(page);
  await completeOnboardingIfVisible(page);

  await page.getByTestId('top-nav-more').click();
  await page.getByTestId('sidebar-nav-labs').click();

  const input = page.getByTestId('labs-report-input');
  await expect(input).toBeVisible();
  await input.fill('TSH 4.2, Ferritin 20');

  await page.getByTestId('labs-clear-draft').click();
  await expect(page.getByTestId('labs-report-input')).toHaveValue('');

  await page.reload();
  await completeOnboardingIfVisible(page);
  await page.getByTestId('top-nav-more').click();
  await page.getByTestId('sidebar-nav-labs').click();

  await expect(page.getByTestId('labs-report-input')).toHaveValue('');
});
