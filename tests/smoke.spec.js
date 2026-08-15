import { expect, test } from '@playwright/test';

test('Home resets a previously selected stage view', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Architecture' }).click();

  await expect(page.locator('body')).toHaveClass(/view-architecture/);

  await page.locator('.site-navigation a[href="#home"]').click();

  await expect(page.locator('body')).toHaveClass(/view-home/);
  await expect(page.getByRole('heading', { name: 'Nick Rios' })).toBeVisible();
});

test('an article opens in reading mode and restores the index', async ({ page }) => {
  await page.goto('/#blog');
  await page.locator('.blog-row').first().click();

  const articleTitle = page.locator('[data-blog-reader-title]');
  await expect(page.locator('body')).toHaveClass(/is-blog-reading/);
  await expect(articleTitle).toBeVisible();
  await expect(articleTitle).toBeFocused();
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBeLessThan(2);
  await expect(page.locator('.page.home')).toBeHidden();
  await expect(page.locator('.page.projects')).toBeHidden();

  await page.getByRole('link', { name: 'All writing' }).click();

  await expect(page.locator('body')).not.toHaveClass(/is-blog-reading/);
  await expect(page.locator('[data-blog-index]')).toBeVisible();
  await expect(page.locator('[data-blog-index-title]')).toBeFocused();
  await expect(page.locator('.page.home')).toBeVisible();
  await expect(page.locator('.page.projects')).toBeVisible();
});

test('mobile layout keeps stage content and projects readable', async ({ page }, testInfo) => {
  test.skip(!testInfo.project.name.startsWith('mobile'), 'Mobile regression coverage');

  await page.goto('/');

  const viewportWidth = page.viewportSize()?.width ?? 0;
  const titleSize = await page.locator('.site-title').evaluate(element => (
    Number.parseFloat(getComputedStyle(element).fontSize)
  ));
  expect(titleSize).toBeLessThanOrEqual(viewportWidth * 0.48);

  await page.getByRole('button', { name: 'Architecture' }).click();
  await expect(page.getByRole('heading', { name: 'Performance that scales' }))
    .toBeVisible({ timeout: 6000 });
  await expect(page.locator('.stage-content ul')).toBeVisible();

  await page.goto('/#projects');
  const firstProjectRow = page.locator('.project-item .row').first();
  await expect(firstProjectRow).toHaveCSS('flex-direction', 'column');
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
