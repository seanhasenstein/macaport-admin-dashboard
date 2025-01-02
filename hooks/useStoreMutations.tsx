import { useRouter } from 'next/router';
import { useMutation, useQueryClient } from 'react-query';
import { useSession } from 'next-auth/react';

import {
  Order,
  Store,
  StoreForm,
  StoreProduct,
  StoresTableStore,
} from '../interfaces';

import { formatDataForDb } from '../utils/storeForm';
import { handleUpdateOrderStatus } from '../utils/order';

type Props = {
  store?: Store | StoresTableStore;
};

export function useStoreMutations({ store }: Props = {}) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const session = useSession();

  const userId = session?.data?.user.id || '';

  // ***********************************************************
  const createStore = useMutation(
    async (store: StoreForm) => {
      const response = await fetch(`/api/stores/create`, {
        method: 'POST',
        body: JSON.stringify(formatDataForDb(store)),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to create the store.');
      }

      const data = await response.json();
      return data.store;
    },
    {
      onSettled: () => {
        queryClient.invalidateQueries(['stores']);
      },
      onSuccess: data => {
        router.push(`/stores/${data._id}?createStore=true`);
      },
    }
  );

  // ***********************************************************
  const updateStoreProductsOrder = useMutation(
    async (storeProducts: StoreProduct[]) => {
      const productIds = storeProducts.map(product => product.id);
      const response = await fetch('/api/stores/update-products-order', {
        method: 'POST',
        body: JSON.stringify({ storeId: store?._id, productIds }),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to update the products order');
      }

      const data: { store: Store } = await response.json();
      return data.store;
    },
    {
      onMutate: async updatedProducts => {
        await queryClient.cancelQueries(['stores']);
        queryClient.setQueryData(['stores', 'store', store?._id], {
          ...store,
          products: updatedProducts,
        });
      },
      onError: () => {
        queryClient.setQueryData(['stores', 'store', store?._id], store);
      },
      onSuccess: () => {
        return queryClient.invalidateQueries('stores');
      },
    }
  );

  // ***********************************************************
  const updateStoreForm = useMutation(
    async (values: StoreForm) => {
      const response = await fetch(`/api/stores/update?id=${router.query.id}`, {
        method: 'POST',
        body: JSON.stringify(formatDataForDb(values)),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to update the store.');
      }

      const data = await response.json();
      return data.store;
    },
    {
      onMutate: async updatedStore => {
        await queryClient.cancelQueries(['stores', 'store', router.query.id]);
        const update = {
          ...formatDataForDb(updatedStore),
          _id: store?._id,
        };
        queryClient.setQueryData(['stores', 'store', router.query.id], update);
        return { previousStore: store, update };
      },
      onError: () => {
        // TODO: trigger a notification
        queryClient.setQueryData(['stores', 'store', router.query.id], store);
      },
      onSettled: () => {
        return queryClient.invalidateQueries(['stores']);
      },
      onSuccess: () => {
        router.push(`/stores/${store?._id}?updateStore=true`);
      },
    }
  );

  // ***********************************************************
  const deleteStore = useMutation(
    async (id: string) => {
      const response = await fetch(`/api/stores/delete?id=${router.query.id}`, {
        method: 'post',
        body: JSON.stringify({ id }),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to delete the store.');
      }

      const data = await response.json();
      return data;
    },
    {
      onMutate: async id => {
        await queryClient.cancelQueries(['stores', 'store', router.query.id]);
        const previousStores = queryClient.getQueryData<Store[]>(['stores']);
        const updatedStores = previousStores?.filter(s => s._id !== id);
        queryClient.setQueryData(['stores'], updatedStores);
        return previousStores;
      },
      onError: (_error, _id, context) => {
        // TODO: trigger a notification
        queryClient.setQueryData(['stores'], context);
      },
      onSettled: () => {
        return queryClient.invalidateQueries(['stores']);
      },
      onSuccess: () => {
        router.push(`/?deleteStore=true`);
      },
    }
  );

  // ***********************************************************
  const triggerStoreShipment = useMutation(
    async () => {
      const response = await fetch(
        `/api/stores/trigger-shipment?sid=${store?._id}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to trigger the store shipment.');
      }

      const data: { store: Store } = await response.json();
      return data.store;
    },
    {
      onMutate: async () => {
        await queryClient.cancelQueries(['stores', 'store', router.query.id]);

        if (store) {
          const updatedOrders: Order[] = store.orders.map(order => {
            const updatedOrderItems = order.items.map(item => {
              if (item.status.current === 'Fulfilled') {
                return {
                  ...item,
                  status: {
                    current: 'Shipped' as const,
                    meta: {
                      ...item.status.meta,
                      Shipped: {
                        user: userId,
                        updatedAt: new Date().toISOString(),
                      },
                    },
                  },
                };
              } else {
                return item;
              }
            });

            const updatedOrder = handleUpdateOrderStatus(
              order,
              updatedOrderItems
            );
            return updatedOrder;
          });

          const updatedStore: Store | StoresTableStore = {
            ...store,
            orders: updatedOrders,
          };

          queryClient.setQueryData(
            ['stores', 'store', router.query.id],
            updatedStore
          );

          return store;
        }
      },
      onSettled: () => {
        return queryClient.invalidateQueries(['stores']);
      },
      onError: () => {
        queryClient.setQueryData(['stores', 'store', router.query.id], store);
      },
    }
  );

  return {
    createStore,
    updateStoreForm,
    updateStoreProductsOrder,
    deleteStore,
    triggerStoreShipment,
  };
}
