import { useMutation, useQueryClient } from 'react-query';
import { Order, Store } from '../interfaces';
import { RefundChoices, RefundInput, RefundSplit } from '../utils/refund';

type Props = {
  order: Order | undefined;
  store: Store | undefined;
};

export function useMarkStripeRefunded({ order, store }: Props) {
  const queryClient = useQueryClient();
  return useMutation(
    async () => {
      if (!order || !store) throw new Error('No order selected.');
      const response = await fetch(
        `/api/orders/mark-stripe-refunded?sid=${store._id}&oid=${order.orderId}`,
        { method: 'POST' }
      );
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(data.error || 'Could not record the Stripe refund.');
      }
      return data;
    },
    { onSettled: () => queryClient.invalidateQueries('stores') }
  );
}

export function useRefundMutation({ order, store }: Props) {
  const queryClient = useQueryClient();

  return useMutation(
    async (input: RefundInput & RefundChoices) => {
      if (!order || !store) throw new Error('No order selected.');
      const response = await fetch(
        `/api/orders/refund?sid=${store._id}&oid=${order.orderId}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(input),
        }
      );
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(data.error || 'Failed to record the refund.');
      }
      return data as {
        split: RefundSplit;
        emailed: boolean;
        redirectedTo: string | null;
        restocked: number;
      };
    },
    {
      onSettled: () => {
        queryClient.invalidateQueries('stores');
        queryClient.invalidateQueries('benefit');
        queryClient.invalidateQueries('inventory-products');
      },
    }
  );
}
