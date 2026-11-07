import { useMutation, useQueryClient } from 'react-query';
import { ClientInvoice } from '../interfaces';
import { postJson } from './useBenefitMutations';

export interface CreateInvoiceValues {
  number: string;
  issuedAt: string;
  dueAt: string;
  note: string;
  orderIds: string[];
  paid: { paidAt: string; reference: string } | null;
}

export function useInvoiceMutations({
  storeId,
}: {
  storeId: string | undefined;
}) {
  const queryClient = useQueryClient();
  const base = `/api/stores/${storeId}/benefit/invoices`;
  // Orders carry the invoice link, so the store reloads too.
  const settled = () => {
    queryClient.invalidateQueries('invoices');
    queryClient.invalidateQueries('stores');
  };

  const createInvoice = useMutation(
    (values: CreateInvoiceValues) =>
      postJson<{ invoice: ClientInvoice }>(`${base}/create`, {
        ...values,
        dueAt: values.dueAt || null,
      }),
    { onSettled: settled }
  );

  const markPaid = useMutation(
    (values: { invoiceId: string; paidAt: string; reference: string }) =>
      postJson<{ invoice: ClientInvoice }>(`${base}/mark-paid`, values),
    { onSettled: settled }
  );

  const voidInvoice = useMutation(
    (invoiceId: string) =>
      postJson<{ invoice: ClientInvoice }>(`${base}/void`, { invoiceId }),
    { onSettled: settled }
  );

  const setExclusion = useMutation(
    (values: { orderId: string; exclude: boolean; reason?: string }) =>
      postJson<{ success: boolean }>(`${base}/exclude`, values),
    { onSettled: () => queryClient.invalidateQueries('stores') }
  );

  return { createInvoice, markPaid, voidInvoice, setExclusion };
}
