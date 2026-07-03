import { test, expect } from '../../framework/fixtures/amazonFixture';
import { AmazonSearchResultsPage } from '../../pages/AmazonSearchResultsPage';
import { IProduct } from '../../framework/types/product';
import { AmazonProductPage } from '../../pages/AmazonProductPage';
import { AmazonBasketPage } from '../../pages/AmazonBasketPage';

// Test data
const product: IProduct = { name: 'iPhone 17 Pro Max', colour: 'silver' };

// Run sequentially, not in parallel — see scenario1.spec.ts for reasoning
// (Amazon throttles/blocks bursts of concurrent requests from one IP).
test.describe.configure({ mode: 'serial' });

/**
 * TC-01: Verify user lands on the Amazon UK site
 * Preconditions: None
 * Steps:
 *   1. Load the Amazon home page
 * Expected Result: Page URL contains "amazon.co.uk"
 */
test('User lands on the Amazon website', async ({ amazonHomePage }) => {
  // Assert
  await expect(amazonHomePage.page).toHaveURL(/amazon\.co\.uk/);
});

/**
 * TC-02: Verify user can perform a product search
 * Preconditions: User is on the Amazon home page
 * Steps:
 *   1. Search for "iPhone 17 Pro Max"
 * Expected Result: Search executes without error (covered in detail by TC-03 onward)
 */
test('User searches for iPhone 17 Pro Max', async ({ amazonHomePage }) => {
  // Act
  await amazonHomePage.searchFor(product.name);
});


/**
 * TC-03: Verify the "4 Stars & Up" filter can be applied
 * Preconditions: User is on the Amazon home page
 * Steps:
 *   1. Search for "iPhone 17 Pro Max"
 *   2. Wait for the results grid to load
 *   3. Apply the "4 Stars & Up" filter
 * Expected Result: URL contains the "p_72" query parameter (Amazon's rating-filter param)
 * Note: Verified via URL rather than the filter checkbox visual state, since the URL
 *       is a reliable signal that the filter was applied server-side.
 */
test('User filters by top rated and verifies the filter is applied', async ({ amazonHomePage }) => {
  // Arrange
  await amazonHomePage.searchFor(product.name);
  const resultsPage = new AmazonSearchResultsPage(amazonHomePage.page);
  await resultsPage.waitForGrid();

  // Act
  await resultsPage.applyTopRatedFilter();

  // Assert
  await resultsPage.verifyTopRatedFilterApplied();
});

/**
 * TC-04: Verify the product page opened from the results grid matches the search term
 * Preconditions: User is on the Amazon home page
 * Steps:
 *   1. Search for "iPhone 17 Pro Max"
 *   2. Apply the "4 Stars & Up" filter
 *   3. Open the first result
 * Expected Result: Product page title contains "iPhone 17 Pro Max"
 */
test('User selects the first result and verifies the product page title', async ({ amazonHomePage }) => {
  // Arrange
  await amazonHomePage.searchFor(product.name);
  const resultsPage = new AmazonSearchResultsPage(amazonHomePage.page);
  await resultsPage.waitForGrid();
  await resultsPage.applyTopRatedFilter();

  // Act
  await resultsPage.clickFirstResult();
  const productPage = new AmazonProductPage(amazonHomePage.page);
  const title = await productPage.getTitle();

  // Assert
  expect(title).toMatch(/iPhone 17 Pro Max/i);
});

/**
 * TC-05: Verify user can select a colour variant and add it to the basket
 * Preconditions: User is on the Amazon home page
 * Steps:
 *   1. Search for "iPhone 17 Pro Max", filter by top rated, open the first result
 *   2. Select the "Silver" colour option
 *   3. Add to basket and accept the protection plan add-on
 * Expected Result: No errors thrown during the add-to-basket flow
 *                  (basket contents are verified separately in TC-07/TC-08)
 */
test('User filters by top rated and selects the first silver iPhone', async ({ amazonHomePage }) => {
  // Arrange
  await amazonHomePage.searchFor(product.name);
  const resultsPage = new AmazonSearchResultsPage(amazonHomePage.page);
  await resultsPage.waitForGrid();
  await resultsPage.applyTopRatedFilter();
  await resultsPage.clickFirstResult();
  const productPage = new AmazonProductPage(amazonHomePage.page);

  // Act
  await productPage.selectColourAndAddToBasket(product.colour!);
});

/**
 * TC-06: Verify user can navigate to the basket after adding an item
 * Preconditions: User is on the Amazon home page
 * Steps:
 *   1. Search, filter, open product, select colour, add to basket
 *   2. Click the basket/cart link in the header
 * Expected Result: URL contains "/cart"
 */
test('User navigates to the basket', async ({ amazonHomePage }) => {
  // Arrange
  await amazonHomePage.searchFor(product.name);
  const resultsPage = new AmazonSearchResultsPage(amazonHomePage.page);
  await resultsPage.waitForGrid();
  await resultsPage.applyTopRatedFilter();
  await resultsPage.clickFirstResult();
  const productPage = new AmazonProductPage(amazonHomePage.page);
  await productPage.selectColourAndAddToBasket(product.colour!);

  // Act
  await amazonHomePage.page.getByRole('link', { name: /items in shopping basket/i }).click();

  // Assert
  await expect(amazonHomePage.page).toHaveURL(/\/cart/i);
});

/**
 * TC-07: Verify the basket contains the correct product details
 * Preconditions: User is on the Amazon home page
 * Steps:
 *   1. Search, filter, open product, select "Silver" colour, add to basket
 *   2. Navigate to the basket
 * Expected Result:
 *   - Basket item name matches "iPhone 17 Pro Max"
 *   - Basket item colour shows "Silver"
 *   - Basket item quantity is 1
 */
test('User verifies the basket contains the correct product', async ({ amazonHomePage }) => {
  // Arrange
  await amazonHomePage.searchFor(product.name);
  const resultsPage = new AmazonSearchResultsPage(amazonHomePage.page);
  await resultsPage.waitForGrid();
  await resultsPage.applyTopRatedFilter();
  await resultsPage.clickFirstResult();
  const productPage = new AmazonProductPage(amazonHomePage.page);
  await productPage.selectColourAndAddToBasket(product.colour!);
  await amazonHomePage.page.getByRole('link', { name: /items in shopping basket/i }).click();
  const basketPage = new AmazonBasketPage(amazonHomePage.page);
  await basketPage.waitForBasket();

  // Assert
  await basketPage.verifyProductName(product.name);
  await basketPage.verifyColour(product.colour!);
  await basketPage.verifyQuantity();
});

/**
 * TC-08: Verify basket price, item count and subtotal are correct
 * Preconditions: User is on the Amazon home page
 * Steps:
 *   1. Search, filter, open product
 *   2. Capture the product page price before adding to basket
 *   3. Select "Silver" colour, add to basket (incl. protection plan), navigate to basket
 * Expected Result:
 *   - Basket item price matches the price captured on the product page
 *   - Subtotal line is visible
 *   - Header item count shows 2 (phone + protection plan add-on)
 */
test('User verifies the basket price, item count and subtotal', async ({ amazonHomePage }) => {
  // Arrange
  await amazonHomePage.searchFor(product.name);
  const resultsPage = new AmazonSearchResultsPage(amazonHomePage.page);
  await resultsPage.waitForGrid();
  await resultsPage.applyTopRatedFilter();
  await resultsPage.clickFirstResult();
  const productPage = new AmazonProductPage(amazonHomePage.page);
  const priceOnProductPage = await productPage.getPrice();

  // Act
  await productPage.selectColourAndAddToBasket(product.colour!);
  await amazonHomePage.page.getByRole('link', { name: /items in shopping basket/i }).click();
  const basketPage = new AmazonBasketPage(amazonHomePage.page);
  await basketPage.waitForBasket();

  // Assert
  await basketPage.verifyItemPrice(priceOnProductPage);
  await basketPage.verifySubtotalVisible();
  await basketPage.verifyHeaderCount(2);
});
