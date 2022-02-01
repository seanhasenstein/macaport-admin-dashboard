import styled from 'styled-components';
import { Order, OrderStatus, Store } from '../interfaces';
import { useUpdateOrderStatus } from '../hooks/useUpdateOrderStatus';

type Props = {
  store: Store;
  order: Order;
};

export default function OrderStatusButton({ store, order }: Props) {
  const updateOrderStatus = useUpdateOrderStatus(store, order);

  const handleStatusButtonClick = (orderStatus: OrderStatus) => {
    const updatedStatus =
      orderStatus === 'Unfulfilled'
        ? 'Fulfilled'
        : orderStatus === 'Fulfilled'
        ? 'Completed'
        : orderStatus === 'Completed'
        ? 'Unfulfilled'
        : 'Unfulfilled';
    updateOrderStatus.mutate(updatedStatus);
  };

  return (
    <OrderStatusButtonStyles
      type="button"
      onClick={() => handleStatusButtonClick(order.orderStatus)}
      className={`status-button ${
        order.orderStatus === 'Completed'
          ? 'completed'
          : order.orderStatus === 'Fulfilled'
          ? 'fulfilled'
          : order.orderStatus === 'Unfulfilled'
          ? 'unfulfilled'
          : ''
      }`}
    >
      {order.orderStatus}
    </OrderStatusButtonStyles>
  );
}

const OrderStatusButtonStyles = styled.button`
  padding: 0.25rem 0.5rem;
  font-size: 0.6875rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: #374151;
  background: #e5e7eb;
  border: none;
  border-radius: 0.3125rem;
  cursor: pointer;

  &.unfulfilled {
    background-color: #fee2e2;
    color: #991b1b;
  }

  &.fulfilled {
    background-color: #fef3c7;
    color: #92400e;
  }

  &.completed {
    background-color: #d1fae5;
    color: #065f46;
  }
`;
