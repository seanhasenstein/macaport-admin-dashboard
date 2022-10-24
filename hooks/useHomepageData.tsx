import { useQuery, useQueryClient } from 'react-query';
import { fetchHomepageStores } from '../queries/stores';

export default function useHomepageData() {
  const queryClient = useQueryClient();

  return useQuery(['stores', 'homepage'], fetchHomepageStores, {
    onSuccess: data => {
      data.stores.forEach(store => {
        queryClient.setQueryData(['stores', 'store', store._id], store);
      });
    },
    staleTime: 1000 * 60 * 10,
  });
}
