import { Page } from '@playwright/test';
import { BasePage } from './BasePage';

// Page object for the Amazon home page. This is the entry point for every test —
// it's what the `amazonHomePage` fixture returns after navigation and pop-up handling.
export class AmazonHomePage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  // Types the given search term into the header search box and submits it.
  // Waits for the resulting page to at least reach `domcontentloaded` before
  // returning control to the caller, so the next action doesn't race the navigation.
  async searchFor(query: string) {
    await this.searchBox().fill(query);
    await this.searchButton().click();
    await this.page.waitForLoadState('domcontentloaded');
  }
}
