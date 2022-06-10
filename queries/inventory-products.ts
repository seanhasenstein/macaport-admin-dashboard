import { InventoryProduct } from '../interfaces';

export async function fetchAllInventoryProducts() {
  const response = await fetch(
    '/api/inventory-products/get-all-inventory-products'
  );

  if (!response.ok) {
    throw new Error('Failed to fetch the inventory products.');
  }

  const data: { inventoryProducts: InventoryProduct[] } = await response.json();

  return data.inventoryProducts;
}

export async function fetchPaginatedInventoryProducts(
  page: number | undefined,
  pageSize: number
) {
  const response = await fetch(
    `/api/inventory-products/get-paginated-inventory-products?page=${page}&pageSize=${pageSize}`
  );

  if (!response.ok) {
    throw new Error('Failed to fetch the inventory products.');
  }

  const data: { inventoryProducts: InventoryProduct[]; count: number } =
    await response.json();

  return data;
}
