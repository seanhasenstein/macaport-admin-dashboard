import React from 'react';
import styled from 'styled-components';
import classNames from 'classnames';
import { CheckCircleIcon } from '@heroicons/react/20/solid';

import { getOrderItemsStatusTotals } from '../../utils/orderItem';

import { OrderItem } from '../../interfaces';

type Props = {
  orderItems: OrderItem[];
  customClass?: string;
};

export default function OrderItemBreakdown({ customClass, orderItems }: Props) {
  const itemStatusTotals = getOrderItemsStatusTotals(orderItems);
  const hasAnUnfulfilledItem = itemStatusTotals.Unfulfilled > 0;
  const hasAFulfilledItem = itemStatusTotals.Fulfilled > 0;
  const hasAnShippedItem = itemStatusTotals.Shipped > 0;
  const hasAnCanceledItem = itemStatusTotals.Canceled > 0;
  const allItemsAreShipped = itemStatusTotals.Shipped === orderItems.length;
  const allItemsAreCanceled = itemStatusTotals.Canceled === orderItems.length;
  const allItemsShippedOrCanceled =
    itemStatusTotals.Shipped + itemStatusTotals.Canceled === orderItems.length;

  return (
    <OrderItemBreakdownStyles
      shipped={allItemsShippedOrCanceled}
      className={classNames(customClass)}
    >
      {allItemsAreShipped && (
        <p className="all-items-shipped">
          <CheckCircleIcon className="icon" />
          All items are shipped!
        </p>
      )}
      {allItemsAreCanceled && (
        <p className="all-items-canceled">
          <CheckCircleIcon className="icon" />
          All items are canceled
        </p>
      )}
      {!allItemsAreShipped &&
      !allItemsAreCanceled &&
      allItemsShippedOrCanceled ? (
        <p className="all-items-shipped-or-canceled">
          <CheckCircleIcon className="icon" />
          All items are shipped{hasAnCanceledItem && ' or canceled'}
        </p>
      ) : null}
      {!allItemsShippedOrCanceled &&
      !allItemsAreShipped &&
      !allItemsAreCanceled ? (
        <>
          <p
            className={classNames('unfulfilled', {
              active: hasAnUnfulfilledItem,
            })}
          >
            <span className="dot" />
            Unfulfilled: {itemStatusTotals.Unfulfilled}
          </p>
          <p
            className={classNames('fulfilled', {
              active: hasAFulfilledItem,
            })}
          >
            <span className="dot" />
            Fulfilled: {itemStatusTotals.Fulfilled}
          </p>
          <p
            className={classNames('shipped', {
              active: hasAnShippedItem,
            })}
          >
            <span className="dot" />
            Shipped: {itemStatusTotals.Shipped}
          </p>
          <p
            className={classNames('canceled', {
              active: hasAnCanceledItem,
            })}
          >
            <span className="dot" />
            Canceled: {itemStatusTotals.Canceled}
          </p>
        </>
      ) : null}
    </OrderItemBreakdownStyles>
  );
}

const OrderItemBreakdownStyles = styled.div<{ shipped: boolean }>`
  display: grid;
  grid-template-columns: ${p => (p.shipped ? '1fr' : 'repeat(4, 1fr)')};
  gap: 0 1rem;
  p {
    padding: 0.375rem 0.75rem;
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: 0.875rem;
    font-weight: 500;
    color: #5e5e66;
    border: 1px solid #d4d4d8;
    border-radius: 0.25rem;
    &.all-items-shipped-or-canceled,
    &.all-items-shipped,
    &.all-items-canceled {
      width: 100%;
      text-align: center;
      display: flex;
      justify-content: center;
      align-items: center;
      gap: 0 0.375rem;
      color: #000;
      border-color: rgba(0, 0, 0, 0.15);
      box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05);
      .icon {
        height: 1.0625rem;
        width: 1.0625rem;
      }
    }
    &.all-items-shipped-or-canceled,
    &.all-items-shipped,
    &.all-items-canceled {
      background-color: var(--shipped-background);
      .icon {
        color: #077154;
      }
    }
    &.active {
      color: #000;
      border-color: rgba(0, 0, 0, 0.15);
      .dot {
        border-color: rgba(0, 0, 0, 0.6);
      }
      &.unfulfilled {
        background-color: #f8e3e3;
        .dot {
          background-color: #a32626;
        }
      }
      &.fulfilled {
        background-color: #f8f3de;
        .dot {
          background-color: #b29625;
        }
      }
      &.shipped {
        background-color: #e6faf2;
        .dot {
          background-color: #21986c;
        }
      }
      &.canceled {
        background-color: #ecf1fb;
        .dot {
          background-color: #224fb3;
        }
      }
    }
    .dot {
      margin-right: 0.375rem;
      display: inline-block;
      height: 0.625rem;
      width: 0.625rem;
      border-radius: 9999px;
      background-color: #d4d4d8;
      border: 1px solid rgba(0, 0, 0, 0.5);
    }
  }
`;
