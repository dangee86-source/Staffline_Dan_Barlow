import { test, expect } from '@playwright/test';
import type { Page } from '@playwright/test';
import { AmazonHomePage } from '../../pages/AmazonHomePage';
import { AmazonSearchResultsPage } from '../../pages/AmazonSearchResultsPage';
import { IProduct } from '../../framework/types/product';
import { URLS } from '../../framework/constants/urls';

// Test data
const product: IProduct = { name: 'iPhone 17 Pro Max' };

// Run sequentially, not in parallel.
// Reason: Amazon throttles/blocks bursts of concurrent requests from the same IP,
// which causes false failures (CAPTCHAs, blocked pages) rather than genuine bugs.
test.describe.configure({ mode: 'serial' });

// All 5 tests share ONE search (and one browser page) for the whole file instead
// of each test re-running searchFor() independently. Same reasoning as
// scenario2.spec.ts: fewer redundant live navigations against a heavy third-party
// site means a faster, less resource-intensive, less flaky run.
let page: Page;
let resultsPage: AmazonSearchResultsPage;

test.beforeAll(async ({ browser }) => {
  page = await browser.newPage();
  await page.goto(URLS.AMAZON_HOME, { waitUntil: 'domcontentloaded' });
  const homePage = new AmazonHomePage(page);
  await homePage.acceptCookiesIfPresent();
  await homePage.handleContinueShoppingIfPresent();
  await homePage.searchFor(product.name);
  resultsPage = new AmazonSearchResultsPage(page);
  await resultsPage.waitForGrid();
});

test.afterAll(async () => {
  await page.close();
});

/**
 * TC-01: Verify user lands on the Amazon UK site
 * Preconditions: None
 * Steps:
 *   1. Load the Amazon home page
 * Expected Result: Page URL contains "amazon.co.uk"
 */
test('User lands on the Amazon website', async () => {
  // Assert
  await expect(page).toHaveURL(/amazon\.co\.uk/);
});

/**
 * TC-02: Verify search returns a visible results grid
 * Preconditions: Search for "iPhone 17 Pro Max" has run (see beforeAll)
 * Steps: None — asserts against the grid loaded in beforeAll
 * Expected Result: At least one product result card is visible
 */
test('User searches for iPhone 17 Pro Max and sees the results grid', async () => {
  // Assert
  await expect(resultsPage.resultItems().first()).toBeVisible();
});

/**
 * TC-03: Verify search results are relevant to the search term
 * Preconditions: Search for "iPhone 17 Pro Max" has run (see beforeAll)
 * Steps:
 *   1. Count how many result titles contain the search term
 * Expected Result: Count is greater than 0
 * Note: Asserting an exact count is avoided — live inventory changes over time
 *       and would make this test flaky.
 */
test('User counts grid items containing only iPhone 17 Pro Max', async () => {
  // Act
  const count = await resultsPage.countItemsContaining(product.name);
  console.log(`\nGrid items containing "${product.name}": ${count}`);

  // Assert
  expect(count).toBeGreaterThan(0);
});

/**
 * TC-04: Verify the results count summary is displayed
 * Preconditions: Search for "iPhone 17 Pro Max" has run (see beforeAll)
 * Steps: None
 * Expected Result: The "results for ..." heading is visible on the page
 */
test('User sees the result count is displayed on the search page', async () => {
  // Assert
  await expect(resultsPage.resultCount()).toBeVisible();
});

/**
 * TC-05: Verify the first search result is relevant to the search term
 * Preconditions: Search for "iPhone 17 Pro Max" has run (see beforeAll)
 * Steps: None
 * Expected Result: First result title contains "iPhone"
 */
test('User sees the first result is relevant to the search term', async () => {
  // Assert
  await expect(resultsPage.firstResultTitle()).toContainText(/iPhone/i);
});
