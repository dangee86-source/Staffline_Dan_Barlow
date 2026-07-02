import { test, expect } from '../../framework/fixtures/amazonFixture';
import { AmazonSearchResultsPage } from '../../pages/AmazonSearchResultsPage';
import { IProduct } from '../../framework/types/product';
import { AmazonProductPage } from '../../pages/AmazonProductPage';
import { AmazonBasketPage } from '../../pages/AmazonBasketPage';


const product: IProduct = { name: 'iPhone 17 Pro Max', colour: 'silver' };

test.describe.configure({ mode: 'serial' });

test('User lands on the Amazon website', async ({ amazonHomePage }) => {
  await expect(amazonHomePage.page).toHaveURL(/amazon\.co\.uk/);
});

test('User searches for iPhone 17 Pro Max', async ({ amazonHomePage }) => {
  await amazonHomePage.searchFor(product.name);
});


test('User filters by top rated and verifies the filter is applied', async ({ amazonHomePage }) => {
  await amazonHomePage.searchFor(product.name);
  const resultsPage = new AmazonSearchResultsPage(amazonHomePage.page);
  await resultsPage.waitForGrid();
  await resultsPage.applyTopRatedFilter();
  await resultsPage.verifyTopRatedFilterApplied();
});

test('User selects the first result and verifies the product page title', async ({ amazonHomePage }) => {
  await amazonHomePage.searchFor(product.name);
  const resultsPage = new AmazonSearchResultsPage(amazonHomePage.page);
  await resultsPage.waitForGrid();
  await resultsPage.applyTopRatedFilter();
  await resultsPage.clickFirstResult();
  const productPage = new AmazonProductPage(amazonHomePage.page);
  const title = await productPage.getTitle();
  expect(title).toMatch(/iPhone 17 Pro Max/i);
});

test('User filters by top rated and selects the first silver iPhone', async ({ amazonHomePage }) => {
  await amazonHomePage.searchFor(product.name);
  const resultsPage = new AmazonSearchResultsPage(amazonHomePage.page);
  await resultsPage.waitForGrid();
  await resultsPage.applyTopRatedFilter();
  await resultsPage.clickFirstResult();
  const productPage = new AmazonProductPage(amazonHomePage.page);
  await productPage.selectColourAndAddToBasket(product.colour!);
});

test('User navigates to the basket', async ({ amazonHomePage }) => {
  await amazonHomePage.searchFor(product.name);
  const resultsPage = new AmazonSearchResultsPage(amazonHomePage.page);
  await resultsPage.waitForGrid();
  await resultsPage.applyTopRatedFilter();
  await resultsPage.clickFirstResult();
  const productPage = new AmazonProductPage(amazonHomePage.page);
  await productPage.selectColourAndAddToBasket(product.colour!);
  await amazonHomePage.page.getByRole('link', { name: /items in shopping basket/i }).click();
  await expect(amazonHomePage.page).toHaveURL(/\/cart/i);
});

test('User verifies the basket contains the correct product', async ({ amazonHomePage }) => {
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
  await basketPage.verifyProductName(product.name);
  await basketPage.verifyColour(product.colour!);
  await basketPage.verifyQuantity();
});

test('User verifies the basket price, item count and subtotal', async ({ amazonHomePage }) => {
  await amazonHomePage.searchFor(product.name);
  const resultsPage = new AmazonSearchResultsPage(amazonHomePage.page);
  await resultsPage.waitForGrid();
  await resultsPage.applyTopRatedFilter();
  await resultsPage.clickFirstResult();
  const productPage = new AmazonProductPage(amazonHomePage.page);
  const priceOnProductPage = await productPage.getPrice();
  await productPage.selectColourAndAddToBasket(product.colour!);
  await amazonHomePage.page.getByRole('link', { name: /items in shopping basket/i }).click();
  const basketPage = new AmazonBasketPage(amazonHomePage.page);
  await basketPage.waitForBasket();
  await basketPage.verifyItemPrice(priceOnProductPage);
  await basketPage.verifySubtotalVisible();
  await basketPage.verifyHeaderCount(2);
});



