import { useRouter } from 'next/router';
import { useMutation, useQueryClient } from 'react-query';
import {
  InventoryColor,
  InventoryProduct,
  InventorySize,
  InventorySku,
  Note,
} from '../interfaces';
import { UpdateFormValues } from '../utils/inventoryProduct';
import { formatHexColors } from '../utils';

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
  notes: Note[];
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
      onSuccess: ({ inventoryProduct }) => {
        queryClient.invalidateQueries(['inventory-products']);
        router.push(
          `/inventory-products/${inventoryProduct.inventoryProductId}`
        );
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
        queryClient.invalidateQueries(['inventory-products']);
        queryClient.invalidateQueries(['stores']);
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
        queryClient.invalidateQueries('inventory-products');
        queryClient.invalidateQueries('stores');
      },
      onSuccess: (_data, variables) => {
        router.push(`/inventory-products/${variables.inventoryProductId}`);
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
        queryClient.invalidateQueries(['inventory-products']);
        queryClient.invalidateQueries(['stores']);
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

  const addNote = useMutation(
    async (newNote: Note) => {
      if (!inventoryProduct) return;
      const prevNotes = inventoryProduct.notes || [];
      const notes = [...prevNotes, newNote];

      const response = await fetch('/api/inventory-products/update', {
        method: 'post',
        body: JSON.stringify({ id: inventoryProduct._id, update: { notes } }),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to add the note.');
      }

      const data: { inventoryProduct: InventoryProduct } =
        await response.json();
      return data.inventoryProduct;
    },
    {
      onMutate: async newNote => {
        await queryClient.cancelQueries([
          'inventory-products',
          'inventory-product',
          inventoryProduct?.inventoryProductId,
        ]);
        const previousNotes = inventoryProduct?.notes || [];
        const updatedInvProd = {
          ...inventoryProduct,
          notes: [...previousNotes, newNote],
        };
        queryClient.setQueryData(
          [
            'inventory-products',
            'inventory-product',
            inventoryProduct?.inventoryProductId,
          ],
          updatedInvProd
        );
        return { previousNotes, newNote };
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
      onSettled: () => {
        queryClient.invalidateQueries('inventory-products');
      },
    }
  );

  const updateNote = useMutation(
    async (updatedNote: Note) => {
      const notes = inventoryProduct?.notes.map(n => {
        if (n.id === updatedNote.id) {
          return updatedNote;
        }
        return n;
      });

      const response = await fetch('/api/inventory-products/update', {
        method: 'post',
        body: JSON.stringify({ id: inventoryProduct?._id, update: { notes } }),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to update the note.');
      }

      const data: { inventoryProduct: InventoryProduct } =
        await response.json();
      return data.inventoryProduct;
    },
    {
      onMutate: async updatedNote => {
        await queryClient.cancelQueries([
          'inventory-products',
          'inventory-product',
          inventoryProduct?.inventoryProductId,
        ]);
        const notes = inventoryProduct?.notes.map(n => {
          if (n.id === updatedNote.id) {
            return updatedNote;
          }
          return n;
        });
        const updatedInvProd = { ...inventoryProduct, notes };

        queryClient.setQueryData(
          [
            'inventory-products',
            'inventory-product',
            inventoryProduct?.inventoryProductId,
          ],
          updatedInvProd
        );

        return { previousNotes: inventoryProduct?.notes, updatedNote };
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
      onSettled: () => {
        queryClient.invalidateQueries(['inventory-products']);
      },
    }
  );

  const deleteNote = useMutation(
    async (id: string) => {
      const notes = inventoryProduct?.notes.filter(n => n.id !== id);

      const response = await fetch('/api/inventory-products/update', {
        method: 'post',
        body: JSON.stringify({ id: inventoryProduct?._id, update: { notes } }),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to delete the note.');
      }

      const data: { inventoryProduct: InventoryProduct } =
        await response.json();
      return data.inventoryProduct;
    },
    {
      onMutate: async id => {
        await queryClient.cancelQueries([
          'inventory-products',
          'inventory-product',
          inventoryProduct?.inventoryProductId,
        ]);
        const notes = inventoryProduct?.notes.filter(n => n.id !== id);
        const updatedInvProd = { ...inventoryProduct, notes };
        queryClient.setQueryData(
          [
            'inventory-products',
            'inventory-product',
            inventoryProduct?.inventoryProductId,
          ],
          updatedInvProd
        );
        return { previousNotes: notes };
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
      onSettled: () => {
        queryClient.invalidateQueries(['inventory-products']);
      },
    }
  );

  return {
    createProduct,
    updateProduct,
    updateProductIncludingSkus,
    updateSkuActiveStatus,
    updateSkuOrder,
    addNote,
    updateNote,
    deleteNote,
  };
}
