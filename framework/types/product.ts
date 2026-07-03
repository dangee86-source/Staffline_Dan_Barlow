// Test data shape used across the Amazon search/basket scenarios.
export interface IProduct {
  name: string;
  colour?: string;
}

// Reserved for a future comparison-table scenario. Not currently used by any
// page object or test.
export interface IProductComparisonRow {
  feature: string;
  proMaxValue: string;
  proValue: string;
  color?: string;  // ? makes the color property optional
}
