import { expect, test } from '@playwright/test';


test('mobile layout keeps stage content and projects readable', async ({ page }, testInfo) => {
  test.skip(!testInfo.project.name.startsWith('mobile'), 'Mobile regression coverage');

  await page.goto('/');

  const viewportWidth = page.viewportSize()?.width ?? 0;
  const titleSize = await page.locator('.site-title').evaluate(element => (
    Number.parseFloat(getComputedStyle(element).fontSize)
  ));
  expect(titleSize).toBeLessThanOrEqual(viewportWidth * 0.48);


  await page.goto('/#projects');
  await expect(page.locator('.featured').first()).toBeVisible();
  await expect(page.locator('.archive-row').first()).toBeVisible();
  const columns = await page.locator('.archive-row').first().evaluate(element => (
    getComputedStyle(element).gridTemplateColumns
  ));
  expect(columns.trim().split(/\s+/)).toHaveLength(1);
  await expect(page.locator('body')).toHaveJSProperty(
    'scrollWidth',
    await page.locator('body').evaluate(element => element.clientWidth),
  );
});

test('mobile shell controls provide touch-sized targets', async ({ page }, testInfo) => {
  test.skip(!testInfo.project.name.startsWith('mobile'), 'Mobile regression coverage');

  await page.goto('/');

  for (const target of await page.locator('.site-navigation a, .social-links a').all()) {
    const box = await target.boundingBox();
    expect(box?.height).toBeGreaterThanOrEqual(44);
    expect(box?.width).toBeGreaterThanOrEqual(44);
  }
});
