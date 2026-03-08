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

async function clickIfVisible(locator) {
  const visible = await locator.isVisible().catch(() => false);
  if (!visible) return false;
  const clicked = await locator
    .first()
    .click({ force: true, timeout: 1000 })
    .then(() => true)
    .catch(() => false);
  return clicked;
}

export async function completeOnboardingIfVisible(page) {
  const onboardingButton = page.getByTestId('onboarding-begin');
  try {
    await expect(onboardingButton).toBeVisible({ timeout: 8000 });
    await onboardingButton.click({ force: true, timeout: 1500 });
  } catch {
    // Already onboarded in this context.
  }

  const checkinClose = page.getByTestId('checkin-close');
  const checkinSave = page.getByTestId('checkin-save');
  const topNavMore = page.getByTestId('top-nav-more');
  let noOverlayStreak = 0;
  for (let attempt = 0; attempt < 40; attempt += 1) {
    if (await clickIfVisible(checkinClose)) {
      noOverlayStreak = 0;
      await page.waitForTimeout(150);
      continue;
    }
    if (await clickIfVisible(checkinSave)) {
      noOverlayStreak = 0;
      await page.waitForTimeout(150);
      continue;
    }
    noOverlayStreak += 1;
    if (noOverlayStreak >= 3) break;
    await page.waitForTimeout(250);
  }

  await expect(checkinClose).toHaveCount(0, { timeout: 3000 });
  await expect(topNavMore).toBeVisible({ timeout: 10000 });
}
