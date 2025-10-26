import { test, expect, Page } from '@playwright/test';
import playwrightConfig from '@/playwright.config';
import path from 'path';

test.describe('Test the lihkg-snapshot-viewer application using Playwright', () => {
  const URL = (playwrightConfig.webServer as any).url;
  let page: Page;

  test.beforeAll(async ({ browser }) => {
    page = await browser.newPage();

    await page.goto(URL);

    const fileChooserPromise = page.waitForEvent('filechooser');
    await page.locator('input').click();
    const fileChooser = await fileChooserPromise;
    await fileChooser.setFiles(
      path.join(
        process.env.PWD!,
        'tests/test-assets/thread_3952556_20251025T205338Z',
      ),
    );
    await page.locator('div[id="131"]').waitFor();
  });

  test("The title should contain the thread's title", async () => {
    await expect(page).toHaveTitle(
      'LIHKG 更新公告 (2025-06-27) | LIHKG Snapshot Viewer',
    );
  });

  test("The thread's title should be shown on the top bar", async () => {
    expect(await page.locator('.MuiToolbar-root').innerText()).toStrictEqual(
      'LIHKG 更新公告 (2025-06-27)',
    );
  });

  test('After clicking on a quote, the quoted message should be shown at the top of the page and the FAB will be visible. Clicking on the FAB should make the message with the quote show at the top of the page', async () => {
    await page.locator('div[id="125"]').scrollIntoViewIfNeeded();
    await page.locator('div[id="125"] > blockquote > a').click();
    await expect(page).toHaveURL(URL + '#124');
    expect(await page.locator('button.MuiFab-root').count()).toEqual(1);
    await page.locator('button.MuiFab-root').click();
    await expect(page).toHaveURL(URL + '#125');
    expect(await page.locator('button.MuiFab-root').count()).toEqual(0);
  });

  test('After clicking on a quote, scrolling up and clicking on the FAB, the quoted message should be shown at the top of the page. Clicking on the FAB again should make the message with the quote show at the top of the page', async () => {
    await page.locator('div[id="125"]').scrollIntoViewIfNeeded();
    await page.locator('div[id="125"] > blockquote > a').click();
    await expect(page).toHaveURL(URL + '#124');
    expect(await page.locator('button.MuiFab-root').count()).toEqual(1);
    await page.locator('div[id="1"]').scrollIntoViewIfNeeded();
    await expect(page.locator('div[id="1"]')).toBeInViewport();
    await page.locator('button.MuiFab-root').click();
    await expect(page.locator('div[id="124"]')).toBeInViewport();
    await expect(page).toHaveURL(URL + '#124');
    await page.locator('button.MuiFab-root').click();
    await expect(page.locator('div[id="125"]')).toBeInViewport();
    await expect(page).toHaveURL(URL + '#125');
    expect(await page.locator('button.MuiFab-root').count()).toEqual(0);
  });

  test('After clicking on a quote and scrolling down pass the message with the quote, the FAB should disappear', async () => {
    await page.locator('div[id="21"]').scrollIntoViewIfNeeded();
    await page.locator('div[id="21"] > blockquote > a').click();
    await expect(page).toHaveURL(URL + '#11');
    expect(await page.locator('button.MuiFab-root').count()).toEqual(1);
    await page.locator('div[id="30"]').scrollIntoViewIfNeeded();
    await expect(page.locator('div[id="30"]')).toBeInViewport();
    expect(await page.locator('button.MuiFab-root').count()).toEqual(0);
  });

  test('When clicking on the swap icon button, the file input should be shown. When the swap icon button is clicked again, the file input should be hidden', async () => {
    await expect(page.locator('.MuiToolbar-root input')).toBeHidden();
    await expect(page.locator('.MuiToolbar-root p')).toBeVisible();

    await page.locator('button[aria-label="Change Input"]').click();

    await expect(page.locator('.MuiToolbar-root input')).toBeInViewport();
    await expect(page.locator('.MuiToolbar-root p')).toBeHidden();

    await page.locator('button[aria-label="Change Input"]').click();

    await expect(page.locator('.MuiToolbar-root input')).toBeHidden();
    await expect(page.locator('.MuiToolbar-root p')).toBeVisible();
  });
});
