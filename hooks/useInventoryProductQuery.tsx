import { useRouter } from 'next/router';
import { useQuery, useQueryClient } from 'react-query';
import { InventoryProduct } from '../interfaces';

export function useInventoryProductQuery() {
  const router = useRouter();
  const queryClient = useQueryClient();

  return useQuery<InventoryProduct>(
    ['inventory-products', 'inventory-product', router.query.id],
    async () => {
      if (!router.query.id) return;
      const response = await fetch(
        `/api/inventory-products/${router.query.id}`
      );

      if (!response.ok) {
        throw new Error('Failed to fetch the inventory product.');
      }

      const data = await response.json();
      return data.inventoryProduct;
    },
    {
      initialData: () => {
        return queryClient
          .getQueryData<InventoryProduct[]>(['inventory-products'])
          ?.find(ip => ip.inventoryProductId === router.query.id);
      },
      initialDataUpdatedAt: () =>
        queryClient.getQueryState(['inventory-products'])?.dataUpdatedAt,
      staleTime: 1000 * 60 * 10,
    }
  );
}
