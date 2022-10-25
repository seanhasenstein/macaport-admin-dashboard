import {
  ShippingData,
  ShippingDataForm,
  Store,
  StoreStatusFilter,
} from '../interfaces';

export async function fetchAllStores() {
  const response = await fetch('/api/stores/get-all-stores');

  if (!response.ok) {
    throw new Error('Failed to fetch the stores.');
  }

  const data: { stores: Store[] } = await response.json();
  return data.stores;
}

interface FetchHomepageData {
  stores: Store[];
  shipping: ShippingDataForm;
}

export async function fetchHomepageData(): Promise<FetchHomepageData> {
  const response = await fetch('/api/stores/get-homepage-data');

  if (!response.ok) {
    throw new Error('Failed to fetch the stores.');
  }

  const data: { stores: Store[]; shipping: ShippingData } =
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

  const data: { stores: Store[]; count: number } = await response.json();
  return data;
}
