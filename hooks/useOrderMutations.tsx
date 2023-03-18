import { useRouter } from 'next/router';
import { useMutation, useQueryClient } from 'react-query';

import { Order, Store } from '../interfaces';

type Props = {
  order?: Order;
  store?: Store;
};

export function useOrderMutation({ order, store }: Props) {
  const router = useRouter();
  const queryClient = useQueryClient();

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
        await queryClient.cancelQueries([
          'stores',
          'store',
          'order',
          router.query.id,
        ]);

        if (order && store) {
          const updatedItems = order.items.map(i => ({
            ...i,
            quantity: 0,
            itemTotal: 0,
          }));
          const updatedOrder: Order = {
            ...order,
            orderStatus: 'Canceled',
            items: updatedItems,
            summary: {
              ...order.summary,
              subtotal: 0,
              salesTax: 0,
              shipping: 0,
              total: 0,
            },
          };
          const updatedStoreOrders = store.orders.map(o => {
            if (o.orderId === order.orderId) {
              return updatedOrder;
            }
            return o;
          });
          const updatedStore: Store = { ...store, orders: updatedStoreOrders };
          queryClient.setQueryData(
            ['stores', 'store', 'order', order.orderId],
            { store: updatedStore, order: updatedOrder }
          );
          return updatedOrder;
        }
      },
      onError: () => {
        queryClient.setQueryData(['stores', 'store', 'order', order?.orderId], {
          store,
          order,
        });
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
