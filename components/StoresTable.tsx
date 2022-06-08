import React from 'react';
import Link from 'next/link';
import styled from 'styled-components';
import { format } from 'date-fns';
import { Store } from '../interfaces';
import { getStoreStatus } from '../utils';
import StoresTableMenu from './StoresTableMenu';
import Notification from './Notification';

type Props = {
  stores: Store[];
};

export default function StoresTable({ stores }: Props) {
  return (
    <StoresTableStyles>
      <div className="table-container">
        <table>
          <thead>
            <tr>
              {stores.length < 1 ? (
                <th>Store Results</th>
              ) : (
                <>
                  <th className="status">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M5.05 3.636a1 1 0 010 1.414 7 7 0 000 9.9 1 1 0 11-1.414 1.414 9 9 0 010-12.728 1 1 0 011.414 0zm9.9 0a1 1 0 011.414 0 9 9 0 010 12.728 1 1 0 11-1.414-1.414 7 7 0 000-9.9 1 1 0 010-1.414zM7.879 6.464a1 1 0 010 1.414 3 3 0 000 4.243 1 1 0 11-1.415 1.414 5 5 0 010-7.07 1 1 0 011.415 0zm4.242 0a1 1 0 011.415 0 5 5 0 010 7.072 1 1 0 01-1.415-1.415 3 3 0 000-4.242 1 1 0 010-1.415zM10 9a1 1 0 011 1v.01a1 1 0 11-2 0V10a1 1 0 011-1z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </th>
                  <th>Store Name</th>
                  <th>Open Date</th>
                  <th>Close Date</th>
                  <th className="text-center">Products</th>
                  <th className="text-center">Orders</th>
                  <th className="text-center">Unfulfilled</th>
                  <th />
                </>
              )}
            </tr>
          </thead>
          <tbody>
            {stores.length < 1 && (
              <tr>
                <td>0 stores match your filter settings</td>
              </tr>
            )}
            {stores.map(s => (
              <tr key={s._id}>
                <td className="store-status">
                  {getStoreStatus(s.openDate, s.closeDate) === 'upcoming' && (
                    <span className="upcoming-store">
                      <span className="dot" />
                    </span>
                  )}
                  {getStoreStatus(s.openDate, s.closeDate) === 'open' && (
                    <span className="open-store">
                      <span className="dot" />
                    </span>
                  )}
                  {getStoreStatus(s.openDate, s.closeDate) === 'closed' && (
                    <span className="closed-store">
                      <span className="dot" />
                    </span>
                  )}
                </td>
                <td>
                  <Link href={`/stores/${s._id}`}>
                    <a>
                      <div className="store-name">{s.name}</div>
                      <div className="store-id">{s.storeId}</div>
                    </a>
                  </Link>
                </td>
                <td className="store-date">
                  {format(new Date(s.openDate), "MMM. dd, yyyy 'at' h:mmaa")}
                </td>
                <td className="store-date">
                  {' '}
                  {s.closeDate
                    ? format(new Date(s.closeDate), "MMM. dd, yyyy 'at' h:mmaa")
                    : 'Permanently Open'}
                </td>
                <td className="text-center store-products">
                  {s.products ? s.products.length : 0}
                </td>
                <td className="text-center store-orders">
                  {s.orders ? s.orders.length : 0}
                </td>
                <td className="text-center store-orders">
                  {s.orders
                    ? s.orders.filter(o => o.orderStatus === 'Unfulfilled')
                        .length
                    : 0}
                </td>
                <td className="store-actions">
                  <StoresTableMenu
                    storeId={s._id}
                    openDate={s.openDate}
                    closeDate={s.closeDate}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Notification
        query="deleteStore"
        heading="Store deleted successfully"
        callbackUrl="/"
      />
    </StoresTableStyles>
  );
}

const StoresTableStyles = styled.div`
  .table-container {
    width: 100%;
    background-color: #fff;
    border-width: 1px 1px 0 1px;
    border-style: solid;
    border-color: #e5e7eb;
    border-radius: 0.25rem;
    box-shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1);
  }

  table {
    width: 100%;
    border-collapse: collapse;
  }

  th,
  td {
    border-bottom: 1px solid #e5e7eb;

    &:first-of-type {
      padding-left: 2rem;
    }

    &:last-of-type {
      padding-right: 2rem;
    }
  }

  tr:last-of-type td {
    border-bottom: none;
  }

  th {
    padding: 0.625rem 1rem;
    background-color: #f3f4f6;
    font-size: 0.75rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.0375em;
    color: #4b5563;

    &.status svg {
      height: 1.25rem;
      width: 1.25rem;
      color: #9ca3af;
    }
  }

  tr {
    &:first-of-type {
      th:first-of-type {
        border-radius: 0.25rem 0 0 0;
      }
      th:last-of-type {
        border-radius: 0 0.25rem 0 0;
      }
    }
  }

  td {
    padding: 1rem 1rem;
    font-size: 0.875rem;
    font-weight: 500;
    color: #374151;

    a {
      &:hover .store-name {
        text-decoration: underline;
      }

      &:focus {
        outline: 2px solid transparent;
        outline-offset: 2px;
      }

      &:focus-visible .store-name {
        text-decoration: underline;
        color: #1c44b9;
      }
    }

    .store-name {
      margin: 0 0 0.1875rem;
      font-size: 0.875rem;
      font-weight: 500;
      color: #000;
    }

    .store-id {
      font-family: 'Dank Mono', 'Menlo', monospace;
      font-size: 0.875rem;
      font-weight: 700;
      color: #6b7280;
    }

    &.store-actions {
      position: relative;
    }
  }

  .upcoming-store,
  .open-store,
  .closed-store {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 1rem;
    width: 1rem;
    border-radius: 9999px;

    .dot {
      height: 0.5rem;
      width: 0.5rem;
      border-radius: 9999px;
    }
  }

  .upcoming-store {
    background-color: #fef3c7;

    .dot {
      background-color: #fbbf24;
    }
  }

  .open-store {
    background-color: #d1fae5;

    .dot {
      background-color: #34d399;
    }
  }

  .closed-store {
    background-color: #fee2e2;

    .dot {
      background-color: #f87171;
    }
  }
`;
