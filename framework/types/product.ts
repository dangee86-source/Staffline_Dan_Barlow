export interface IProduct {
  name: string;
  colour?: string;
}

export interface IProductComparisonRow {
  feature: string;
  proMaxValue: string;
  proValue: string;
  color?: string;  // ? makes the color property optional
}
