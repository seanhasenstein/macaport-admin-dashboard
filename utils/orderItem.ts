import { OrderItem, StoreProduct } from '../interfaces';

export function hydrateOrderItemsWithArtworkId(
  orderItems: OrderItem[],
  storeProducts: StoreProduct[]
): OrderItem[] {
  return orderItems.map(item => {
    const storeProduct = storeProducts.find(
      product => product.id === item.sku.storeProductId
    );
    return { ...item, artworkId: storeProduct?.artworkId || '' };
  });
}
