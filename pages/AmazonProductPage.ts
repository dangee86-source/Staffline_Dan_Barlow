import { Page } from '@playwright/test';
import { BasePage } from './BasePage';

// Page object for an individual Amazon product ("detail") page: reading title/price
// and driving the colour-selection + add-to-basket flow, including the protection
// plan upsell popup that appears after clicking "Add to basket".
export class AmazonProductPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  // Selects a colour option on the product page by matching the colour name
  colourOption = (colour: string) =>
    this.page.getByRole('radio', { name: new RegExp(colour, 'i') });

  // The main "Add to basket" button
  addToBasketButton = () => this.page.getByRole('button', { name: 'Add to basket', exact: true });

  // The first protection plan checkbox in the popup
  protectionPlanCheckbox = () =>
    this.page.locator('.a-row.a-spacing-top-small > .a-checkbox > label > .a-icon').first();

  // The "Add protection" confirm button in the popup
  addProtectionButton = () => this.page.getByRole('button', { name: 'Add protection' });

  // The product title heading on the product page
  pageTitle = () => this.page.locator('#productTitle');

  // The main price on the product page (whole number part e.g. "1,199")
  pagePrice = () => this.page.locator('#corePrice_feature_div .a-price-whole').first();

  // Returns the product title text
  async getTitle(): Promise<string> {
    return (await this.pageTitle().textContent() ?? '').trim();
  }

  // Returns the price as a plain string e.g. "1,199".
  // Strips everything except digits/./, so currency symbols and stray whitespace
  // from Amazon's markup don't break later string comparisons against the basket price.
  async getPrice(): Promise<string> {
    return (await this.pagePrice().textContent() ?? '').trim().replace(/[^0-9.,]/g, '');
  }

  // Selects the given colour and adds the item to the basket, including protection plan.
  // Chained together because on Amazon's real site, clicking "Add to basket" always
  // triggers the protection plan popup for this product — treating it as one flow
  // avoids every calling test having to know about (and handle) that popup itself.
  async selectColourAndAddToBasket(colour: string) {
    await this.colourOption(colour).click();
    await this.addToBasketButton().click();
    await this.protectionPlanCheckbox().click();
    await this.addProtectionButton().click();
  }
}
