import { Order, OrderItem } from '../interfaces';

export function handleUpdateOrderStatus(
  order: Order,
  updatedOrderItems: OrderItem[]
): Order {
  const orderItemTotals = updatedOrderItems.reduce(
    (acc, currItem) => {
      switch (currItem.status.current) {
        case 'Unfulfilled':
          return { ...acc, unfulfilled: acc.unfulfilled + 1 };
        case 'Backordered':
          return { ...acc, backordered: acc.backordered + 1 };
        case 'Fulfilled':
          return { ...acc, fulfilled: acc.fulfilled + 1 };
        case 'Shipped':
          return { ...acc, shipped: acc.shipped + 1 };
        case 'Canceled':
          return { ...acc, canceled: acc.canceled + 1 };
        default:
          return acc;
      }
    },
    { unfulfilled: 0, backordered: 0, fulfilled: 0, shipped: 0, canceled: 0 }
  );

  const atLeastOneItemIsShipped = orderItemTotals.shipped > 0;
  const atLeastOneItemIsUnfulfilled = orderItemTotals.unfulfilled > 0;
  const atLeastOneItemIsBackordered = orderItemTotals.backordered > 0;
  const allItemsAreFulfilledOrCanceled =
    orderItemTotals.fulfilled + orderItemTotals.canceled ===
    updatedOrderItems.length;
  const allItemsAreCanceled =
    orderItemTotals.canceled === updatedOrderItems.length;
  const allItemsAreShippedOrCanceled =
    orderItemTotals.shipped + orderItemTotals.canceled ===
    updatedOrderItems.length;

  if (atLeastOneItemIsShipped && allItemsAreShippedOrCanceled) {
    return {
      ...order,
      items: updatedOrderItems,
      orderStatus: 'Shipped' as const,
    };
  } else if (allItemsAreCanceled) {
    return {
      ...order,
      items: updatedOrderItems,
      orderStatus: 'Canceled' as const,
    };
  } else if (atLeastOneItemIsShipped) {
    return {
      ...order,
      items: updatedOrderItems,
      orderStatus: 'PartiallyShipped' as const,
    };
  } else if (atLeastOneItemIsUnfulfilled || atLeastOneItemIsBackordered) {
    return {
      ...order,
      items: updatedOrderItems,
      orderStatus: 'Unfulfilled' as const,
    };
  } else if (allItemsAreFulfilledOrCanceled) {
    return {
      ...order,
      items: updatedOrderItems,
      orderStatus: 'Fulfilled' as const,
    };
  } else {
    return { ...order, items: updatedOrderItems };
  }
}
