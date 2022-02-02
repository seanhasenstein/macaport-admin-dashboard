import { useQuery, useQueryClient } from 'react-query';
import { InventoryProduct } from '../interfaces';

export function useInventoryProductsQuery() {
  const queryClient = useQueryClient();

  return useQuery<InventoryProduct[]>(
    ['inventory-products'],
    async () => {
      const response = await fetch('/api/inventory-products');

      if (!response.ok) {
        throw new Error('Failed to fetch the inventory products.');
      }

      const data = await response.json();
      return data.inventoryProducts;
    },
    {
      initialData: () => {
        return queryClient.getQueryData(['inventory-products']);
      },
      initialDataUpdatedAt: () => {
        return queryClient.getQueryState(['inventory-products'])?.dataUpdatedAt;
      },
      staleTime: 1000 * 60 * 10,
    }
  );
}
