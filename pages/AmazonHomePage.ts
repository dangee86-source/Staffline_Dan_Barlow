import { Page } from '@playwright/test';
import { BasePage } from './BasePage';

// Page object for the Amazon home page.
export class AmazonHomePage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  // Enters the given search term and submits it.
  async searchFor(query: string) {
    await this.searchBox().fill(query);
    await this.searchButton().click();
    await this.page.waitForLoadState('domcontentloaded');
  }
}
