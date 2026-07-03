import { test, expect } from '../../framework/fixtures/amazonFixture';
import { AmazonSearchResultsPage } from '../../pages/AmazonSearchResultsPage';
import { IProduct } from '../../framework/types/product';

// Test data
const product: IProduct = { name: 'iPhone 17 Pro Max' };

// Run sequentially, not in parallel.
// Reason: Amazon throttles/blocks bursts of concurrent requests from the same IP,
// which causes false failures (CAPTCHAs, blocked pages) rather than genuine bugs.
test.describe.configure({ mode: 'serial' });

/**
 * TC-01: Verify user lands on the Amazon UK site
 * Preconditions: None (fixture navigates to Amazon home page and dismisses
 *                cookie banner / interstitial before the test body runs)
 * Steps:
 *   1. Load the Amazon home page
 * Expected Result: Page URL contains "amazon.co.uk"
 */
test('User lands on the Amazon website', async ({ amazonHomePage }) => {
  // Assert
  await expect(amazonHomePage.page).toHaveURL(/amazon\.co\.uk/);
});

/**
 * TC-02: Verify search returns a visible results grid
 * Preconditions: User is on the Amazon home page
 * Steps:
 *   1. Search for "iPhone 17 Pro Max"
 *   2. Wait for the results grid to load
 * Expected Result: At least one product result card is visible
 */
test('User searches for iPhone 17 Pro Max and sees the results grid', async ({ amazonHomePage }) => {
  // Act
  await amazonHomePage.searchFor(product.name);

  const resultsPage = new AmazonSearchResultsPage(amazonHomePage.page);
  await resultsPage.waitForGrid();

  // Assert
  await expect(resultsPage.resultItems().first()).toBeVisible();
});

/**
 * TC-03: Verify search results are relevant to the search term
 * Preconditions: User is on the Amazon home page
 * Steps:
 *   1. Search for "iPhone 17 Pro Max"
 *   2. Wait for the results grid to load
 *   3. Count how many result titles contain the search term
 * Expected Result: Count is greater than 0
 * Note: Asserting an exact count is avoided — live inventory changes over time
 *       and would make this test flaky.
 */
test('User counts grid items containing only iPhone 17 Pro Max', async ({ amazonHomePage }) => {
  // Act
  await amazonHomePage.searchFor(product.name);

  const resultsPage = new AmazonSearchResultsPage(amazonHomePage.page);
  await resultsPage.waitForGrid();

  const count = await resultsPage.countItemsContaining(product.name);
  console.log(`\nGrid items containing "${product.name}": ${count}`);

  // Assert
  expect(count).toBeGreaterThan(0);
});

/**
 * TC-04: Verify the results count summary is displayed
 * Preconditions: User is on the Amazon home page
 * Steps:
 *   1. Search for "iPhone 17 Pro Max"
 *   2. Wait for the results grid to load
 * Expected Result: The "results for ..." heading is visible on the page
 */
test('User sees the result count is displayed on the search page', async ({ amazonHomePage }) => {
  // Act
  await amazonHomePage.searchFor(product.name);

  const resultsPage = new AmazonSearchResultsPage(amazonHomePage.page);
  await resultsPage.waitForGrid();

  // Assert
  await expect(resultsPage.resultCount()).toBeVisible();
});

/**
 * TC-05: Verify the first search result is relevant to the search term
 * Preconditions: User is on the Amazon home page
 * Steps:
 *   1. Search for "iPhone 17 Pro Max"
 *   2. Wait for the results grid to load
 * Expected Result: First result title contains "iPhone"
 */
test('User sees the first result is relevant to the search term', async ({ amazonHomePage }) => {
  // Act
  await amazonHomePage.searchFor(product.name);

  const resultsPage = new AmazonSearchResultsPage(amazonHomePage.page);
  await resultsPage.waitForGrid();

  // Assert
  await expect(resultsPage.firstResultTitle()).toContainText(/iPhone/i);
});
