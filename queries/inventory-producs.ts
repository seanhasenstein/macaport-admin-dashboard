import { InventoryProduct } from '../interfaces';

function sortByName(
  inventoryProducts: InventoryProduct[],
  isDescending: boolean
) {
  return inventoryProducts.sort((ipA, ipB) => {
    const result = () => {
      if (ipA.name > ipB.name) {
        return 1;
      } else if (ipA.name < ipB.name) {
        return -1;
      } else {
        return 0;
      }
    };

    return isDescending ? result() * -1 : result();
  });
}

export async function fetchInventoryProducts() {
  const response = await fetch('/api/inventory-products');

  if (!response.ok) {
    throw new Error('Failed to fetch the inventory products.');
  }

  const data: { inventoryProducts: InventoryProduct[] } = await response.json();

  const sortedInventoryProducts = sortByName(data.inventoryProducts, false);

  return sortedInventoryProducts;
}
