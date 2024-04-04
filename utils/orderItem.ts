import { OrderItem, OrderItemStatus, StoreProduct } from '../interfaces';

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

const orderItemStatuses: OrderItemStatus[] = [
  // 'Unfulfilled',
  'Fulfilled',
  // 'Shipped',
  // 'Canceled',
];

export function getNextOrderItemStatus(status: OrderItemStatus) {
  const currentStatusIndex = orderItemStatuses.indexOf(status);
  const nextStatusIndex =
    currentStatusIndex === orderItemStatuses.length - 1
      ? 0
      : currentStatusIndex + 1;
  return orderItemStatuses[nextStatusIndex];
}

export function getOrderItemsStatusTotals(orderItems: OrderItem[]) {
  const itemStatusTotals = orderItems.reduce(
    (acc: Record<OrderItemStatus, number>, currItem) => {
      acc[currItem.status.current] += 1;
      return acc;
    },
    {
      Unfulfilled: 0,
      Fulfilled: 0,
      Shipped: 0,
      Canceled: 0,
    }
  );

  return itemStatusTotals;
}
