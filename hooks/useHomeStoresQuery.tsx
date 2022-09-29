import { useQuery, useQueryClient } from 'react-query';
import { fetchHomepageStores } from '../queries/stores';

export default function useHomeStoresQuery() {
  const queryClient = useQueryClient();

  return useQuery(['stores', 'homepage'], fetchHomepageStores, {
    onSuccess: data => {
      data.forEach(store => {
        queryClient.setQueryData(['stores', 'store', store._id], store);
      });
    },
    staleTime: 1000 * 60 * 10,
  });
}
