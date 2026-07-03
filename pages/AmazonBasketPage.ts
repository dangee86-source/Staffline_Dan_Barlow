import { Page, expect } from '@playwright/test';
import { BasePage } from './BasePage';

// Page object for the Amazon basket/cart page.
export class AmazonBasketPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  // The basket item row containing the iPhone
  iPhoneBasketItem = () =>
    this.page.locator('.sc-list-item').filter({ hasText: /iPhone/i }).first();

  // The product title link within the iPhone basket row
  productTitle = () => this.iPhoneBasketItem().locator('a.sc-product-title');

  // Waits for the basket page to finish loading
  async waitForBasket() {
    await this.page.waitForURL(/\/cart/i, { waitUntil: 'domcontentloaded' });
    await this.iPhoneBasketItem().waitFor({ state: 'visible' });
  }

  // Verifies the basket contains the expected product name
  async verifyProductName(name: string) {
    await expect(this.productTitle()).toContainText(name);
  }

  // Verifies the basket item shows the expected colour
  async verifyColour(colour: string) {
    await expect(this.iPhoneBasketItem()).toContainText(new RegExp(`Colour:[\\s\\S]*${colour}`, 'i'));
  }

  // Verifies the basket item quantity is 1
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

  // Verifies the iPhone basket row shows the given price
  async verifyItemPrice(price: string) {
    await expect(this.iPhoneBasketItem()).toContainText(price);
  }

  // Verifies the subtotal line is visible in the basket
  async verifySubtotalVisible() {
    await expect(this.subtotal()).toBeVisible();
  }
}
