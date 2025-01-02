import { useMutation, useQueryClient } from 'react-query';
import { ShippingData, ShippingDataForm } from '../interfaces';

export default function useShippingDetailsMutation(
  shippingData: ShippingData | undefined
) {
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
      onMutate: data => {
        queryClient.cancelQueries(['shipping']);
        queryClient.setQueryData(['shipping'], data);
        return data;
      },
      onError: () => {
        queryClient.setQueryData(['shipping'], shippingData);
      },
      onSettled: () => {
        queryClient.invalidateQueries(['shipping']);
      },
    }
  );

  return { updateShippingDetails };
}
