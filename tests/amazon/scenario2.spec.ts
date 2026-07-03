import { test, expect } from '@playwright/test';
import type { Page } from '@playwright/test';
import { AmazonHomePage } from '../../pages/AmazonHomePage';
import { AmazonSearchResultsPage } from '../../pages/AmazonSearchResultsPage';
import { AmazonProductPage } from '../../pages/AmazonProductPage';
import { AmazonBasketPage } from '../../pages/AmazonBasketPage';
import { IProduct } from '../../framework/types/product';
import { URLS } from '../../framework/constants/urls';

// Test data
const product: IProduct = { name: 'iPhone 17 Pro Max', colour: 'silver' };

// Run sequentially, not in parallel — see scenario1.spec.ts for reasoning
// (Amazon throttles/blocks bursts of concurrent requests from one IP).
test.describe.configure({ mode: 'serial' });

// These 8 tests share ONE browser page for the whole file instead of each test
// independently repeating search -> filter -> select colour -> add to basket from
// scratch. This models what the tests actually are — one continuous user journey —
// and avoids ~6 redundant full-page navigations to a live, heavy third-party site
// per run. Doing that repeatedly was the root cause of an intermittent flake where
// a different test would fail instantly (0ms, no assertion error) partway through
// a full run: the repeated real navigations built up memory/network load in a
// single long-lived browser session until something gave out. Isolating each test
// with independent state is normally preferred, but for an expensive dependent
// journey like this one, Playwright's own docs recommend exactly this
// shared-page-in-serial-mode pattern.
let page: Page;
let homePage: AmazonHomePage;
let resultsPage: AmazonSearchResultsPage;
let productPage: AmazonProductPage;
let basketPage: AmazonBasketPage;
let priceOnProductPage: string;

test.beforeAll(async ({ browser }) => {
  page = await browser.newPage();
  await page.goto(URLS.AMAZON_HOME, { waitUntil: 'domcontentloaded' });
  homePage = new AmazonHomePage(page);
  await homePage.acceptCookiesIfPresent();
  await homePage.handleContinueShoppingIfPresent();
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
 * TC-02: Verify user can perform a product search
 * Preconditions: User is on the Amazon home page
 * Steps:
 *   1. Search for "iPhone 17 Pro Max"
 * Expected Result: Search executes without error (covered in detail by TC-03 onward)
 */
test('User searches for iPhone 17 Pro Max', async () => {
  // Act
  await homePage.searchFor(product.name);
});


/**
 * TC-03: Verify the "4 Stars & Up" filter can be applied
 * Preconditions: TC-02 has searched for "iPhone 17 Pro Max"
 * Steps:
 *   1. Wait for the results grid to load
 *   2. Apply the "4 Stars & Up" filter
 * Expected Result: URL contains the "p_72" query parameter (Amazon's rating-filter param)
 * Note: Verified via URL rather than the filter checkbox visual state, since the URL
 *       is a reliable signal that the filter was applied server-side.
 */
test('User filters by top rated and verifies the filter is applied', async () => {
  // Arrange
  resultsPage = new AmazonSearchResultsPage(page);
  await resultsPage.waitForGrid();

  // Act
  await resultsPage.applyTopRatedFilter();

  // Assert
  await resultsPage.verifyTopRatedFilterApplied();
});

/**
 * TC-04: Verify the product page opened from the results grid matches the search term
 * Preconditions: TC-03 has applied the top-rated filter
 * Steps:
 *   1. Open the first result
 * Expected Result: Product page title contains "iPhone 17 Pro Max"
 */
test('User selects the first result and verifies the product page title', async () => {
  // Act
  await resultsPage.clickFirstResult();
  productPage = new AmazonProductPage(page);
  const title = await productPage.getTitle();

  // Assert
  expect(title).toMatch(/iPhone 17 Pro Max/i);
});

/**
 * TC-05: Verify user can select a colour variant and add it to the basket
 * Preconditions: TC-04 has opened the product page
 * Steps:
 *   1. Capture the displayed price
 *   2. Select the "Silver" colour option
 *   3. Add to basket and accept the protection plan add-on
 * Expected Result: No errors thrown during the add-to-basket flow
 *                  (basket contents are verified separately in TC-07/TC-08)
 */
test('User selects the silver colour and adds the product to the basket', async () => {
  // Arrange
  priceOnProductPage = await productPage.getPrice();

  // Act
  await productPage.selectColourAndAddToBasket(product.colour!);
});

/**
 * TC-06: Verify user can navigate to the basket after adding an item
 * Preconditions: TC-05 has added the product to the basket
 * Steps:
 *   1. Click the basket/cart link in the header
 * Expected Result: URL contains "/cart"
 */
test('User navigates to the basket', async () => {
  // Act
  await page.getByRole('link', { name: /items in shopping basket/i }).click();

  // Assert
  await expect(page).toHaveURL(/\/cart/i);
});

/**
 * TC-07: Verify the basket contains the correct product details
 * Preconditions: TC-06 has navigated to the basket
 * Steps:
 *   1. Wait for the basket page to load
 * Expected Result:
 *   - Basket item name matches "iPhone 17 Pro Max"
 *   - Basket item colour shows "Silver"
 *   - Basket item quantity is 1
 */
test('User verifies the basket contains the correct product', async () => {
  // Arrange
  basketPage = new AmazonBasketPage(page);
  await basketPage.waitForBasket();

  // Assert
  await basketPage.verifyProductName(product.name);
  await basketPage.verifyColour(product.colour!);
  await basketPage.verifyQuantity();
});

/**
 * TC-08: Verify basket price, item count and subtotal are correct
 * Preconditions: TC-07 has confirmed the basket contains the product
 * Steps: None — re-uses the price captured in TC-05 and the basket loaded in TC-07
 * Expected Result:
 *   - Basket item price matches the price captured on the product page
 *   - Subtotal line is visible
 *   - Header item count shows 2 (phone + protection plan add-on)
 */
test('User verifies the basket price, item count and subtotal', async () => {
  // Assert
  await basketPage.verifyItemPrice(priceOnProductPage);
  await basketPage.verifySubtotalVisible();
  await basketPage.verifyHeaderCount(2);
});
