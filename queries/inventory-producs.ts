import { InventoryProduct } from '../interfaces';

export async function fetchInventoryProducts(
  page: number | undefined,
  pageSize: number
) {
  const response = await fetch(
    `/api/inventory-products?page=${page}&pageSize=${pageSize}`
  );

  if (!response.ok) {
    throw new Error('Failed to fetch the inventory products.');
  }

  const data: { inventoryProducts: InventoryProduct[]; count: number } =
    await response.json();

  return data;
}
