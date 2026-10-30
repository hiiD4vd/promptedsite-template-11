import { expect, test } from '@playwright/test';

const runtimePattern = '**/assets/js/app.1782836328290.js';

test('serves the branded unsupported-browser fallback', async ({ page }) => {
  await page.goto('/');

  await expect(page).toHaveURL(/unsupported\.html/);
  await expect(page.getByRole('heading', { name: 'Your browser is not supported' })).toBeVisible();
});

test('shows an accessible recovery state when the runtime fails', async ({ page }) => {
  await page.route(runtimePattern, (route) => route.abort('failed'));
  await page.goto('/');

  await expect(page.getByRole('alert')).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Unable to start' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Retry' })).toBeVisible();
});

test('asks narrow landscape devices to rotate', async ({ page }) => {
  await page.setViewportSize({ width: 740, height: 360 });
  await page.route(runtimePattern, (route) =>
    route.fulfill({ status: 200, contentType: 'text/javascript', body: '' }),
  );
  await page.goto('/');

  await expect(page.getByText('Please rotate your device')).toBeVisible();
});
