import {
  InventoryColor,
  InventoryProduct,
  InventorySize,
  InventorySku,
  Note,
  ProductSku,
  Store,
  StoreProduct,
} from '../interfaces';
import { createId, formatHexColors } from '.';

export type UpdateFormValues = {
  _id: string;
  inventoryProductId: string;
  merchandiseCode: string;
  name: string;
  description: string;
  tag: string;
  details: string[];
  sizes: InventorySize[];
  colors: InventoryColor[];
  skus?: InventorySku[];
  notes: Note[];
};

export function updateInventoryProductSkus(
  previousInventoryProduct: InventoryProduct,
  formValues: UpdateFormValues
) {
  const colors = formatHexColors(formValues.colors);
  const sizes = formValues.sizes;
  let updatedSkus: InventorySku[] = [];

  // update the previous skus (both update and remove)
  previousInventoryProduct.skus.forEach(sku => {
    const color = colors.find(c => c.id === sku.color.id);
    const size = sizes.find(s => s.id === sku.size.id);

    if (color && size) {
      const updatedSku = {
        ...sku,
        color: { ...sku.color, label: color.label, hex: color.hex },
        size: { ...sku.size, label: size.label },
      };

      updatedSkus = [...updatedSkus, updatedSku];
    }
  });

  // update new colors and new sizes
  colors.forEach(color => {
    if (!previousInventoryProduct.colors.some(c => c.id === color.id)) {
      const newColorSkus = sizes.map(size => {
        return {
          id: createId('inv_sku'),
          inventoryProductId: previousInventoryProduct.inventoryProductId,
          color,
          size,
          inventory: 0,
          active: true,
        };
      });

      updatedSkus = [...updatedSkus, ...newColorSkus];
    } else {
      sizes.forEach(size => {
        if (!previousInventoryProduct.sizes.some(s => s.id === size.id)) {
          const newSku = {
            id: createId('inv_sku'),
            inventoryProductId: previousInventoryProduct.inventoryProductId,
            color,
            size,
            inventory: 0,
            active: true,
          };

          updatedSkus = [...updatedSkus, newSku];
        }
      });
    }
  });

  const sortedResults = updatedSkus.sort((a, b) =>
    a.color.label < b.color.label ? -1 : 1
  );

  return sortedResults;
}

export function updateStoreProductSkus(
  store: Store,
  previousStoreProduct: StoreProduct,
  formValues: UpdateFormValues
) {
  const colors = formValues.colors;
  const sizes = formValues.sizes;
  let updatedSkus: ProductSku[] = [];

  // update the previous skus (both update and remove)
  previousStoreProduct.productSkus.forEach(sku => {
    const color = colors.find(c => c.id === sku.color.id);
    const size = sizes.find(s => s.id === sku.size.id);

    if (color && size) {
      const updatedSku = {
        ...sku,
        color: { ...sku.color, label: color.label, hex: color.hex },
        size: { ...sku.size, label: size.label },
      };

      updatedSkus = [...updatedSkus, updatedSku];
    }
  });

  // update new colors and new sizes
  colors.forEach(color => {
    if (!previousStoreProduct.colors.some(c => c.id === color.id)) {
      const newColorSkus = sizes.map(size => {
        const inventorySku = formValues.skus?.find(
          s => s.color.id === color.id && s.size.id === size.id
        );
        const prevSize = previousStoreProduct.sizes.find(s => s.id === size.id);

        return {
          id: createId('prod_sku'),
          storeProductId: previousStoreProduct.id,
          inventoryProductId: inventorySku?.inventoryProductId || '',
          inventorySkuId: inventorySku?.id || '',
          color: { ...color, primaryImage: '', secondaryImages: [] },
          size: { ...size, price: prevSize?.price || 0 },
          inventory: 0,
          active: false,
        };
      });

      updatedSkus = [...updatedSkus, ...newColorSkus];
    } else {
      sizes.forEach(size => {
        if (!previousStoreProduct.sizes.some(s => s.id === size.id)) {
          const inventorySku = formValues.skus?.find(
            s => s.color.id === color.id && s.size.id === size.id
          );

          const newSku = {
            id: createId('prod_sku'),
            storeProductId: previousStoreProduct.id,
            inventoryProductId: inventorySku?.inventoryProductId || '',
            inventorySkuId: inventorySku?.id || '',
            color: { ...color, primaryImage: '', secondaryImages: [] },
            size: { ...size, price: 0 },
            inventory: 0,
            active: false,
          };

          updatedSkus = [...updatedSkus, newSku];
        }
      });
    }
  });

  const sortedResults = updatedSkus.sort((a, b) =>
    a.color.label < b.color.label ? -1 : 1
  );

  return sortedResults;
}
