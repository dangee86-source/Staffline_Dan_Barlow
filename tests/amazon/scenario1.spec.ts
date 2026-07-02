import { test, expect } from '../../framework/fixtures/amazonFixture';
import { AmazonSearchResultsPage } from '../../pages/AmazonSearchResultsPage';
import { IProduct } from '../../framework/types/product';

const product: IProduct = { name: 'iPhone 17 Pro Max' };

test.describe.configure({ mode: 'serial' });

test('User lands on the Amazon website', async ({ amazonHomePage }) => {
  await expect(amazonHomePage.page).toHaveURL(/amazon\.co\.uk/);
});

test('User searches for iPhone 17 Pro Max and sees the results grid', async ({ amazonHomePage }) => {
  await amazonHomePage.searchFor(product.name);

  const resultsPage = new AmazonSearchResultsPage(amazonHomePage.page);
  await resultsPage.waitForGrid();

  await expect(resultsPage.resultItems().first()).toBeVisible();
});

test('User counts grid items containing only iPhone 17 Pro Max', async ({ amazonHomePage }) => {
  await amazonHomePage.searchFor(product.name);

  const resultsPage = new AmazonSearchResultsPage(amazonHomePage.page);
  await resultsPage.waitForGrid();

  const count = await resultsPage.countItemsContaining(product.name);
  console.log(`\nGrid items containing "${product.name}": ${count}`);

  expect(count).toBeGreaterThan(0);
});

test('User sees the result count is displayed on the search page', async ({ amazonHomePage }) => {
  await amazonHomePage.searchFor(product.name);

  const resultsPage = new AmazonSearchResultsPage(amazonHomePage.page);
  await resultsPage.waitForGrid();

  await expect(resultsPage.resultCount()).toBeVisible();
});

test('User sees the first result is relevant to the search term', async ({ amazonHomePage }) => {
  await amazonHomePage.searchFor(product.name);

  const resultsPage = new AmazonSearchResultsPage(amazonHomePage.page);
  await resultsPage.waitForGrid();

  await expect(resultsPage.firstResultTitle()).toContainText(/iPhone/i);
});
