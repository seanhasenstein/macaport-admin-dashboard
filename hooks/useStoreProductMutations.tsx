import { useRouter } from 'next/router';
import { useMutation, useQueryClient } from 'react-query';
import { Color, Note, ProductSku, Store, StoreProduct } from '../interfaces';

type Props = {
  color?: Color;
  store?: Store;
  storeProduct?: StoreProduct;
};

type UpdateStatusProps = {
  storeId: string;
  storeProductId: string;
  productSkuId: string;
  updatedProductSku: ProductSku;
};

export function useStoreProductMutations({
  color,
  store,
  storeProduct,
}: Props = {}) {
  const router = useRouter();
  const queryClient = useQueryClient();

  const addProduct = useMutation(
    async (product: StoreProduct) => {
      const response = await fetch(
        `/api/stores/add-product?id=${router.query.id}`,
        {
          method: 'post',
          body: JSON.stringify(product),
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to add the product.');
      }

      const data = await response.json();
      return data.store;
    },
    {
      onMutate: async newProduct => {
        await queryClient.cancelQueries(['stores', 'store', router.query.id]);
        const storeProducts = store?.products || [];
        const updatedStore = {
          ...store,
          products: [...storeProducts, newProduct],
        };
        queryClient.setQueryData(
          ['stores', 'store', router.query.id],
          updatedStore
        );
        return { previousStore: store, newProduct };
      },
      onError: () => {
        // TODO: trigger a notification
        queryClient.setQueryData(['stores', 'store', router.query.id], store);
      },
      onSettled: () => {
        return queryClient.invalidateQueries(['stores']);
      },
      onSuccess: (data, variables) => {
        router.push(
          `/stores/${router.query.id}/product?pid=${variables.id}&addProduct=true`
        );
      },
    }
  );

  const updateProduct = useMutation(
    async (updatedProduct: StoreProduct) => {
      const response = await fetch(
        `/api/stores/update-product?sid=${router.query.id}&pid=${router.query.pid}`,
        {
          method: 'post',
          body: JSON.stringify(updatedProduct),
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to add the product.');
      }

      const data = await response.json();
      return data.store;
    },
    {
      onMutate: async updatedProduct => {
        await queryClient.cancelQueries([
          'stores',
          'store',
          'product',
          router.query.pid,
        ]);
        queryClient.setQueryData(
          ['stores', 'store', 'product', router.query.pid],
          updatedProduct
        );
      },
      onError: () => {
        // TODO: trigger a notifcation
        queryClient.setQueryData(
          ['stores', 'store', 'product', router.query.pid],
          storeProduct
        );
      },
      onSettled: () => {
        return queryClient.invalidateQueries('stores');
      },
      onSuccess: () => {
        router.push(
          `/stores/${router.query.id}/product?pid=${router.query.pid}&updateProduct=true`
        );
      },
    }
  );

  const updateSkuStatus = useMutation(
    async ({
      storeId,
      storeProductId,
      productSkuId,
      updatedProductSku,
    }: UpdateStatusProps) => {
      const response = await fetch(
        '/api/store-products/update-sku-active-status',
        {
          method: 'post',
          body: JSON.stringify({
            storeId,
            storeProductId,
            productSkuId,
            updatedProductSku,
          }),
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to update productSku.active');
      }

      const data = await response.json();
      return data;
    },
    {
      onMutate: async ({ productSkuId, updatedProductSku }) => {
        await queryClient.cancelQueries([
          'stores',
          'store',
          'product',
          router.query.pid,
        ]);

        const updatedProductSkus = storeProduct?.productSkus.map(ps => {
          if (ps.id === productSkuId) {
            return updatedProductSku;
          }
          return ps;
        });

        const updatedProduct = {
          ...storeProduct,
          productSkus: updatedProductSkus,
        };

        queryClient.setQueryData(
          ['stores', 'store', 'product', router.query.pid],
          updatedProduct
        );
      },
      onError: () => {
        // TODO: trigger a notification to announce the error and fallback
        queryClient.setQueryData(
          ['stores', 'store', 'product', router.query.pid],
          storeProduct
        );
      },
      onSettled: () => {
        return queryClient.invalidateQueries(['stores']);
      },
    }
  );

  const updateProductSkusOrder = useMutation(async (dndSkus: ProductSku[]) => {
    const response = await fetch(
      `/api/stores/update-product?sid=${router.query.id}&pid=${router.query.pid}`,
      {
        method: 'post',
        body: JSON.stringify({ ...storeProduct, productSkus: dndSkus }),
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      throw new Error('Failed to update the skus order');
    }

    const data: { store: Store } = await response.json();
    const product = data.store.products.find(p => p.id === storeProduct?.id);
    return product;
  });

  const updateColorsOrder = useMutation(
    async (colors: Color[]) => {
      const response = await fetch(
        `/api/stores/update-product?sid=${router.query.id}&pid=${router.query.pid}`,
        {
          method: 'post',
          body: JSON.stringify({ ...storeProduct, colors }),
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
      if (!response.ok) {
        throw new Error('Failed to update the colors.');
      }
      const { store }: { store: Store } = await response.json();
      const updatedProduct = store.products.find(
        p => p.id === storeProduct?.id
      );
      return updatedProduct?.colors;
    },
    {
      onSettled: () => {
        return queryClient.invalidateQueries('stores');
      },
    }
  );

  const updateSecondaryImgOrder = useMutation(
    async (secondaryImages: string[]) => {
      const response = await fetch(
        `/api/stores/update-color?sid=${router.query.id}&pid=${router.query.pid}&cid=${color?.id}`,
        {
          method: 'post',
          body: JSON.stringify({ ...color, secondaryImages }),
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
      if (!response.ok) {
        throw new Error('Failed to update the secondary images.');
      }
      const { store }: { store: Store } = await response.json();
      const updatedProduct = store.products.find(
        p => p.id === storeProduct?.id
      );
      const updatedColor = updatedProduct?.colors.find(c => c.id === color?.id);
      return updatedColor?.secondaryImages;
    },
    {
      onSettled: () => {
        return queryClient.invalidateQueries('stores');
      },
    }
  );

  const deleteProduct = useMutation(
    async (id: string | undefined) => {
      if (!id) {
        // TODO: on error figure out what to do with modal
        throw new Error('No store product id provided.');
      }
      const response = await fetch(`/api/store-products/delete`, {
        method: 'post',
        body: JSON.stringify({ storeId: router.query.id, storeProductId: id }),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to delete the product.');
      }

      const data = await response.json();
      return data.store;
    },
    {
      onSettled: () => {
        return queryClient.invalidateQueries('stores');
      },
      onSuccess: () => {
        router.push(`/stores/${router.query.id}?deleteProduct=true`);
      },
    }
  );

  const addNote = useMutation(
    async (newNote: Note) => {
      const prevNotes = storeProduct?.notes || [];
      const notes = [...prevNotes, newNote];

      const response = await fetch(
        `/api/stores/update-product?sid=${router.query.id}&pid=${router.query.pid}`,
        {
          method: 'post',
          body: JSON.stringify({ ...storeProduct, notes }),
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to add the store product note.');
      }

      const data: { store: Store } = await response.json();
      return data.store;
    },
    {
      onMutate: async newNote => {
        await queryClient.cancelQueries([
          'stores',
          'store',
          'product',
          storeProduct?.id,
        ]);
        const previousNotes = storeProduct?.notes || [];
        const notes = [...previousNotes, newNote];
        queryClient.setQueryData(
          ['stores', 'store', 'product', storeProduct?.id],
          { ...storeProduct, notes }
        );
        return { previousNotes, newNote };
      },
      onError: () => {
        queryClient.setQueryData(
          ['stores', 'store', 'product', storeProduct?.id],
          storeProduct
        );
      },
      onSettled: () => {
        return queryClient.invalidateQueries(['stores']);
      },
    }
  );

  const updateNote = useMutation(
    async (updatedNote: Note) => {
      const notes = storeProduct?.notes.map(n => {
        if (n.id === updatedNote.id) {
          return updatedNote;
        }
        return n;
      });

      const response = await fetch(
        `/api/stores/update-product?sid=${router.query.id}&pid=${router.query.pid}`,
        {
          method: 'post',
          body: JSON.stringify({ ...storeProduct, notes }),
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to update the note.');
      }

      const data: { store: Store } = await response.json();
      return data.store;
    },
    {
      onMutate: async updatedNote => {
        await queryClient.cancelQueries([
          'stores',
          'store',
          'product',
          storeProduct?.id,
        ]);
        const previousNotes = storeProduct?.notes;
        const notes = storeProduct?.notes.map(n => {
          if (n.id === updatedNote.id) {
            return updatedNote;
          }
          return n;
        });
        queryClient.setQueryData(
          ['stores', 'store', 'product', storeProduct?.id],
          { ...storeProduct, notes }
        );
        return { previousNotes, updatedNote };
      },
      onError: () => {
        queryClient.setQueryData(
          ['stores', 'store', 'product', storeProduct?.id],
          storeProduct
        );
      },
      onSettled: () => {
        return queryClient.invalidateQueries(['stores']);
      },
    }
  );

  const deleteNote = useMutation(
    async (id: string) => {
      const notes = storeProduct?.notes.filter(n => n.id !== id);

      const response = await fetch(
        `/api/stores/update-product?sid=${router.query.id}&pid=${router.query.pid}`,
        {
          method: 'post',
          body: JSON.stringify({ ...storeProduct, notes }),
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to delete the note.');
      }

      const data: { store: Store } = await response.json();
      return data.store;
    },
    {
      onMutate: async id => {
        await queryClient.cancelQueries([
          'stores',
          'store',
          'product',
          storeProduct?.id,
        ]);

        const previousNotes = storeProduct?.notes;
        const notes = previousNotes?.filter(n => n.id !== id);
        queryClient.setQueryData(
          ['stores', 'store', 'product', storeProduct?.id],
          { ...storeProduct, notes }
        );
        return { previousNotes };
      },
      onError: () => {
        queryClient.setQueryData(
          ['stores', 'store', 'product', storeProduct?.id],
          storeProduct
        );
      },
      onSettled: () => {
        return queryClient.invalidateQueries(['stores']);
      },
    }
  );

  return {
    addProduct,
    updateProduct,
    updateSkuStatus,
    updateProductSkusOrder,
    updateColorsOrder,
    updateSecondaryImgOrder,
    deleteProduct,
    addNote,
    updateNote,
    deleteNote,
  };
}
