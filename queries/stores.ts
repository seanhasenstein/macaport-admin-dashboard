import {
  StoresTableStore,
  ShippingData,
  ShippingDataForm,
  StoreStatusFilter,
} from '../interfaces';

interface FetchHomepageData {
  stores: StoresTableStore[];
  shipping: ShippingDataForm;
}

export async function fetchHomepageData(): Promise<FetchHomepageData> {
  const response = await fetch('/api/stores/get-homepage-data');

  if (!response.ok) {
    throw new Error('Failed to fetch the stores.');
  }

  const data: { stores: StoresTableStore[]; shipping: ShippingData } =
    await response.json();

  const shipping: ShippingDataForm = {
    ...data.shipping,
    price: (data.shipping.price / 100).toFixed(2),
    freeMinimum: (data.shipping.freeMinimum / 100).toFixed(2),
  };
  return { ...data, shipping };
}

export async function fetchPaginatedStores(
  currentPage: number | undefined,
  pageSize: number,
  statusFilter: StoreStatusFilter,
  onlyUnfulfilled: boolean
) {
  const response = await fetch(
    `/api/stores/get-paginated-stores?page=${currentPage}&pageSize=${pageSize}&statusFilter=${statusFilter}&onlyUnfulfilled=${onlyUnfulfilled}`
  );

  if (!response.ok) {
    throw new Error('Failed to fetch the stores.');
  }

  const data: { stores: StoresTableStore[]; count: number } =
    await response.json();
  return data;
}
