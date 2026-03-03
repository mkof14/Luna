import { expect, test } from '@playwright/test';

test('onboarding and first check-in flow works', async ({ page }) => {
  await page.goto('/');

  await expect(page.getByTestId('onboarding-begin')).toBeVisible();
  await page.getByTestId('onboarding-begin').click();

  await expect(page.getByTestId('dashboard-checkin-start')).toBeVisible();
  await page.getByTestId('dashboard-checkin-start').click();

  await expect(page.getByRole('heading', { name: /daily check-in|как вы сегодня/i })).toBeVisible();
  await page.getByTestId('checkin-save').click();

  const eventTypes = await page.evaluate(() => {
    const raw = window.localStorage.getItem('luna_event_log_v3');
    if (!raw) return [];
    try {
      return JSON.parse(raw).map((event) => event.type);
    } catch {
      return [];
    }
  });

  expect(eventTypes).toContain('ONBOARDING_COMPLETE');
  expect(eventTypes).toContain('DAILY_CHECKIN');
});
