import { Page, expect } from '@playwright/test';
import { BasePage } from './BasePage';

export class AmazonBasketPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  // Finds the basket item row that contains the iPhone — ignores the protection plan row
  iPhoneBasketItem = () =>
    this.page.locator('.sc-list-item').filter({ hasText: /iPhone/i }).first();

  // The product title link within the iPhone basket row
  productTitle = () => this.iPhoneBasketItem().locator('a.sc-product-title');


  // Waits for the basket page to fully load
  async waitForBasket() {
    await this.page.waitForURL(/\/cart/i, { waitUntil: 'domcontentloaded' });
    await this.iPhoneBasketItem().waitFor({ state: 'visible' });
  }

  // Checks the basket contains the expected product name
  async verifyProductName(name: string) {
    await expect(this.productTitle()).toContainText(name);
  }

  // Checks the basket item contains "Colour: Silver" — uses [\s\S]* to match across line breaks
  // because Amazon puts the label "Colour:" and value "Silver" in separate HTML spans
  async verifyColour(colour: string) {
    await expect(this.iPhoneBasketItem()).toContainText(new RegExp(`Colour:[\\s\\S]*${colour}`, 'i'));
  }

  // Checks the basket item contains "Qty: 1" anywhere in its text
  async verifyQuantity() {
    await expect(this.iPhoneBasketItem()).toContainText('Qty: 1');
  }

  // The basket item count shown in the page header (e.g. "2")
  headerItemCount = () => this.page.locator('#nav-cart-count');

  // The subtotal line in the basket summary (e.g. "Subtotal (2 items): £1,305.29")
  subtotal = () => this.page.getByText(/Subtotal/i).first();

  // Verifies the basket header shows the expected number of items
  async verifyHeaderCount(count: number) {
    await expect(this.headerItemCount()).toContainText(String(count));
  }

  // Verifies the iPhone basket row contains the price from the product page
  async verifyItemPrice(price: string) {
    await expect(this.iPhoneBasketItem()).toContainText(price);
  }

  // Verifies the subtotal line is visible in the basket
  async verifySubtotalVisible() {
    await expect(this.subtotal()).toBeVisible();
  }
}
