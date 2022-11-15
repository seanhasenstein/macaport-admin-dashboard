import { useQuery, useQueryClient } from 'react-query';
import { InventoryProduct } from '../interfaces';

export function useInventoryProductQuery(id: string | undefined) {
  const queryClient = useQueryClient();

  return useQuery<InventoryProduct>(
    ['inventory-products', 'inventory-product', id],
    async () => {
      if (!id) return;
      const response = await fetch(`/api/inventory-products/${id}`);

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
          ?.find(ip => ip.inventoryProductId === id);
      },
      initialDataUpdatedAt: () =>
        queryClient.getQueryState(['inventory-products'])?.dataUpdatedAt,
      staleTime: 1000 * 60 * 10,
    }
  );
}
