// Page object for Amazon's search results ("grid") page: locating result cards,
// applying filters, reading result text, and navigating into a product.

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

  // Waits for the search results page to fully load.
  // Uses `waitForURL` (matches Amazon's `/s?k=` search path) + waiting for the first
  // result card to be visible, rather than `waitForLoadState('networkidle')`.
  // Reason: Amazon's results page continuously fires background ad/analytics requests,
  // so the network never truly goes idle and `networkidle` would time out.
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

  // Gets all product titles at once and counts how many contain the given text.
  // `allTextContents()` reads every matching element in a single round-trip, which is
  // faster and less flaky than looping and calling `textContent()` per element
  // (each of which is its own timeout-able operation).
  async countItemsContaining(text: string): Promise<number> {
    const titles = await this.page
      .locator('[data-component-type="s-search-result"] h2 span')
      .allTextContents();
    return titles.filter(t => t.toLowerCase().includes(text.toLowerCase())).length;
  }

  // Clicks the first product result link and waits for the product page to load.
  // Scoped to `a[href*="/dp/"]` (Amazon's product-detail-page URL pattern) specifically
  // to skip the sponsored carousel banner at the top of the grid, which has no
  // standard product link and would otherwise be matched as "the first result".
  async clickFirstResult() {
    await this.page.locator('[data-component-type="s-search-result"] a[href*="/dp/"]').first().click();
    await this.page.waitForLoadState('domcontentloaded');
  }

  // The "1-16 of over X results" count heading at the top of the results page
  resultCount = () => this.page.getByText(/results for/i).first();

  // The first result title that contains the product name — skips brand-only spans like "Apple"
  firstResultTitle = () =>
    this.page.locator('[data-component-type="s-search-result"] h2 span').filter({ hasText: /iPhone/i }).first();

  // Verifies the top-rated filter was applied by checking the URL contains Amazon's
  // review-filter query param (`p_72`). Checking the URL is a more reliable signal
  // than a visual checkbox state, because it confirms the filter was actually applied
  // server-side (i.e. the results themselves were re-fetched/filtered).
  async verifyTopRatedFilterApplied() {
    const url = this.page.url();
    expect(url).toMatch(/p_72/);
  }
}
