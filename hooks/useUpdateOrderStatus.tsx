import { useMutation, useQueryClient } from 'react-query';
import { Order, OrderStatus, Store } from '../interfaces';

export function useUpdateOrderStatus(store: Store, order: Order) {
  const queryClient = useQueryClient();

  return useMutation(
    async (updatedStatus: OrderStatus) => {
      const response = await fetch(
        `/api/orders/update/status?sid=${store._id}&oid=${order.orderId}`,
        {
          method: 'post',
          body: JSON.stringify({ status: updatedStatus }),
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to update the order status.');
      }

      const data: { store: Store } = await response.json();
      const orderResult = data.store.orders.find(
        o => o.orderId === order.orderId
      );
      return { store: data.store, order: orderResult };
    },
    {
      onMutate: async updatedStatus => {
        await queryClient.cancelQueries(['stores', 'store', store._id]);
        await queryClient.cancelQueries([
          'stores',
          'store',
          'order',
          order.orderId,
        ]);

        const updatedOrder = { ...order, orderStatus: updatedStatus };
        const updatedOrders = store.orders.map(o => {
          if (o.orderId === order.orderId) {
            return updatedOrder;
          }
          return o;
        });
        const updatedStore = { ...store, orders: updatedOrders };

        queryClient.setQueryData(['stores', 'store', store._id], updatedStore);
        queryClient.setQueryData(['stores', 'store', 'order', order.orderId], {
          store: updatedStore,
          order: updatedOrder,
        });

        return { store: updatedStore, order: updatedOrder };
      },
      onError: () => {
        queryClient.setQueryData(['stores', 'store', store._id], store);
        queryClient.setQueryData(['stores', 'store', 'order', order.orderId], {
          store,
          order,
        });
      },
      onSettled: () => {
        queryClient.invalidateQueries(['stores']);
        queryClient.invalidateQueries(['stores', 'store', store._id]);
        queryClient.invalidateQueries([
          'stores',
          'store',
          'order',
          order.orderId,
        ]);
      },
    }
  );
}
