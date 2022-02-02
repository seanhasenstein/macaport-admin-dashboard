import { useRouter } from 'next/router';
import { useQuery } from 'react-query';
import { StoreProduct } from '../interfaces';

export function useStoreProductQuery() {
  const router = useRouter();

  return useQuery(
    ['stores', 'store', 'product', router.query.pid],
    async () => {
      if (!router.query.id || !router.query.pid) return;

      const response = await fetch(
        `/api/store-products/${router.query.id}?pid=${router.query.pid}`
      );

      if (!response.ok) throw new Error('Failed to fetch the store product.');

      const data: { storeProduct: StoreProduct } = await response.json();
      return data.storeProduct;
    },
    {
      cacheTime: 0,
    }
  );
}
