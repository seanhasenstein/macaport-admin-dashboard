import { useMutation, useQueryClient } from 'react-query';
import { ShippingData, ShippingDataForm, Store } from '../interfaces';

type Props =
  | {
      shipping: ShippingDataForm;
      stores: Store[];
    }
  | undefined;

export default function useShippingDetailsMutation(props: Props) {
  const queryClient = useQueryClient();

  const updateShippingDetails = useMutation(
    async ({
      formValues,
      homepageStores,
    }: {
      formValues: ShippingDataForm;
      homepageStores: Store[];
    }) => {
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
      return { shipping: data.shipping, stores: homepageStores };
    },
    {
      onMutate: data => {
        queryClient.cancelQueries(['stores', 'homepage']);
        const updatedData = {
          shipping: data.formValues,
          stores: data.homepageStores,
        };
        queryClient.setQueryData(['stores', 'homepage'], updatedData);
        return updatedData;
      },
      onError: () => {
        queryClient.setQueryData(['stores', 'homepage'], {
          stores: props?.stores,
          shipping: props?.shipping,
        });
      },
      onSettled: () => {
        queryClient.invalidateQueries(['stores', 'homepage']);
      },
    }
  );

  return { updateShippingDetails };
}
