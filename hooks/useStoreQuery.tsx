import { useRouter } from 'next/router';
import { useQuery, useQueryClient } from 'react-query';
import { Store } from '../interfaces';

export function useStoreQuery() {
  const router = useRouter();
  const queryClient = useQueryClient();

  return useQuery<Store>(
    ['stores', 'store', router.query.id],
    async () => {
      if (!router.query.id) return;
      const response = await fetch(`/api/stores/${router.query.id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch the store.');
      }
      const data = await response.json();
      return data.store;
    },
    {
      initialData: () => {
        return queryClient
          .getQueryData<Store[]>('stores')
          ?.find(s => s._id === router.query.id);
      },
      initialDataUpdatedAt: () =>
        queryClient.getQueryState(['stores'])?.dataUpdatedAt,
      staleTime: 1000 * 60 * 10,
    }
  );
}
