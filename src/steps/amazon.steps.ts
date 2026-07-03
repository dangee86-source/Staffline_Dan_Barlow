import { Given, When, Then } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import { AmazonWorld } from '../support/world';
import { URLS } from '../../framework/constants/urls';
import { AmazonHomePage } from '../../pages/AmazonHomePage';
import { AmazonSearchResultsPage } from '../../pages/AmazonSearchResultsPage';
import { AmazonProductPage } from '../../pages/AmazonProductPage';
import { AmazonBasketPage } from '../../pages/AmazonBasketPage';

// Step definitions for features/amazon-search.feature.
// These deliberately reuse the exact same Page Object classes (pages/*.ts) as the
// Playwright specs in tests/amazon/ — Cucumber just orchestrates the same POM
// through Gherkin instead of Playwright's test runner, so there's one source of
// truth for how to interact with the Amazon UI, not two.

Given('User lands on the Amazon website', async function (this: AmazonWorld) {
  await this.page.goto(URLS.AMAZON_HOME, { waitUntil: 'domcontentloaded' });
  const homePage = new AmazonHomePage(this.page);
  await homePage.acceptCookiesIfPresent();
  await homePage.handleContinueShoppingIfPresent();
  await expect(this.page).toHaveURL(/amazon\.co\.uk/);
});

When('User searches for iPhone 17 Pro Max', async function (this: AmazonWorld) {
  const homePage = new AmazonHomePage(this.page);
  await homePage.searchFor('iPhone 17 Pro Max');
});

Then('User should see product results in the grid', async function (this: AmazonWorld) {
  const resultsPage = new AmazonSearchResultsPage(this.page);
  await resultsPage.waitForGrid();
  await expect(resultsPage.resultItems().first()).toBeVisible();
});

Then('User should count grid items containing only iPhone 17 Pro Max', async function (this: AmazonWorld) {
  const resultsPage = new AmazonSearchResultsPage(this.page);
  // Waits again defensively — this step can run as the first assertion after a
  // search if a scenario is reordered, so it shouldn't assume the grid already loaded.
  await resultsPage.waitForGrid();
  const count = await resultsPage.countItemsContaining('iPhone 17 Pro Max');
  console.log(`\nGrid items containing "iPhone 17 Pro Max": ${count}`);
  expect(count).toBeGreaterThan(0);
});

When('User filters the results by top rated', async function (this: AmazonWorld) {
  const resultsPage = new AmazonSearchResultsPage(this.page);
  await resultsPage.waitForGrid();
  await resultsPage.applyTopRatedFilter();
});

When('User selects the highest rated matching iPhone 17 Pro Max silver colour', async function (this: AmazonWorld) {
  const resultsPage = new AmazonSearchResultsPage(this.page);
  await resultsPage.clickFirstResult();

  this.selectedProduct = { name: 'iPhone 17 Pro Max', colour: 'silver' };

  const productPage = new AmazonProductPage(this.page);
  // Captured before adding to basket so the later basket step can verify the
  // same price carried through, instead of trusting the basket page in isolation.
  this.priceOnProductPage = await productPage.getPrice();
  await productPage.selectColour(this.selectedProduct.colour!);
});

When('User adds the product with a 1-year protection plan to the basket', async function (this: AmazonWorld) {
  const productPage = new AmazonProductPage(this.page);
  await productPage.addToBasketWithProtectionPlan();
});

Then('User should verify the product and protection plan in the basket', async function (this: AmazonWorld) {
  await this.page.getByRole('link', { name: /items in shopping basket/i }).click();

  const basketPage = new AmazonBasketPage(this.page);
  await basketPage.waitForBasket();

  await basketPage.verifyProductName(this.selectedProduct!.name);
  await basketPage.verifyColour(this.selectedProduct!.colour!);
  await basketPage.verifyQuantity();
  await basketPage.verifyItemPrice(this.priceOnProductPage!);
  await basketPage.verifySubtotalVisible();
  // 2 items: the phone plus the protection plan add-on counted separately.
  await basketPage.verifyHeaderCount(2);
});
