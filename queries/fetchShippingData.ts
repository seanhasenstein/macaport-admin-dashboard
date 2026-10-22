import { ShippingData } from '../interfaces';

export async function fetchShippingData() {
  const response = await fetch('/api/shipping/get-shipping-data');

  if (!response.ok) {
    throw new Error('Failed to fetch the shipping data.');
  }

  // null when the store settings have never been saved.
  const data: { shipping: ShippingData | null } = await response.json();

  return data.shipping;
}
