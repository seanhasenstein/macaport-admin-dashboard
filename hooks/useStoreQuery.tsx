import { useRouter } from 'next/router';
import { useQuery, useQueryClient } from 'react-query';
import { StoreWithOrderStatusTotals } from '../interfaces';

export function useStoreQuery() {
  const router = useRouter();
  const queryClient = useQueryClient();

  return useQuery<StoreWithOrderStatusTotals | undefined>(
    ['stores', 'store', router.query.id],
    async () => {
      if (!router.query.id) return;

      const response = await fetch(`/api/stores/${router.query.id}`);

      if (!response.ok) {
        throw new Error('Failed to fetch the store.');
      }
      const data: { store: StoreWithOrderStatusTotals } = await response.json();
      return data.store;
    },
    {
      initialData: () => {
        return queryClient
          .getQueryData<StoreWithOrderStatusTotals[]>('stores')
          ?.find(s => s._id === router.query.id);
      },
      initialDataUpdatedAt: () =>
        queryClient.getQueryState(['stores'])?.dataUpdatedAt,
      staleTime: 1000 * 60 * 10,
    }
  );
}
