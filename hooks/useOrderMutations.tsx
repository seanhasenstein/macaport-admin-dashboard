import { useRouter } from 'next/router';
import { useMutation, useQueryClient } from 'react-query';
import { Note, Order, Store } from '../interfaces';

type Props = {
  order?: Order;
  store?: Store;
};

export function useOrderMutation({ order, store }: Props) {
  const router = useRouter();
  const queryClient = useQueryClient();

  const cancelOrder = useMutation(
    async () => {
      if (!order || !store) return;

      const response = await fetch(
        `/api/orders/cancel?sid=${store._id}&oid=${order.orderId}`,
        {
          method: 'post',
          body: JSON.stringify({ order }),
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to cancel the order');
      }

      const data: { store: Store } = await response.json();
      return data.store;
    },
    {
      onMutate: async () => {
        await queryClient.cancelQueries([
          'stores',
          'store',
          'order',
          router.query.id,
        ]);

        if (order && store) {
          const updatedItems = order.items.map(i => ({
            ...i,
            quantity: 0,
            itemTotal: 0,
          }));
          const updatedOrder: Order = {
            ...order,
            orderStatus: 'Canceled',
            items: updatedItems,
            summary: {
              ...order.summary,
              subtotal: 0,
              salesTax: 0,
              shipping: 0,
              total: 0,
            },
          };
          const updatedStoreOrders = store.orders.map(o => {
            if (o.orderId === order.orderId) {
              return updatedOrder;
            }
            return o;
          });
          const updatedStore: Store = { ...store, orders: updatedStoreOrders };
          queryClient.setQueryData(
            ['stores', 'store', 'order', order.orderId],
            { store: updatedStore, order: updatedOrder }
          );
          return updatedOrder;
        }
      },
      onError: () => {
        queryClient.setQueryData(['stores', 'store', 'order', order?.orderId], {
          store,
          order,
        });
      },
      onSettled: () => {
        queryClient.invalidateQueries('stores');
        queryClient.invalidateQueries('inventory-products');
      },
    }
  );

  const addNote = useMutation(
    async (note: Note) => {
      if (!order) return;
      const prevNotes = order.notes || [];
      const response = await fetch(
        `/api/orders/update/notes?id=${router.query.sid}&oid=${router.query.id}`,
        {
          method: 'post',
          body: JSON.stringify({ notes: [...prevNotes, note] }),
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to add the note.');
      }

      const responseData = await response.json();
      return responseData.store;
    },
    {
      onMutate: async newNote => {
        await queryClient.cancelQueries([
          'stores',
          'store',
          'order',
          router.query.id,
        ]);
        const previousNotes = order?.notes || [];
        const updatedOrders = store?.orders.map(o => {
          if (o.orderId === router.query.id) {
            return { ...o, notes: [...previousNotes, newNote] };
          }
          return o;
        });

        queryClient.setQueryData(
          ['stores', 'store', 'order', router.query.id],
          {
            store: { ...store, orders: updatedOrders },
            order: { ...order, notes: [...previousNotes, newNote] },
          }
        );

        return { previousNotes, newNote };
      },
      onError: () => {
        // TODO: trigger a notification
        queryClient.setQueryData(
          ['stores', 'store', 'order', router.query.id],
          { store, order }
        );
      },
      onSettled: () => {
        queryClient.invalidateQueries('stores');
        queryClient.invalidateQueries(['order', router.query.id]);
      },
    }
  );

  const updateNote = useMutation(
    async (note: Note) => {
      const notes = order?.notes.map(n => {
        if (n.id === note.id) {
          return note;
        } else {
          return n;
        }
      });

      const response = await fetch(
        `/api/orders/update/notes?id=${router.query.sid}&oid=${router.query.id}`,
        {
          method: 'post',
          body: JSON.stringify({ notes }),
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to update the note.');
      }

      const responseData = await response.json();
      return responseData.store;
    },
    {
      onMutate: async updatedNote => {
        await queryClient.cancelQueries([
          'stores',
          'store',
          'order',
          router.query.id,
        ]);
        const previousNotes = order?.notes;
        const updatedNotes = previousNotes?.map(n =>
          n.id === updatedNote.id ? updatedNote : n
        );
        const updatedOrders = store?.orders.map(o => {
          if (o.orderId === router.query.id) {
            return { ...o, notes: updatedNotes };
          }
          return o;
        });
        queryClient.setQueryData(
          ['stores', 'store', 'order', router.query.id],
          {
            store: { ...store, orders: updatedOrders },
            order: { ...order, notes: updatedNotes },
          }
        );
        return { previousNotes, updatedNote };
      },
      onError: () => {
        // TODO: trigger a notifaction
        queryClient.setQueryData(
          ['stores', 'store', 'order', router.query.id],
          { store, order }
        );
      },
      onSettled: () => {
        queryClient.invalidateQueries('stores');
        // TODO: do I need this second invalidation?
        queryClient.invalidateQueries([
          'stores',
          'store',
          'order',
          router.query.id,
        ]);
      },
    }
  );

  const deleteNote = useMutation(
    async (id: string) => {
      const notes = order?.notes.filter(n => n.id !== id);

      const response = await fetch(
        `/api/orders/update/notes?id=${router.query.sid}&oid=${router.query.id}`,
        {
          method: 'post',
          body: JSON.stringify({ notes }),
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to delete the note.');
      }

      const responseData = await response.json();
      return responseData.store;
    },
    {
      onMutate: async id => {
        await queryClient.cancelQueries([
          'stores',
          'store',
          'order',
          router.query.id,
        ]);
        const previousNotes = order?.notes;
        const updatedNotes = previousNotes?.filter(n => n.id !== id);
        const updatedOrder = { ...order, notes: updatedNotes };
        const updatedOrders = store?.orders.map(o => {
          if (o.orderId === router.query.id) {
            return { ...o, notes: updatedNotes };
          }
          return o;
        });
        const updatedStore = { ...store, orders: updatedOrders };
        queryClient.setQueryData(
          ['stores', 'store', 'order', router.query.id],
          { store: updatedStore, order: updatedOrder }
        );
        return { previousNotes };
      },
      onError: () => {
        // TODO: trigger a notification
        queryClient.setQueryData(
          ['stores', 'store', 'order', router.query.id],
          { store, order }
        );
      },
      onSettled: () => {
        queryClient.invalidateQueries('stores');
      },
    }
  );

  return {
    addNote,
    updateNote,
    deleteNote,
    cancelOrder,
  };
}
