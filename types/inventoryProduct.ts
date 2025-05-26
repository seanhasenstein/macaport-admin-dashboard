export type InventoryColorV2 = {
  id: string;
  label: string;
  hex: string;
};

export type InventorySizeV2 = {
  id: string;
  label: string;
};

export type InventorySkuV2 = {
  id: string;
  inventoryProductId: string;
  color: InventoryColorV2;
  size: InventorySizeV2;
  inventory: number;
  active: boolean;
};

export type SizeChartCategoryV2 = {
  name: string; // 'Chest', 'Hip', 'Length', etc.
  unit: string; // 'in', 'cm', etc.
  sizes: {
    label: string;
    value: string;
  }[];
};

export type SizeChartV2 = SizeChartCategoryV2[];

export type InventoryProductV2 = {
  _id: string;
  merchandiseCode: string;
  name: string;
  description: string;
  sizeRange: string; // [Youth Sizes, Adult Sizes, Youth and Adult Sizes, One Size Fits All, etc.] todo: should this be a collection to be consistent and searchable?
  tags: string[]; // todo: should this be a collection to be consistent and searchable?
  details: string[];
  // sizes: InventorySizeV2[]; don't think this is needed
  // colors: InventoryColorV2[]; don't think this is needed
  skus: InventorySkuV2[];
  sizeChart?: SizeChartV2; // todo: add a script to add an empty array if it doesn't exist for all legacy products
  createdAt: Date;
  updatedAt: Date;
};

export type CreateInventoryProductV2 = Omit<
  InventoryProductV2,
  '_id' | 'createdAt' | 'updatedAt'
>;

export type UpdateInventoryProductV2 = Partial<
  Omit<InventoryProductV2, 'createdAt' | 'updatedAt'>
>;
