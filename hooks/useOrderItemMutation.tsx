import { useMutation, useQueryClient } from 'react-query';

import { Order, OrderItem, OrderItemStatus, Store } from '../interfaces';
import { getNextOrderItemStatus } from '../utils/orderItem';

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
    }: {
      orderItems: OrderItem[];
      orderItem: OrderItem;
      statusToSet?: OrderItemStatus;
    }) => {
      const response = await fetch('/api/order-items/update-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          storeId: store._id,
          orderId: order?.orderId,
          orderItems,
          orderItemId: orderItem.id,
          userId,
          ...(statusToSet && { statusToSet }),
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

        const updatedOrderItems = order?.items.map(item => {
          if (item.id === orderItem.id) {
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

        const updatedOrders = store.orders.map(order => {
          if (order.orderId === order.orderId) {
            return { ...order, items: updatedOrderItems };
          }
          return order;
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
  };
}
