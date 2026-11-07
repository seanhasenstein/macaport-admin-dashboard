import { useQuery } from 'react-query';
import { ClientInvoice, ClientInvoiceStatus } from '../interfaces';

export function invoicesQueryKey(storeId: string | undefined) {
  return ['invoices', storeId];
}

// The invoices for one store's benefit.
export function useInvoicesQuery(storeId: string | undefined, enabled = true) {
  return useQuery<ClientInvoice[]>(
    invoicesQueryKey(storeId),
    async () => {
      const response = await fetch(`/api/stores/${storeId}/benefit/invoices`);
      if (!response.ok) throw new Error('Failed to fetch the invoices.');
      const data: { invoices: ClientInvoice[] } = await response.json();
      return data.invoices;
    },
    { enabled: Boolean(storeId) && enabled, staleTime: 1000 * 60 }
  );
}

// Receivables across every store.
export function useAllInvoicesQuery(status: ClientInvoiceStatus) {
  return useQuery<ClientInvoice[]>(
    ['invoices', 'all', status],
    async () => {
      const response = await fetch(`/api/client-invoices?status=${status}`);
      if (!response.ok) throw new Error('Failed to fetch the invoices.');
      const data: { invoices: ClientInvoice[] } = await response.json();
      return data.invoices;
    },
    { staleTime: 1000 * 60 }
  );
}
