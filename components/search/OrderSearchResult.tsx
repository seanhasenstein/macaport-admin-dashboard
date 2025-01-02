import React from 'react';
import Link from 'next/link';
import styled from 'styled-components';
import { format } from 'date-fns';

import { formatPhoneNumber, formatToMoney } from '../../utils';

import { OrderSearchResult as OrderSearchResultType } from '../../interfaces';

type Props = OrderSearchResultType;

export default function OrderSearchResult(props: Props) {
  const shippingCopy = {
    Primary: 'Primary shipping',
    Direct: 'Direct shipping',
    'Store Pickup': 'Store pickup',
    None: 'No shipping selected',
  };

  return (
    <OrderSearchResultStyles>
      <Link href={`/stores/${props.store._id}?orderId=${props.id}`}>
        <a>
          <div className="customer-details">
            <p className="name">
              {props.customer.firstName} {props.customer.lastName}
            </p>
            <p className="email" title={props.customer.email}>
              {props.customer.email}
            </p>
            <p className="phone">{formatPhoneNumber(props.customer.phone)}</p>
          </div>
          <div className="order-details">
            <div className="meta-data">
              <p className="order-id">#{props.id}</p>
              <p className="order-date">
                {format(new Date(props.createdAt), "P 'at' K:mmaaa")}
              </p>
              <p className="shipping-method">
                {shippingCopy[props.shippingMethod]}
              </p>
            </div>
            <div className="order-summary">
              <div className="store-name">{props.store.name}</div>
              <div className="items-flex-row">
                <p className="item-totals">
                  {props.totalItems} total items ({props.uniqueItems} unique)
                </p>
                <p className="order-total">
                  Total: {formatToMoney(props.orderTotal, true)}
                </p>
              </div>
              <div className={`order-status ${props.status}`}>
                <span className="dot" />
                <p className="status">
                  {props.status.toLowerCase() === 'partiallyshipped'
                    ? 'Partially Shipped'
                    : props.status}
                </p>
              </div>
            </div>
          </div>
        </a>
      </Link>
    </OrderSearchResultStyles>
  );
}

const OrderSearchResultStyles = styled.li`
  margin: 0;
  padding: 0;
  border-bottom: 1px solid #e5e7eb;
  &:last-of-type {
    border-bottom: none;
  }
  a {
    padding: 0.75rem 1rem;
    display: grid;
    grid-template-columns: 11.5rem 1fr;
    align-items: center;
    transition: background-color 0.2s ease;
    &:hover {
      background-color: #fafafa;
    }
    .customer-details {
      .name {
        margin: 0;
        font-size: 0.75rem;
        font-weight: 600;
        color: #111827;
      }
      .email,
      .phone {
        margin: 0;
        font-size: 0.6875rem;
        font-weight: 400;
        color: #4b5563;
      }
      .email {
        max-width: 10.75rem;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .phone {
        margin-top: 0.1875rem;
      }
    }
    .order-details {
      display: grid;
      grid-template-columns: 7.6875rem 1fr;
      .meta-data {
        .order-id {
          margin: 0;
          font-size: 0.75rem;
          font-weight: 500;
          color: #111827;
        }
        .order-date,
        .shipping-method {
          margin: 0.125rem 0 0;
          font-size: 0.6875rem;
          font-weight: 400;
          color: #4b5563;
        }
        .shipping-method {
          margin-top: 0.1875rem;
        }
      }
    }
    .order-summary {
      padding-left: 1.5rem;
      .store-name {
        margin: 0;
        max-width: 15rem;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        font-size: 0.75rem;
        font-weight: 500;
        color: #111827;
      }
      .items-flex-row {
        display: flex;
        justify-content: space-between;
        align-items: center;
      }
      .item-totals,
      .order-total {
        margin: 0.125rem 0 0;
        font-size: 0.6875rem;
        font-weight: 400;
        color: #4b5563;
      }
      .order-status {
        margin: 0.3125rem 0 0;
        height: 1.25rem;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 0 0.4375rem;
        border: 1px solid rgba(0, 0, 0, 0.1);
        border-radius: 0.25rem;
        .dot {
          height: 0.5rem;
          width: 0.5rem;
          border-radius: 50%;
          border: 1px solid rgba(0, 0, 0, 0.3);
        }
        .status {
          margin: 0;
          font-size: 0.5625rem;
          font-weight: 600;
          color: #4b5563;
          text-transform: uppercase;
          letter-spacing: 0.1em;
        }
        &.Unfulfilled {
          background-color: #fcf3f3;
          .dot {
            background-color: #a32626;
          }
          .status {
            color: #631717;
          }
        }
        &.Fulfilled {
          background-color: #fefce8;
          .dot {
            background-color: #eab308;
          }
          .status {
            color: #a16207;
          }
        }
        &.PartiallyShipped {
          background-color: #fdf4ff;
          .dot {
            background-color: #c026d3;
          }
          .status {
            color: #701a75;
          }
        }
        &.Shipped {
          background-color: #ecfdf5;
          .dot {
            background-color: #059669;
          }
          .status {
            color: #065f46;
          }
        }
        &.Canceled {
          background-color: #f0f9ff;
          .dot {
            background-color: #0369a1;
          }
          .status {
            color: #075985;
          }
        }
      }
    }
  }
`;
