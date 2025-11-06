import { test, expect, Page } from '@playwright/test';
import playwrightConfig from '@/playwright.config';
import path from 'path';

const url = (playwrightConfig.webServer as any).url;
enum Selector {
  Topbar = '.MuiToolbar-root',
  Fab = 'button.MuiFab-root',
  FileInput = `${Selector.Topbar} input`,
  TopbarTitleP = `${Selector.Topbar} p`,
  ChangeInputButton = 'button[aria-label="Change Input"]',
}

test('Visual regression testing on the home page (initial state)', async ({
  page,
}) => {
  await page.goto(url);
  await expect(page).toHaveScreenshot();
});

test.describe('Test the lihkg-snapshot-viewer application using Playwright', () => {
  let page: Page;

  test.beforeAll(async ({ browser }) => {
    page = await browser.newPage();

    await page.goto(url);

    const fileChooserPromise = page.waitForEvent('filechooser');
    await page.locator('input').click();
    const fileChooser = await fileChooserPromise;
    await fileChooser.setFiles(
      path.join(
        process.env.PWD!,
        'tests/test-assets/thread_3902532_20250415T224211Z',
      ),
    );
    await page.locator('div[id="228"]').waitFor();
  });

  test("The title should contain the thread's title", async () => {
    await expect(page).toHaveTitle(
      'Burger King好食過M記 | LIHKG Snapshot Viewer',
    );
  });

  test("The thread's title should be shown on the top bar", async () => {
    expect(await page.locator(Selector.Topbar).innerText()).toStrictEqual(
      'Burger King好食過M記',
    );
  });

  test('After clicking on a quote, the quoted message should be shown at the top of the page and the FAB will be visible. Clicking on the FAB should make the message with the quote show at the top of the page', async () => {
    const idOfMessageWithQuote = 57;
    const idOfQuotedMessage = 52;

    await page
      .locator(`div[id="${idOfMessageWithQuote}"]`)
      .scrollIntoViewIfNeeded();
    await page
      .locator(`div[id="${idOfMessageWithQuote}"] > blockquote > a`)
      .click();
    await expect(page).toHaveURL(url + `#${idOfQuotedMessage}`);
    expect(await page.locator(Selector.Fab).count()).toEqual(1);
    await page.locator(Selector.Fab).click();
    await expect(page).toHaveURL(url + `#${idOfMessageWithQuote}`);
    expect(await page.locator(Selector.Fab).count()).toEqual(0);
  });

  test('After clicking on a quote, scrolling up and clicking on the FAB, the quoted message should be shown at the top of the page. Clicking on the FAB again should make the message with the quote show at the top of the page', async () => {
    const idOfMessageWithQuote = 57;
    const idOfQuotedMessage = 52;

    await page
      .locator(`div[id="${idOfMessageWithQuote}"]`)
      .scrollIntoViewIfNeeded();
    await page
      .locator(`div[id="${idOfMessageWithQuote}"] > blockquote > a`)
      .click();
    await expect(page).toHaveURL(url + `#${idOfQuotedMessage}`);
    expect(await page.locator(Selector.Fab).count()).toEqual(1);
    await page.locator('div[id="1"]').scrollIntoViewIfNeeded();
    await expect(page.locator('div[id="1"]')).toBeInViewport();
    await page.locator(Selector.Fab).click();
    await expect(
      page.locator(`div[id="${idOfQuotedMessage}"]`),
    ).toBeInViewport();
    await expect(page).toHaveURL(url + `#${idOfQuotedMessage}`);
    await page.locator(Selector.Fab).click();
    await expect(
      page.locator(`div[id="${idOfMessageWithQuote}"]`),
    ).toBeInViewport();
    await expect(page).toHaveURL(url + `#${idOfMessageWithQuote}`);
    expect(await page.locator(Selector.Fab).count()).toEqual(0);
  });

  test('After clicking on a quote and scrolling down pass the message with the quote, the FAB should disappear', async () => {
    const idOfMessageWithQuote = 69;
    const idOfQuotedMessage = 64;

    await page
      .locator(`div[id="${idOfMessageWithQuote}"]`)
      .scrollIntoViewIfNeeded();
    await page
      .locator(`div[id="${idOfMessageWithQuote}"] > blockquote > a`)
      .click();
    await expect(page).toHaveURL(url + `#${idOfQuotedMessage}`);
    expect(await page.locator(Selector.Fab).count()).toEqual(1);
    await page
      .locator(`div[id="${idOfMessageWithQuote + 20}"]`)
      .scrollIntoViewIfNeeded();
    await expect(
      page.locator(`div[id="${idOfMessageWithQuote + 20}"]`),
    ).toBeInViewport();
    expect(await page.locator(Selector.Fab).count()).toEqual(0);
  });

  test('When clicking on the swap icon button, the file input should be shown. When the swap icon button is clicked again, the file input should be hidden', async () => {
    await expect(page.locator(Selector.FileInput)).toBeHidden();
    await expect(page.locator(Selector.TopbarTitleP)).toBeVisible();

    await page.locator(Selector.ChangeInputButton).click();

    await expect(page.locator(Selector.FileInput)).toBeInViewport();
    await expect(page.locator(Selector.TopbarTitleP)).toBeHidden();

    await page.locator(Selector.ChangeInputButton).click();

    await expect(page.locator(Selector.FileInput)).toBeHidden();
    await expect(page.locator(Selector.TopbarTitleP)).toBeVisible();
  });

  test('After clicking on a quote quoting the first message, scrolling up to the very top of the page and clicking on the FAB, the message with the quote should be shown at the top of the page', async () => {
    const idOfMessageWithQuote = 225;
    const idOfQuotedMessage = 1;

    await page
      .locator(`div[id="${idOfMessageWithQuote}"]`)
      .scrollIntoViewIfNeeded();
    await page
      .locator(`div[id="${idOfMessageWithQuote}"] > blockquote > a`)
      .click();
    await expect(page).toHaveURL(url + `#${idOfQuotedMessage}`);
    expect(await page.locator(Selector.Fab).count()).toEqual(1);
    await page.locator(Selector.Topbar).scrollIntoViewIfNeeded();
    await expect(page.locator(Selector.Topbar)).toBeInViewport({ ratio: 1 });
    await page.locator(Selector.Fab).click();
    await expect(page).toHaveURL(url + `#${idOfMessageWithQuote}`);
  });

  test('After clicking on a quote at the bottom of the page and if the bottom border of the last mesaage touches the bottom of the browser window, the FAB should disappear when clicked once', async () => {
    const idOfMessageWithQuote = 228;
    const idOfQuotedMessage = 227;

    await page
      .locator(`div[id="${idOfMessageWithQuote}"]`)
      .scrollIntoViewIfNeeded();
    await expect(page.locator(`div[id="${idOfQuotedMessage}"]`)).toBeInViewport(
      { ratio: 1 },
    );
    await page
      .locator(`div[id="${idOfMessageWithQuote}"] > blockquote > a`)
      .click();
    await expect(page).toHaveURL(url + `#${idOfQuotedMessage}`);
    expect(await page.locator(Selector.Fab).count()).toEqual(1);

    // Scroll up a little (1 pixel) because some combinations of window size / zoom level / browser might induce nuances in calculating the scroll position
    const yBeforeScroll = await page.evaluate(() => window.scrollY);
    await page.evaluate(() => window.scrollBy(0, -1));
    const yAfterScroll = await page.evaluate(() => window.scrollY);
    expect(yBeforeScroll - yAfterScroll).toStrictEqual(1);

    await page.locator(Selector.Fab).click();
    expect(await page.locator(Selector.Fab).count()).toEqual(0);
  });
});
