import { Browser, BrowserContext, Page } from '@playwright/test';
import { World, IWorldOptions, setWorldConstructor } from '@cucumber/cucumber';
import { IProduct } from '../../framework/types/product';

// Custom Cucumber World for the Amazon scenarios.
export class AmazonWorld extends World {
  browser!: Browser;
  context!: BrowserContext;
  page!: Page;

  // Product/colour chosen on the product page, verified later in the basket
  selectedProduct?: IProduct;

  // Price captured on the product page, verified later in the basket
  priceOnProductPage?: string;

  constructor(options: IWorldOptions) {
    super(options);
  }
}

setWorldConstructor(AmazonWorld);
