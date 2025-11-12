import { useRouter } from 'next/router';
import { useMutation, useQueryClient } from 'react-query';

import {
  InventoryColor,
  InventoryProduct,
  InventorySize,
  InventorySku,
} from '../interfaces';

import { formatHexColors } from '../utils';
import { UpdateFormValues } from '../utils/inventoryProduct';

export type InitialValues = {
  inventoryProductId: string;
  merchandiseCode: string;
  name: string;
  description: string;
  tag: string;
  details: string[];
  sizes: InventorySize[];
  colors: InventoryColor[];
  skus?: InventorySku[];
};

export function useInventoryProductMutations(
  inventoryProduct?: InventoryProduct
) {
  const router = useRouter();
  const queryClient = useQueryClient();

  const createProduct = useMutation(
    async (inventoryProduct: InitialValues) => {
      const response = await fetch('/api/inventory-products/create', {
        method: 'post',
        body: JSON.stringify(inventoryProduct),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to create the inventory product.');
      }

      const data: { inventoryProduct: InventoryProduct } =
        await response.json();
      return data;
    },
    {
      onSettled: () => {
        return queryClient.invalidateQueries(['inventory-products']);
      },
      onSuccess: ({ inventoryProduct }) => {
        router.push(`/inventory-products/${inventoryProduct._id}`);
      },
    }
  );

  const updateProduct = useMutation(
    async (updatedProduct: InventoryProduct) => {
      const response = await fetch('/api/inventory-products/update', {
        method: 'post',
        body: JSON.stringify({
          id: inventoryProduct?._id,
          update: updatedProduct,
        }),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to update the inventory product.');
      }

      const data: { inventoryProduct: InventoryProduct } =
        await response.json();
      return data.inventoryProduct;
    },
    {
      onMutate: async updatedProduct => {
        await queryClient.cancelQueries([
          'inventory-products',
          'inventory-product',
          inventoryProduct?.inventoryProductId,
        ]);
        queryClient.setQueryData(
          [
            'inventory-products',
            'inventory-product',
            inventoryProduct?.inventoryProductId,
          ],
          updatedProduct
        );
        return updatedProduct;
      },
      onError: () => {
        queryClient.setQueryData(
          [
            'inventory-products',
            'inventory-product',
            inventoryProduct?.inventoryProductId,
          ],
          inventoryProduct
        );
      },
      onSettled: async () => {
        return queryClient.invalidateQueries();
      },
    }
  );

  const updateProductIncludingSkus = useMutation(
    async (values: UpdateFormValues) => {
      const formattedColors = formatHexColors(values.colors);
      const response = await fetch('/api/inventory-products/update-form', {
        method: 'post',
        body: JSON.stringify({ ...values, colors: formattedColors }),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to update the inventory product.');
      }

      const data = await response.json();
      return data.inventoryProduct;
    },
    {
      onMutate: values => {
        queryClient.cancelQueries([
          'inventory-products',
          'inventory-product',
          router.query.id,
        ]);
        const updatedInventoryProduct = {
          ...inventoryProduct,
          ...values,
        };
        queryClient.setQueryData(
          ['inventory-products', 'inventory-product', router.query.id],
          updatedInventoryProduct
        );
        return updatedInventoryProduct;
      },
      onError: () => {
        queryClient.setQueryData(
          ['inventory-products', 'inventory-product', router.query.id],
          inventoryProduct
        );
      },
      onSettled: () => {
        return queryClient.invalidateQueries();
      },
      onSuccess: (_data, variables) => {
        router.push(`/inventory-products/${variables._id}`);
      },
    }
  );

  const updateSkuActiveStatus = useMutation(
    async (skuId: string) => {
      if (!inventoryProduct) {
        throw new Error('No inventory product found.');
      }

      const updatedSkus = inventoryProduct.skus.map(s => {
        if (s.id === skuId) {
          return { ...s, active: !s.active };
        }
        return s;
      });

      const { _id, ...update }: InventoryProduct = {
        ...inventoryProduct,
        skus: updatedSkus,
      };

      const response = await fetch(`/api/inventory-products/update`, {
        method: 'post',
        body: JSON.stringify({ id: inventoryProduct._id, update }),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to updated the inventory product sku.');
      }

      const data = await response.json();
      return data.inventoryProduct;
    },
    {
      onMutate: async skuId => {
        if (!inventoryProduct) {
          throw new Error('No inventory product found.');
        }
        const updatedSkus = inventoryProduct.skus.map(s => {
          if (s.id === skuId) {
            return { ...s, active: !s.active };
          }
          return s;
        });

        const update: InventoryProduct = {
          ...inventoryProduct,
          skus: updatedSkus,
        };
        await queryClient.cancelQueries([
          'inventory-products',
          'inventory-product',
          router.query.id,
        ]);
        queryClient.setQueryData(
          ['inventory-products', 'inventory-product', router.query.id],
          update
        );
      },
      onError: () => {
        queryClient.setQueryData(
          ['inventory-products', 'inventory-product', router.query.id],
          inventoryProduct
        );
      },
      onSettled: async () => {
        return queryClient.invalidateQueries();
      },
    }
  );

  const updateSkuOrder = useMutation(async (dndSkus: InventorySku[]) => {
    const response = await fetch(`/api/inventory-products/update`, {
      method: 'post',
      body: JSON.stringify({
        id: inventoryProduct?._id,
        update: { skus: dndSkus },
      }),
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to update the inventory order.');
    }

    const data = await response.json();
    return data.inventoryProduct;
  });

  return {
    createProduct,
    updateProduct,
    updateProductIncludingSkus,
    updateSkuActiveStatus,
    updateSkuOrder,
  };
}
