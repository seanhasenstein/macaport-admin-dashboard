import { useRouter } from 'next/router';
import { useQuery, useQueryClient } from 'react-query';
import { Store } from '../interfaces';

export function useOrderQuery() {
  const router = useRouter();
  const queryClient = useQueryClient();

  return useQuery(
    ['stores', 'store', 'order', router.query.id],
    async () => {
      if (!router.query.sid) return;
      const response = await fetch(`/api/stores/${router.query.sid}`);

      if (!response.ok) {
        throw new Error('Failed to fetch the order.');
      }

      const data: { store: Store } = await response.json();
      const store = data.store;
      const order = store.orders.find(o => o.orderId === router.query.id);
      return { store, order };
    },
    {
      initialData: () => {
        const store = queryClient.getQueryData<Store>([
          'stores',
          'store',
          router.query.sid,
        ]);
        const order = store?.orders.find(o => o.orderId === router.query.id);
        if (store && order) {
          return { store, order };
        }
      },
      initialDataUpdatedAt: () => {
        return queryClient.getQueryState(['stores', 'store', router.query.sid])
          ?.dataUpdatedAt;
      },
      staleTime: 1000 * 60 * 10,
    }
  );
}
