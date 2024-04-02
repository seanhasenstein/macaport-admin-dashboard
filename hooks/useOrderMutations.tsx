import { useRouter } from 'next/router';
import { useMutation, useQueryClient } from 'react-query';
import { useSession } from 'next-auth/client';

import { Order, OrderItem, Store } from '../interfaces';

interface OrderItemWithShouldReturnToInventory extends OrderItem {
  shouldReturnToInventory: boolean;
}

interface OrderWithExtendedOrderItems extends Omit<Order, 'items'> {
  items: OrderItemWithShouldReturnToInventory[];
}

type Props = {
  order?: OrderWithExtendedOrderItems;
  store?: Store;
};

export function useOrderMutation({ order, store }: Props) {
  const router = useRouter();
  const queryClient = useQueryClient();

  const session = useSession();
  const userId = session[0]?.user?.id || '';

  const cancelOrder = useMutation(
    async () => {
      if (!order || !store) return;
      const response = await fetch(
        `/api/orders/cancel?sid=${store._id}&oid=${order.orderId}`,
        {
          method: 'post',
          body: JSON.stringify({ order }),
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to cancel the order');
      }

      const data: { store: Store } = await response.json();
      return data.store;
    },
    {
      onMutate: async () => {
        await queryClient.cancelQueries(['stores', 'store', router.query.id]);

        if (order && store) {
          const updatedItems = order.items.map(currItem => ({
            // todo: we need to update the items inventory as well based on shouldReturnToInventory
            ...currItem,
            // Note: only update the item's status to 'Canceled' if it's not already canceled or shipped
            ...(!['Shipped', 'Canceled'].includes(currItem.status.current) && {
              status: {
                current: 'Canceled' as const,
                meta: {
                  ...currItem.status.meta,
                  Canceled: {
                    user: userId,
                    updatedAt: new Date().toISOString(),
                  },
                },
              },
            }),
            // todo: these were set to 0 but I think it would be good to keep the original values, can we do this?
            // quantity: 0,
            // itemTotal: 0,
          }));
          const updatedOrder: Order = {
            ...order,
            orderStatus: 'Canceled',
            items: updatedItems,
            // todo: handle this based on refund status?
            summary: {
              ...order.summary,
              subtotal: 0,
              salesTax: 0,
              shipping: 0,
              total: 0,
            },
          };
          const updatedStoreOrders = store.orders.map(currOrder => {
            if (currOrder.orderId === order.orderId) {
              return updatedOrder;
            }
            return currOrder;
          });
          const updatedStore: Store = { ...store, orders: updatedStoreOrders };
          queryClient.setQueryData(
            ['stores', 'store', store._id],
            updatedStore
          );
          return updatedStore;
        }
      },
      onError: () => {
        queryClient.setQueryData(['stores', 'store', store?._id], store);
      },
      onSettled: () => {
        queryClient.invalidateQueries('stores');
        queryClient.invalidateQueries('inventory-products');
      },
    }
  );

  return {
    cancelOrder,
  };
}
