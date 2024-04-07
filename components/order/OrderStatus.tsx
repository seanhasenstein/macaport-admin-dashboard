import styled from 'styled-components';
import classNames from 'classnames';

import { Order } from '../../interfaces';

type Props = {
  order: Order;
  copy?: string;
  customClass?: string;
};

export default function OrderStatus({ order, copy, customClass }: Props) {
  const orderWasPrinted = order.meta.receiptPrinted === true;
  const orderStatus =
    order.orderStatus === 'Unfulfilled' && orderWasPrinted
      ? 'Printed'
      : order.orderStatus;

  return (
    <OrderStatusStyles
      className={classNames(orderStatus.toLowerCase() || '', customClass)}
    >
      {copy ? (
        copy
      ) : order.orderStatus === 'PartiallyShipped' ? (
        <>
          Partially <br />
          Shipped
        </>
      ) : (
        orderStatus
      )}
    </OrderStatusStyles>
  );
}

const OrderStatusStyles = styled.div`
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

  &.unfulfilled {
    background-color: #fee2e2;
    color: #991b1b;
  }

  &.printed {
    background-color: #ffedd5;
    color: #c2410c;
  }

  &.fulfilled {
    background-color: #fef9c3;
    color: #a16207;
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
`;
