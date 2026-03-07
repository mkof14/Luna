import { expect } from '@playwright/test';

const E2E_EMAIL = process.env.E2E_EMAIL || 'dnainform@gmail.com';
const E2E_PASSWORD = process.env.E2E_PASSWORD || 'LunaAdmin2026!';

export async function signInFromPublicHome(page) {
  await page.goto('/');
  await page.getByTestId('public-signin').click();
  await expect(page.getByTestId('auth-email')).toBeVisible();
  await page.getByTestId('auth-email').fill(E2E_EMAIL);
  await page.getByTestId('auth-password').fill(E2E_PASSWORD);
  await page.getByTestId('auth-submit').click();
}

export async function completeOnboardingIfVisible(page) {
  const onboardingButton = page.getByTestId('onboarding-begin');
  try {
    await expect(onboardingButton).toBeVisible({ timeout: 8000 });
    await onboardingButton.click();
  } catch {
    // Already onboarded in this context.
  }

  const checkinClose = page.getByTestId('checkin-close');
  const checkinSave = page.getByTestId('checkin-save');
  for (let attempt = 0; attempt < 28; attempt += 1) {
    const closeVisible = await checkinClose.isVisible().catch(() => false);
    if (closeVisible) {
      await checkinClose.click();
      await page.waitForTimeout(150);
      continue;
    }
    const checkinVisible = await checkinSave.isVisible().catch(() => false);
    if (checkinVisible) {
      await checkinSave.click();
      await page.waitForTimeout(150);
      continue;
    }
    await page.waitForTimeout(250);
  }

  const topNavMore = page.getByTestId('top-nav-more');
  await expect(topNavMore).toBeVisible({ timeout: 10000 });
}
