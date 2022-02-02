import { useRouter } from 'next/router';
import { useMutation, useQueryClient } from 'react-query';
import { Note, Store, StoreForm, StoreProduct } from '../interfaces';
import { createId } from '../utils';
import { formatDataForDb } from '../utils/storeForm';

type Props = {
  store?: Store;
  stores?: Store[];
};

export function useStoreMutations({ store, stores }: Props = {}) {
  const router = useRouter();
  const queryClient = useQueryClient();

  const createStore = useMutation(
    async (store: StoreForm) => {
      const response = await fetch(`/api/stores/create`, {
        method: 'POST',
        body: JSON.stringify(formatDataForDb(store)),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to create the store.');
      }

      const data = await response.json();
      return data.store;
    },
    {
      onMutate: async newStore => {
        await queryClient.cancelQueries(['stores']);
        const formattedNewStore = formatDataForDb(newStore);
        const previousStores = stores || [];
        const updatedStores = [
          ...previousStores,
          { ...formattedNewStore, _id: createId() },
        ];
        queryClient.setQueryData(['stores'], updatedStores);
        return { previousStores, newStore };
      },
      onError: () => {
        // TODO: trigger a notification
        queryClient.setQueryData(['stores'], stores);
      },
      onSettled: () => {
        queryClient.invalidateQueries(['stores']);
      },
      onSuccess: data => {
        router.push(`/stores/${data._id}?createStore=true`);
      },
    }
  );

  const updateStoreProducts = useMutation(
    async (updatedProducts: StoreProduct[]) => {
      const response = await fetch(`/api/stores/update?id=${store?._id}`, {
        method: 'post',
        body: JSON.stringify({ products: updatedProducts }),
        headers: {
          'Content-Type': 'application/json',
        },
      });
      if (!response.ok) {
        throw new Error('Failed to update the products.');
      }
      const data = await response.json();
      return data.store;
    },
    {
      onMutate: async updatedProducts => {
        await queryClient.cancelQueries(['stores']);
        queryClient.setQueryData(['stores', 'store', store?._id], {
          ...store,
          products: updatedProducts,
        });
      },
      onError: () => {
        queryClient.setQueryData(['stores', 'store', store?._id], store);
      },
      onSuccess: () => {
        queryClient.invalidateQueries('stores');
      },
    }
  );

  const updateStoreForm = useMutation(
    async (values: StoreForm) => {
      const response = await fetch(`/api/stores/update?id=${router.query.id}`, {
        method: 'POST',
        body: JSON.stringify(formatDataForDb(values)),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to update the store.');
      }

      const data = await response.json();
      return data.store;
    },
    {
      onMutate: async updatedStore => {
        await queryClient.cancelQueries(['stores', 'store', router.query.id]);
        const update = {
          ...formatDataForDb(updatedStore),
          _id: store?._id,
        };
        queryClient.setQueryData(['stores', 'store', router.query.id], update);
        return { previousStore: store, update };
      },
      onError: () => {
        // TODO: trigger a notification
        queryClient.setQueryData(['stores', 'store', router.query.id], store);
      },
      onSettled: () => {
        queryClient.invalidateQueries(['stores']);
      },
      onSuccess: () => {
        router.push(`/stores/${store?._id}?updateStore=true`);
      },
    }
  );

  const deleteStore = useMutation(
    async (id: string) => {
      const response = await fetch(`/api/stores/delete?id=${router.query.id}`, {
        method: 'post',
        body: JSON.stringify({ id }),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to delete the store.');
      }

      const data = await response.json();
      return data;
    },
    {
      onMutate: async id => {
        await queryClient.cancelQueries(['stores', 'store', router.query.id]);
        const previousStores = queryClient.getQueryData<Store[]>(['stores']);
        const updatedStores = previousStores?.filter(s => s._id !== id);
        queryClient.setQueryData(['stores'], updatedStores);
        return previousStores;
      },
      onError: (_error, _id, context) => {
        // TODO: trigger a notification
        queryClient.setQueryData(['stores'], context);
      },
      onSettled: async () => {
        queryClient.invalidateQueries(['stores']);
      },
      onSuccess: () => {
        router.push(`/?deleteStore=true`);
      },
    }
  );

  const addNote = useMutation(
    async (note: Note) => {
      if (!store) return;
      const prevNotes = store.notes || [];

      const response = await fetch(`/api/stores/update?id=${router.query.id}`, {
        method: 'post',
        body: JSON.stringify({ notes: [...prevNotes, note] }),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to create the note.');
      }

      const data = await response.json();
      return data.store;
    },
    {
      onMutate: async newNote => {
        await queryClient.cancelQueries(['stores', 'store', router.query.id]);
        const previousNotes = store?.notes || [];
        queryClient.setQueryData(['stores', 'store', router.query.id], {
          ...store,
          notes: [...previousNotes, newNote],
        });
        return { previousNotes, newNote };
      },
      onError: () => {
        // TODO: trigger a notification that the mutation failed.
        queryClient.setQueryData(['stores', 'store', router.query.id], store);
      },
      onSettled: () => {
        queryClient.invalidateQueries('stores');
      },
    }
  );

  const updateNote = useMutation(
    async (note: Note) => {
      const notes = store?.notes.map(n => {
        if (n.id === note.id) {
          return note;
        } else {
          return n;
        }
      });

      const response = await fetch(`/api/stores/update?id=${router.query.id}`, {
        method: 'post',
        body: JSON.stringify({ notes }),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to update the note.');
      }

      const data = await response.json();
      return data.store;
    },
    {
      onMutate: async updatedNote => {
        await queryClient.cancelQueries(['stores', 'store', router.query.id]);
        const previousNotes = store?.notes;
        const updatedNotes = previousNotes?.map(n =>
          n.id === updatedNote.id ? updatedNote : n
        );
        queryClient.setQueryData(['stores', 'store', router.query.id], {
          ...store,
          notes: updatedNotes,
        });
        return { previousNotes, updatedNote };
      },
      onError: () => {
        // TODO: trigger a notification
        queryClient.setQueryData(['stores', 'store', router.query.id], store);
      },
      onSettled: () => {
        queryClient.invalidateQueries('stores');
      },
    }
  );

  const deleteNote = useMutation(
    async (id: string) => {
      const notes = store?.notes.filter(n => n.id !== id);

      const response = await fetch(`/api/stores/update?id=${router.query.id}`, {
        method: 'post',
        body: JSON.stringify({ notes }),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to delete the note.');
      }

      const data = await response.json();
      return data.store;
    },
    {
      onMutate: async id => {
        await queryClient.cancelQueries(['stores', 'store', router.query.id]);
        const previousNotes = store?.notes;
        const updatedNotes = previousNotes?.filter(n => n.id !== id);
        queryClient.setQueryData(['stores', 'store', router.query.id], {
          ...store,
          notes: updatedNotes,
        });
        return { previousNotes };
      },
      onError: () => {
        // TODO: trigger a notification?
        queryClient.setQueryData(['stores', 'store', router.query.id], store);
      },
      onSettled: () => {
        queryClient.invalidateQueries('stores');
      },
    }
  );

  return {
    createStore,
    updateStoreForm,
    updateStoreProducts,
    deleteStore,
    addNote,
    updateNote,
    deleteNote,
  };
}
