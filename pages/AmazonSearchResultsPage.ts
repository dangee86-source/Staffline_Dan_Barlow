// This page object handles everything on Amazon's search results page

import { Page, expect } from '@playwright/test';
import { BasePage } from './BasePage';

export class AmazonSearchResultsPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  // Finds every product card on the search results page
  resultItems = () => this.page.locator('[data-component-type="s-search-result"]');

  // The "4 Stars & Up" filter link in the left sidebar
  filterByTopRated = () => this.page.getByRole('link', { name: 'Apply the filter 4 Stars & Up' });

  // Waits for the search results page to fully load
  async waitForGrid() {
    await this.page.waitForURL(/\/s\?k=/, { waitUntil: 'domcontentloaded' });
    await this.resultItems().first().waitFor({ state: 'visible' });
  }

  // Clicks the "4 Stars & Up" filter and waits for the page to reload
  async applyTopRatedFilter() {
    await this.filterByTopRated().click();
    await this.page.waitForLoadState('domcontentloaded');
    await this.resultItems().first().waitFor({ state: 'visible' });
  }

  // Gets all product titles at once and counts how many contain the given text
  async countItemsContaining(text: string): Promise<number> {
    const titles = await this.page
      .locator('[data-component-type="s-search-result"] h2 span')
      .allTextContents();
    return titles.filter(t => t.toLowerCase().includes(text.toLowerCase())).length;
  }

  // Clicks the first product result link and waits for the product page to load.
  async clickFirstResult() {
    await this.page.locator('[data-component-type="s-search-result"] a[href*="/dp/"]').first().click();
    await this.page.waitForLoadState('domcontentloaded');
  }

  // The "1-16 of over X results" count heading at the top of the results page
  resultCount = () => this.page.getByText(/results for/i).first();

  // The first result title that contains the product name — skips brand-only spans like "Apple"
  firstResultTitle = () =>
    this.page.locator('[data-component-type="s-search-result"] h2 span').filter({ hasText: /iPhone/i }).first();

  // Verifies the top-rated filter was applied by checking the URL contains Amazon's review filter param
  async verifyTopRatedFilterApplied() {
    const url = this.page.url();
    expect(url).toMatch(/p_72/);
  }
}
