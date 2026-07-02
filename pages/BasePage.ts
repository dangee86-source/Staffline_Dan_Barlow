import { Page } from '@playwright/test';

export class BasePage {
  constructor(public readonly page: Page) {}

  cookieAcceptButton = () => this.page.locator('#sp-cc-accept');
  searchBox = () => this.page.locator('#twotabsearchtextbox');
  searchButton = () => this.page.locator('#nav-search-submit-button');

  async acceptCookiesIfPresent() {
    try {
      await this.cookieAcceptButton().waitFor({ state: 'visible', timeout: 5000 });
      await this.cookieAcceptButton().click();
    } catch {
      // Cookie banner not present — continue
    }
  }

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
