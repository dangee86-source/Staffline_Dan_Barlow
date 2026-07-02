import { test as base } from '@playwright/test';
import { AmazonHomePage } from '../../pages/AmazonHomePage';
import { URLS } from '../constants/urls';

type Fixtures = {
  amazonHomePage: AmazonHomePage;
};

export const test = base.extend<Fixtures>({
  amazonHomePage: async ({ page }, use) => {
    await page.goto(URLS.AMAZON_HOME, { waitUntil: 'domcontentloaded' });
    const amazonHomePage = new AmazonHomePage(page);
    await amazonHomePage.acceptCookiesIfPresent();
    await amazonHomePage.handleContinueShoppingIfPresent();
    await use(amazonHomePage);
  },
});

export { expect } from '@playwright/test';
