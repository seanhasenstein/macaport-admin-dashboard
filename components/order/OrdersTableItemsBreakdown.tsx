import React from 'react';
import styled from 'styled-components';
import classNames from 'classnames';
import { CheckCircleIcon } from '@heroicons/react/20/solid';

import { getOrderItemsStatusTotals } from '../../utils/orderItem';

import { OrderItem } from '../../interfaces';

type Props = {
  orderItems: OrderItem[];
};

export default function OrdersTableItemsBreakdown({ orderItems }: Props) {
  const {
    Unfulfilled: unfulfilledTotal,
    Fulfilled: fulfilledTotal,
    Backordered: backorderedTotal,
    Shipped: shippedTotal,
    Canceled: canceledTotal,
  } = getOrderItemsStatusTotals(orderItems);

  const allItemsAreShipped = shippedTotal === orderItems.length;
  const allItemsAreCanceled = canceledTotal === orderItems.length;
  const allItemsShippedOrCanceled =
    shippedTotal + canceledTotal === orderItems.length;

  return (
    <OrderTableItemsBreakdownStyles
      className={classNames({
        'all-shipped-canceled':
          allItemsAreShipped ||
          allItemsAreCanceled ||
          allItemsShippedOrCanceled,
      })}
    >
      {allItemsAreShipped && (
        <div
          className={classNames('status-item', 'shipped', {
            active: shippedTotal > 0,
          })}
        >
          <CheckCircleIcon className="circle-check-icon" />
          <p>All shipped</p>
        </div>
      )}
      {allItemsAreCanceled && (
        <div
          className={classNames('status-item', 'canceled', 'all-canceled', {
            active: canceledTotal > 0,
          })}
        >
          <CheckCircleIcon className="circle-check-icon" />
          <p>All canceled</p>
        </div>
      )}
      {allItemsShippedOrCanceled &&
        !allItemsAreShipped &&
        !allItemsAreCanceled && (
          <div
            className={classNames(
              'status-item',
              'shipped',
              'all-shipped-canceled',
              {
                active: shippedTotal > 0,
              }
            )}
          >
            <CheckCircleIcon className="circle-check-icon" />
            <p>
              All shipped <br /> or canceled
            </p>
          </div>
        )}
      {!allItemsShippedOrCanceled &&
        !allItemsAreShipped &&
        !allItemsAreCanceled && (
          <>
            {unfulfilledTotal > 0 && (
              <div
                className={classNames('status-item', 'unfulfilled', {
                  active: unfulfilledTotal > 0,
                })}
              >
                <div className="label-info">
                  <span className="dot" />
                  <p className="label">Unfulfilled:</p>
                </div>
                <p>{unfulfilledTotal}</p>
              </div>
            )}
            {backorderedTotal > 0 && (
              <div
                className={classNames('status-item', 'backordered', {
                  active: backorderedTotal > 0,
                })}
              >
                <div className="label-info">
                  <span className="dot" />
                  <p className="label">Backordered:</p>
                </div>
                <p>{backorderedTotal}</p>
              </div>
            )}
            {fulfilledTotal > 0 && (
              <div
                className={classNames('status-item', 'fulfilled', {
                  active: fulfilledTotal > 0,
                })}
              >
                <div className="label-info">
                  <span className="dot" />
                  <p className="label">Fulfilled:</p>
                </div>
                <p>{fulfilledTotal}</p>
              </div>
            )}
            {shippedTotal > 0 && (
              <div
                className={classNames('status-item', 'shipped', {
                  active: shippedTotal > 0,
                })}
              >
                <div className="label-info">
                  <span className="dot" />
                  <p className="label">Shipped:</p>
                </div>
                <p>{shippedTotal}</p>
              </div>
            )}
            {canceledTotal > 0 && (
              <div
                className={classNames('status-item', 'canceled', {
                  active: canceledTotal > 0,
                })}
              >
                <div className="label-info">
                  <span className="dot" />
                  <p className="label">Canceled:</p>
                </div>
                <p>{canceledTotal}</p>
              </div>
            )}
          </>
        )}
    </OrderTableItemsBreakdownStyles>
  );
}

const OrderTableItemsBreakdownStyles = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  background-color: #fff;
  border: 1px solid #d4d4d8;
  border-radius: 0.25rem;
  box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05);
  &.all-shipped-canceled {
    border: none;
    background-color: transparent;
    box-shadow: none;
    .status-item {
      justify-content: center;
      padding-left: 0;
      padding-right: 0;
      border: none;
      p {
        color: #000;
        line-height: 130%;
      }
      .circle-check-icon {
        margin-right: 0.3125rem;
        height: 0.9375rem;
        width: 0.9375rem;
      }
    }
  }
  &.all-shipped-canceled {
    .status-item {
      .circle-check-icon {
        color: #077154;
      }
    }
  }
  .status-item {
    padding: 0.15625rem 0.4375rem 0.15625rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 1px solid #d4d4d8;
    &:first-of-type {
      border-top-left-radius: 0.25rem;
      border-top-right-radius: 0.25rem;
    }
    &:last-of-type {
      border-bottom: none;
      border-bottom-right-radius: 0.25rem;
      border-bottom-left-radius: 0.25rem;
    }
    &.unfulfilled {
      .dot {
        background-color: #a32626;
      }
    }
    &.backordered {
      background-color: #f9e7fb;
      .dot {
        background-color: #86198f;
      }
    }
    &.fulfilled {
      .dot {
        background-color: #b29625;
      }
    }
    &.shipped {
      .dot {
        background-color: #21986c;
      }
    }
    &.canceled {
      .dot {
        background-color: #224fb3;
      }
    }
    .label-info {
      display: flex;
      align-items: center;
    }
    .dot {
      flex-shrink: 0;
      margin-right: 0.375rem;
      height: 0.4375rem;
      width: 0.4375rem;
      border-radius: 9999px;
      background-color: #27272a;
      border: 1px solid rgba(0, 0, 0, 0.75);
      opacity: 0.75;
    }
    p {
      margin: 0;
      font-size: 0.625rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.1em;
      text-align: left;
      color: #52525b;

      &.label {
        margin-right: 0.5rem;
        width: 5.125rem;
      }
    }
  }
`;
