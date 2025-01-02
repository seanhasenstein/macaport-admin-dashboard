import React from 'react';
import Link from 'next/link';
import styled from 'styled-components';
import { format } from 'date-fns';

import { StoreSearchResult as StoreSearchResultType } from '../../interfaces';
import { getStoreStatus } from '../../utils';

type Props = StoreSearchResultType;

export default function StoreSearchResult(props: Props) {
  const openDateCopy = format(
    new Date(props.openDate),
    "MMM. d, yyyy 'at' K:mmaaa"
  );
  const closeDateCopy =
    props.closeDate && !props.permanentlyOpen
      ? format(new Date(props.closeDate), "MMM. d, yyyy 'at' K:mmaaa")
      : 'Permanently open';
  const storeStatus = getStoreStatus(props.openDate, props.closeDate);

  return (
    <StoreSearchResultStyles>
      <Link href={`/stores/${props._id}`}>
        <a>
          <div className="store-details">
            <p className="store-name">{props.name}</p>
            <div className="store-totals">
              <p className="products">Products: {props.productsCount}</p>
              <p className="orders">Orders: {props.ordersCount}</p>
            </div>
          </div>
          <div className="store-status-container">
            <div className="store-dates">
              <p className="open-close-dates">
                <span>{openDateCopy}</span>-<span>{closeDateCopy}</span>
              </p>
            </div>
            <div className={`store-status ${storeStatus}`}>
              <span className="dot" />
              <span>
                Store{' '}
                {storeStatus === 'upcoming'
                  ? 'Upcoming'
                  : storeStatus === 'open'
                  ? 'Open'
                  : 'Closed'}
              </span>
            </div>
          </div>
        </a>
      </Link>
    </StoreSearchResultStyles>
  );
}

const StoreSearchResultStyles = styled.li`
  margin: 0;
  padding: 0;
  border-bottom: 1px solid #e5e7eb;
  &:last-of-type {
    border-bottom: none;
  }
  a {
    padding: 0.75rem 1rem;
    display: grid;
    grid-template-columns: 1fr 17.5rem;
    align-items: center;
    transition: background-color 0.2s ease;
    &:hover {
      background-color: #fafafa;
    }
    .store-details {
      padding-right: 1rem;
      .store-name {
        margin: 0;
        font-size: 0.75rem;
        font-weight: 600;
        color: #111827;
      }
      .store-totals {
        margin: 0.375rem 0 0;
        display: flex;
        .products,
        .orders {
          margin: 0;
          font-size: 0.6875rem;
          font-weight: 500;
          color: #6b7280;
        }
        .products {
          padding-right: 0.625rem;
          border-right: 1px solid #e5e7eb;
        }
        .orders {
          padding-left: 0.625rem;
        }
      }
    }
    .store-status-container {
      .store-dates {
        display: flex;
        align-items: center;
        justify-content: flex-end;
        gap: 0.1875rem;
        text-align: right;
        .open-close-dates {
          margin: 0;
          font-size: 0.6875rem;
          font-weight: 400;
          color: #1f2937;
          span {
            margin-right: 0.3125rem;
            margin-left: 0.3125rem;
          }
        }
      }
      .store-status {
        margin: 0.375rem 0 0;
        height: 1.25rem;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 0 0.4375rem;
        border: 1px solid rgba(0, 0, 0, 0.1);
        border-radius: 0.25rem;
        font-size: 0.5625rem;
        font-weight: 600;
        color: #4b5563;
        text-transform: uppercase;
        letter-spacing: 0.1em;
        .dot {
          height: 0.4375rem;
          width: 0.4375rem;
          border-radius: 50%;
          border: 1px solid rgba(0, 0, 0, 0.3);
        }
        &.upcoming {
          background-color: #fefce8;
          color: #a16207;
          .dot {
            background-color: #eab308;
          }
        }
        &.open {
          background-color: #ecfdf5;
          color: #065f46;
          .dot {
            background-color: #059669;
          }
        }
        &.closed {
          background-color: #fcf3f3;
          color: #631717;
          .dot {
            background-color: #a32626;
          }
        }
      }
    }
  }
`;
