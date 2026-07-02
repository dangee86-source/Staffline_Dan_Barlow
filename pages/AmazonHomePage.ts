import { Page } from '@playwright/test';
import { BasePage } from './BasePage';

export class AmazonHomePage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  async searchFor(query: string) {
    await this.searchBox().fill(query);
    await this.searchButton().click();
    await this.page.waitForLoadState('domcontentloaded');
  }
}
