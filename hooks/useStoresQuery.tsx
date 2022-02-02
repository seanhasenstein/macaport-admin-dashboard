import { useQuery, useQueryClient } from 'react-query';
import { Store } from '../interfaces';

export function useStoresQuery() {
  const queryClient = useQueryClient();

  return useQuery<Store[]>(
    ['stores'],
    async () => {
      const response = await fetch('/api/stores');

      if (!response.ok) {
        throw new Error('Failed to fetch the stores.');
      }

      const data = await response.json();
      return data.stores;
    },
    {
      initialData: () => {
        return queryClient.getQueryData(['stores']);
      },
      initialDataUpdatedAt: () => {
        return queryClient.getQueryState(['stores'])?.dataUpdatedAt;
      },
      staleTime: 1000 * 60 * 10,
    }
  );
}
