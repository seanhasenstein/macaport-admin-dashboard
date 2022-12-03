import { useQuery } from 'react-query';
import { fetchHomepageData } from '../queries/stores';

export default function useHomepageData() {
  return useQuery(['stores', 'homepage'], fetchHomepageData, {
    staleTime: 1000 * 60 * 10,
  });
}
