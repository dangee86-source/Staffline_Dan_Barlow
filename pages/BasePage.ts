import { Page } from '@playwright/test';

// Base class for the Page Object Model (POM). Holds locators and behaviour that are
// shared across multiple pages (cookie banner, search box) so each page-specific
// class (AmazonHomePage, AmazonProductPage, etc.) only defines what's unique to it.
export class BasePage {
  constructor(public readonly page: Page) {}

  cookieAcceptButton = () => this.page.locator('#sp-cc-accept');
  searchBox = () => this.page.locator('#twotabsearchtextbox');
  searchButton = () => this.page.locator('#nav-search-submit-button');

  // Dismisses Amazon's cookie consent banner if it appears.
  // Uses try/catch + a short timeout rather than a hard `expect` because the banner
  // is intermittent (e.g. won't reappear once a cookie is already set) and its
  // absence is not a test failure.
  async acceptCookiesIfPresent() {
    try {
      await this.cookieAcceptButton().waitFor({ state: 'visible', timeout: 5000 });
      await this.cookieAcceptButton().click();
    } catch {
      // Cookie banner not present — continue
    }
  }

  // Dismisses the "Continue shopping" interstitial (a bot-check-style page Amazon
  // occasionally shows) if it appears. Same intermittent-by-design reasoning as above.
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
