import { expect, test } from '@playwright/test';

test('profile update and medication events appear in history timeline', async ({ page }) => {
  await page.goto('/');
  await page.getByTestId('onboarding-begin').click();

  await page.getByTestId('top-nav-more').click();
  await page.getByTestId('sidebar-nav-profile').click();

  await page.getByTestId('profile-name-input').fill('Mila QA');
  await page.getByTestId('profile-save').click();
  await expect(page.getByTestId('profile-save')).toContainText(/Identity Synced|Sync Profile/u);

  await page.getByTestId('top-nav-more').click();
  await page.getByTestId('sidebar-nav-meds').click();
  await page.getByTestId('medications-toggle-add').click();
  await page.getByTestId('medications-name-input').fill('Zinc');
  await page.getByTestId('medications-dose-input').fill('25mg');
  await page.getByTestId('medications-save').click();

  await page.getByTestId('top-nav-more').click();
  await page.getByTestId('sidebar-nav-history').click();

  await expect(page.getByTestId('history-timeline')).toBeVisible();
  await expect(page.getByText(/Profile updated\./u)).toBeVisible();
  await expect(page.getByText(/Support updated:\s*Zinc\./u)).toBeVisible();
});
