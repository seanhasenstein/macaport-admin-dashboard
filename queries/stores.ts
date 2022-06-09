import { Store, StoreStatusFilter } from '../interfaces';

export async function fetchHomepageStores() {
  const response = await fetch('/api/stores/get-homepage-stores');

  if (!response.ok) {
    throw new Error('Failed to fetch the stores.');
  }

  const data: Store[] = await response.json();
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

  const data: { stores: Store[]; count: number } = await response.json();
  return data;
}
