import styled from 'styled-components';
import classNames from 'classnames';

import { useUpdateOrderStatus } from '../../hooks/useUpdateOrderStatus';

import { Order, OrderStatus, Store } from '../../interfaces';

type Props = {
  store: Store;
  order: Order;
  copy?: string;
  customClass?: string;
};

export default function OrderStatusButton({
  store,
  order,
  copy,
  customClass,
}: Props) {
  const updateOrderStatus = useUpdateOrderStatus(store, order);

  const handleStatusButtonClick = (orderStatus: OrderStatus) => {
    if (orderStatus === 'Canceled') return;
    const updatedStatus =
      orderStatus === 'Unfulfilled'
        ? 'Printed'
        : orderStatus === 'Printed'
        ? 'Fulfilled'
        : orderStatus === 'Fulfilled'
        ? 'PartiallyShipped'
        : orderStatus === 'PartiallyShipped'
        ? 'Shipped'
        : orderStatus === 'Shipped'
        ? 'Unfulfilled'
        : 'Unfulfilled';
    updateOrderStatus.mutate(updatedStatus);
  };

  return (
    <OrderStatusButtonStyles
      type="button"
      onClick={() => handleStatusButtonClick(order.orderStatus)}
      disabled={order.orderStatus === 'Canceled'}
      className={classNames(order.orderStatus.toLowerCase() || '', customClass)}
    >
      {copy ? (
        copy
      ) : order.orderStatus === 'PartiallyShipped' ? (
        <>
          Partially <br />
          Shipped
        </>
      ) : (
        order.orderStatus
      )}
    </OrderStatusButtonStyles>
  );
}

const OrderStatusButtonStyles = styled.button`
  padding: 0.28125rem 0;
  min-width: 6.5rem;
  font-size: 0.6875rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: #374151;
  background: #e5e7eb;
  border: none;
  border: 1px solid rgba(0, 0, 0, 0.12);
  border-radius: 0.25rem;
  cursor: pointer;

  &.unfulfilled {
    background-color: #fee2e2;
    color: #991b1b;
  }

  &.printed {
    background-color: #e0e7ff;
    color: #3730a3;
  }

  &.fulfilled {
    background-color: #fef3c7;
    color: #92400e;
  }

  &.partiallyshipped {
    background-color: #fae8ff;
    color: #86198f;
  }

  &.shipped {
    background-color: #d1fae5;
    color: #065f46;
  }

  &.canceled {
    background-color: #ecf1fb;
    color: #224fb3;
  }

  &:hover {
  }

  &:disabled {
    cursor: default;
    pointer-events: none;
  }
`;
