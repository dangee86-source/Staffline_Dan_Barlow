import { Page } from '@playwright/test';

// Base class shared by all page objects. Holds locators/behaviour common to
// more than one page (cookie banner, header search box).
export class BasePage {
  constructor(public readonly page: Page) {}

  cookieAcceptButton = () => this.page.locator('#sp-cc-accept');
  searchBox = () => this.page.locator('#twotabsearchtextbox');
  searchButton = () => this.page.locator('#nav-search-submit-button');

  // Dismisses the cookie consent banner if it is shown. Optional step — the
  // banner does not always appear.
  async acceptCookiesIfPresent() {
    try {
      await this.cookieAcceptButton().waitFor({ state: 'visible', timeout: 5000 });
      await this.cookieAcceptButton().click();
    } catch {
      // Cookie banner not present — continue
    }
  }

  // Dismisses the "Continue shopping" interstitial if it is shown. Optional
  // step — the interstitial does not always appear.
  async handleContinueShoppingIfPresent() {
    try {
      const btn = this.page.getByRole('button', { name: 'Continue shopping' });
      await btn.waitFor({ state: 'visible', timeout: 5000 });
      await btn.click();
    } catch {
      // Interstitial page not present — continue
    }
  }
}
