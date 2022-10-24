import { useMutation, useQueryClient } from 'react-query';
import { ShippingData, ShippingDataForm } from '../interfaces';

export default function useShippingDetailsMutation() {
  const queryClient = useQueryClient();

  const updateShippingDetails = useMutation(
    async (formValues: ShippingDataForm) => {
      const response = await fetch('/api/shipping/update-shipping-details', {
        method: 'POST',
        body: JSON.stringify(formValues),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to update shipping details');
      }

      const data: { shipping: ShippingData } = await response.json();
      return data.shipping;
    },
    {
      onSettled: () => {
        queryClient.invalidateQueries(['stores', 'homepage']);
      },
    }
  );

  return { updateShippingDetails };
}
