import styled from 'styled-components';
import classNames from 'classnames';

import { colors } from '../../constants/colors';

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
    background-color: ${colors.unfulfilled.backgroundColor};
    color: ${colors.unfulfilled.color};
  }

  &.printed {
    background-color: ${colors.printed.backgroundColor};
    color: ${colors.printed.color};
  }

  &.fulfilled {
    background-color: ${colors.fulfilled.backgroundColor};
    color: ${colors.fulfilled.color};
  }

  &.partiallyshipped {
    background-color: ${colors.partiallyShipped.backgroundColor};
    color: ${colors.partiallyShipped.color};
  }

  &.shipped {
    background-color: ${colors.shipped.backgroundColor};
    color: ${colors.shipped.color};
  }

  &.canceled {
    background-color: ${colors.canceled.backgroundColor};
    color: ${colors.canceled.color};
  }
`;
