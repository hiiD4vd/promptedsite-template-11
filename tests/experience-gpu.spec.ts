import { chromium, expect, test } from '@playwright/test';

test('opens the real WebGL experience on a supported Chrome GPU', async () => {
  const browser = await chromium.launch({ channel: 'chrome', headless: true });

  try {
    const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
    const pageErrors: string[] = [];
    page.on('pageerror', (error) => pageErrors.push(error.message));

    await page.goto('http://127.0.0.1:4178/');
    const enter = page.locator('[data-react-age-gate]').getByRole('button', { name: 'ENTER' });
    await expect(enter).toBeVisible({ timeout: 20_000 });
    await enter.click();

    await expect(page.locator('canvas')).toHaveCount(1);
    const collection = page.locator('[data-react-header]').getByRole('button', { name: 'COLLECTION' });
    await expect(collection).toBeVisible({ timeout: 20_000 });
    await collection.click();
    await expect(collection).toHaveAttribute('aria-pressed', 'true', { timeout: 10_000 });
    expect(page.url()).not.toContain('/unsupported.html');
    expect(pageErrors).toEqual([]);
  } finally {
    await browser.close();
  }
});
