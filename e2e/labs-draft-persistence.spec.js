import { expect, test } from '@playwright/test';
import { completeOnboardingIfVisible, signInFromPublicHome } from './helpers/auth';

test('labs draft input persists after reload', async ({ page }) => {
  await signInFromPublicHome(page);
  await completeOnboardingIfVisible(page);

  await page.evaluate(() => window.localStorage.removeItem('luna_labs_draft_v1'));

  await page.getByTestId('top-nav-more').click();
  await page.getByTestId('sidebar-nav-labs').click();

  const input = page.getByTestId('labs-report-input');
  await expect(input).toBeVisible();

  const draftText = 'TSH 3.1, Ferritin 32, Vitamin D 24';
  await input.fill(draftText);

  await page.reload();
  await completeOnboardingIfVisible(page);
  await page.getByTestId('top-nav-more').click();
  await page.getByTestId('sidebar-nav-labs').click();

  await expect(page.getByTestId('labs-report-input')).toHaveValue(draftText);
});
