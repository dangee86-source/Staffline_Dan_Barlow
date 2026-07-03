// Custom Playwright fixture that extends the base `test` with a ready-to-use
// `amazonHomePage`. Every test that destructures `{ amazonHomePage }` automatically
// gets a fresh page that has already navigated to Amazon and cleared the common
// pop-ups, so individual tests don't have to repeat that setup/boilerplate.
import { test as base } from '@playwright/test';
import { AmazonHomePage } from '../../pages/AmazonHomePage';
import { URLS } from '../constants/urls';

type Fixtures = {
  amazonHomePage: AmazonHomePage;
};

export const test = base.extend<Fixtures>({
  amazonHomePage: async ({ page }, use) => {
    // Arrange: land on Amazon UK before the test body runs.
    await page.goto(URLS.AMAZON_HOME, { waitUntil: 'domcontentloaded' });
    const amazonHomePage = new AmazonHomePage(page);

    // Amazon shows a cookie consent banner and, occasionally, a "Continue shopping"
    // interstitial (bot-check style page). Both are dismissed here, once, so every
    // test starts from a clean, interactable home page regardless of whether they appeared.
    await amazonHomePage.acceptCookiesIfPresent();
    await amazonHomePage.handleContinueShoppingIfPresent();

    // Hand the ready-to-use page object to the test.
    await use(amazonHomePage);
  },
});

// Re-export `expect` from the same module so test files only need one import
// (`from '../../framework/fixtures/amazonFixture'`) instead of importing
// `test` from here and `expect` from '@playwright/test' separately.
export { expect } from '@playwright/test';
