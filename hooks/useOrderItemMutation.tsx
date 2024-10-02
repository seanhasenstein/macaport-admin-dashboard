import { useMutation, useQueryClient } from 'react-query';

import { Order, OrderItem, OrderItemStatus, Store } from '../interfaces';
import { getNextOrderItemStatus } from '../utils/orderItem';
import { handleUpdateOrderStatus } from '../utils/order';

type Props = {
  order: Order | undefined;
  store: Store;
  userId: string;
};

export function useOrderItemMutation({ order, store, userId }: Props) {
  const queryClient = useQueryClient();

  const updateOrderItemStatus = useMutation(
    async ({
      orderItems,
      orderItem,
      statusToSet = undefined,
      returnToInventory,
    }: {
      orderItems: OrderItem[];
      orderItem: OrderItem;
      statusToSet?: OrderItemStatus;
      returnToInventory?: boolean;
    }) => {
      // TODO: create an api route to update a single inventory product sku inventory amount (or helper function for an existing route)
      const response = await fetch('/api/order-items/update-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          storeId: store._id,
          orderId: order?.orderId,
          order,
          orderItems,
          orderItemId: orderItem.id,
          userId,
          inventoryProductId: orderItem.sku.inventoryProductId,
          inventoryProductSkuId: orderItem.sku.inventorySkuId,
          orderItemQuantity: orderItem.quantity,
          ...(statusToSet && { statusToSet }),
          ...(returnToInventory && { returnToInventory }),
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update order item status');
      }

      const data: { store: Store } = await response.json();
      return data.store;
    },
    {
      onMutate: async ({ orderItem, statusToSet }) => {
        await queryClient.cancelQueries(['stores', 'store', store._id]);

        if (order) {
          const updatedOrderItems = order?.items.map(item => {
            if (item.id === orderItem.id) {
              console.log({ itemId: item.id, orderItemId: orderItem.id });
              const nextStatus = statusToSet
                ? statusToSet
                : getNextOrderItemStatus(item.status.current);
              const updatedStatusMeta = {
                ...orderItem.status.meta,
                [nextStatus]: {
                  user: userId,
                  timestamp: new Date().toISOString(),
                },
              };
              return {
                ...item,
                status: { current: nextStatus, meta: updatedStatusMeta },
              };
            }
            return item;
          });

          const updatedOrders = store.orders.map(currOrder => {
            if (currOrder.orderId === order.orderId) {
              const updatedOrder = handleUpdateOrderStatus(
                order,
                updatedOrderItems
              );
              return { ...updatedOrder, items: updatedOrderItems };
            }
            return currOrder;
          });

          const optimisticStoreUpdate = { ...store, orders: updatedOrders };

          queryClient.setQueryData(
            ['stores', 'store', store._id],
            optimisticStoreUpdate
          );
        }
      },
      onError: () => {
        queryClient.setQueriesData(['stores', 'store', store._id], store);
      },
      onSettled: () => {
        queryClient.invalidateQueries(['stores', 'store', store._id]);
      },
    }
  );

  const updateUnfulfilledOrderItemsToFulfilled = useMutation(
    async (orderInput: Order) => {
      const response = await fetch(
        '/api/order-items/update-all-unfulfilled-to-fulfilled',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            storeId: store._id,
            orderId: orderInput.orderId,
            userId,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(
          'Failed to update unfulfilled order items to fulfilled'
        );
      }

      const data: { store: Store } = await response.json();
      return data.store;
    },
    {
      onMutate: async orderInput => {
        await queryClient.cancelQueries(['stores', 'store', store._id]);

        const updatedOrders = store.orders.map(currOrder => {
          if (currOrder.orderId === orderInput.orderId) {
            const updatedOrderItems = currOrder.items.map(item => {
              if (item.status.current === 'Unfulfilled') {
                const updatedStatusMeta = {
                  ...item.status.meta,
                  Fulfilled: {
                    user: userId,
                    updatedAt: new Date().toISOString(),
                  },
                };
                return {
                  ...item,
                  status: {
                    current: 'Fulfilled' as const,
                    meta: updatedStatusMeta,
                  },
                };
              }
              return item;
            });

            const updatedOrder = handleUpdateOrderStatus(
              orderInput,
              updatedOrderItems
            );
            return { ...updatedOrder, items: updatedOrderItems };
          }
          return currOrder;
        });

        const optimisticStoreUpdate = { ...store, orders: updatedOrders };

        queryClient.setQueryData(
          ['stores', 'store', store._id],
          optimisticStoreUpdate
        );
      },
      onError: () => {
        queryClient.setQueriesData(['stores', 'store', store._id], store);
      },
      onSettled: () => {
        queryClient.invalidateQueries(['stores', 'store', store._id]);
      },
    }
  );

  return {
    updateOrderItemStatus,
    updateUnfulfilledOrderItemsToFulfilled,
  };
}
