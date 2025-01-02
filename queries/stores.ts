import { StoresTableStore, StoreStatusFilter } from '../interfaces';

interface FetchHomepageData {
  stores: StoresTableStore[];
}

export async function fetchHomepageData(): Promise<FetchHomepageData> {
  const response = await fetch('/api/stores/get-homepage-data');

  if (!response.ok) {
    throw new Error('Failed to fetch the stores.');
  }

  const data: { stores: StoresTableStore[] } = await response.json();
  return data;
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
