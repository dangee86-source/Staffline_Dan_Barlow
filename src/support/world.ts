import { Browser, BrowserContext, Page } from '@playwright/test';
import { World, IWorldOptions, setWorldConstructor } from '@cucumber/cucumber';
import { IProduct } from '../../framework/types/product';

// Custom Cucumber World: carries the Playwright browser/page for the current
// scenario, plus any data one step needs to pass to a later step (Cucumber has
// no built-in way to share state between steps other than `this`).
export class AmazonWorld extends World {
  browser!: Browser;
  context!: BrowserContext;
  page!: Page;

  // Set when a product/colour is chosen on the product page; read back later
  // when verifying the basket contents match what was actually selected.
  selectedProduct?: IProduct;

  // Captured on the product page before adding to basket, so the basket step
  // can assert the price shown there matches what the product page displayed.
  priceOnProductPage?: string;

  constructor(options: IWorldOptions) {
    super(options);
  }
}

setWorldConstructor(AmazonWorld);
