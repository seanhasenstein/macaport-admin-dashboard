import styled from 'styled-components';

import { useOrderItemMutation } from '../../hooks/useOrderItemMutation';

import { Order, Store } from '../../interfaces';
import LoadingSpinner from '../LoadingSpinner';

type Props = {
  order: Order;
  store: Store;
  userId: string | undefined;
  orderHasUnfulfilledItems: boolean;
};

export default function UnfulfilledToFulfulledButton({
  order,
  store,
  userId,
  orderHasUnfulfilledItems,
}: Props) {
  const { updateUnfulfilledOrderItemsToFulfilled } = useOrderItemMutation({
    store,
    userId: userId || '',
    order: {} as Order,
  });

  return (
    <>
      {orderHasUnfulfilledItems ? (
        <Button
          type="button"
          onClick={() => updateUnfulfilledOrderItemsToFulfilled.mutate(order)}
          disabled={updateUnfulfilledOrderItemsToFulfilled.isLoading}
        >
          {updateUnfulfilledOrderItemsToFulfilled.isLoading ? (
            <LoadingSpinner
              isLoading={updateUnfulfilledOrderItemsToFulfilled.isLoading}
            />
          ) : (
            <>
              Set item
              {order.items.reduce((acc, currItem) => {
                if (currItem.status.current === 'Unfulfilled')
                  return acc + currItem.quantity;
                else return acc;
              }, 0) > 1
                ? 's'
                : ''}
              <br />
              to fulfilled
            </>
          )}
        </Button>
      ) : null}
    </>
  );
}

const Button = styled.button`
  padding: 0.4375rem 0.75rem;
  min-width: 6.6875rem;
  min-height: 3.4375rem;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 0.625rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  text-align: center;
  background-color: #f5f5f5;
  color: #0a0a0a;
  line-height: 130%;
  border: 1px solid rgba(0, 0, 0, 0.1);
  border-radius: 0.1875rem;
  cursor: pointer;
  transition: 200ms all ease;
  &:hover {
    background-color: #eee;
    border-color: rgba(0, 0, 0, 0.15);
    color: #000;
  }
`;
