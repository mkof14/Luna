import { expect, test } from '@playwright/test';
import { completeOnboardingIfVisible, signInFromPublicHome } from './helpers/auth';

test('relationships note generation and medications CRUD flow work in local mode', async ({ page }) => {
  await signInFromPublicHome(page);
  await completeOnboardingIfVisible(page);

  await page.getByTestId('top-nav-more').click();
  await page.getByTestId('sidebar-nav-relationships').click();

  await expect(page.getByTestId('relationships-step-intro')).toBeVisible();
  await page.getByTestId('relationships-partner-input').fill('Alex');
  await page.getByTestId('relationships-begin').click();

  await page.locator('[data-testid^="relationships-intent-"]').first().click();
  await page.locator('[data-testid^="relationships-tone-"]').first().click();
  await page.locator('[data-testid^="relationships-boundary-"]').first().click();

  await expect(page.getByTestId('relationships-result-message')).toBeVisible();
  await expect(page.getByTestId('relationships-result-message')).toContainText(/Alex|I am|My internal bandwidth|Привет|Сегодня/u);

  await page.getByTestId('top-nav-more').click();
  await page.getByTestId('sidebar-nav-meds').click();

  await page.getByTestId('medications-toggle-add').click();
  await expect(page.getByTestId('medications-form')).toBeVisible();

  await page.getByTestId('medications-name-input').fill('Magnesium');
  await page.getByTestId('medications-dose-input').fill('200mg');
  await page.getByTestId('medications-save').click();

  await expect(page.getByTestId('medications-status')).toContainText(/Support profile added|Добав/u);
  await expect(page.locator('[data-testid^="medications-card-"]')).toHaveCount(1);
  await expect(page.getByText('Magnesium')).toBeVisible();

  await page.locator('[data-testid^="medications-remove-"]').first().click({ force: true });
  await expect(page.getByTestId('medications-status')).toContainText(/Support profile removed|Удал/u);
  await expect(page.locator('[data-testid^="medications-card-"]')).toHaveCount(0);
});
