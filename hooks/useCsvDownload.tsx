import React from 'react';
import { useQuery } from 'react-query';

type Field = {
  id: number;
  field: string;
  checked: boolean;
};

export default function useCsvDownload(
  storeId: string | undefined,
  fields: Field[],
  options: Record<string, unknown> = {}
) {
  const [enabled, setEnabled] = React.useState(false);

  if (enabled && !storeId) {
    throw Error('A store ID is required to download the orders csv file.');
  }

  async function getCsvData() {
    const response = await fetch(`/api/stores/${storeId}/orders-to-csv`, {
      method: 'post',
      body: JSON.stringify({ fields }),
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw Error('Failed to fetch the csv data');
    }

    const data = await response.json();
    return data.csv;
  }

  return [
    setEnabled,
    useQuery(['stores', 'store', storeId, 'csv-orders'], getCsvData, {
      ...options,
      enabled,
    }),
  ] as const;
}
