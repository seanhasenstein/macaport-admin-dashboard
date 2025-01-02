import { ShippingData } from '../interfaces';

export async function fetchShippingData() {
  const response = await fetch('/api/shipping/get-shipping-data');

  if (!response.ok) {
    throw new Error('Failed to fetch the shipping data.');
  }

  const data: { shipping: ShippingData } = await response.json();

  return data.shipping;
}
