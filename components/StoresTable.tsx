import React from 'react';
import Link from 'next/link';
import { useQuery } from 'react-query';
import styled from 'styled-components';
import { Store } from '../interfaces';
import { getStoreStatus } from '../utils';
import StoresTableMenu from './StoresTableMenu';
import LoadingSpinner from './LoadingSpinner';
import Notification from './Notification';

export default function StoresTable() {
  const {
    isLoading,
    isFetching,
    isError,
    error,
    data: stores,
  } = useQuery<Store[]>(
    'stores',
    async () => {
      const response = await fetch('/api/stores');

      if (!response.ok) {
        throw new Error('Failed to fetch the stores.');
      }

      const data = await response.json();
      return data.stores;
    },
    {
      staleTime: 1000 * 60 * 10,
    }
  );

  return (
    <StoresTableStyles>
      {isLoading && (
        <StoresLoadingSpinner isLoading={isLoading || isFetching} />
      )}
      {isError && error instanceof Error && <div>Error: {error.message}</div>}
      {stores && (
        <>
          <div className="container">
            <div className="header-row">
              <h2>Stores</h2>
              <Link href="/stores/create">
                <a className="create-store-link">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Create a store
                </a>
              </Link>
            </div>
            <div className="table-container">
              <table>
                <thead>
                  <tr>
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
                    <th />
                  </tr>
                </thead>
                <tbody>
                  {stores.length < 1 && (
                    <tr>
                      <td>
                        There are currently no stores.{' '}
                        <Link href="/stores/create">
                          <a className="no-stores-link">Create a store</a>
                        </Link>
                        .
                      </td>
                    </tr>
                  )}
                  {stores.map(s => (
                    <tr key={s._id}>
                      <td className="store-status">
                        {getStoreStatus(s.openDate, s.closeDate) ===
                          'upcoming' && (
                          <span className="upcoming-store">
                            <span className="dot" />
                          </span>
                        )}
                        {getStoreStatus(s.openDate, s.closeDate) === 'open' && (
                          <span className="open-store">
                            <span className="dot" />
                          </span>
                        )}
                        {getStoreStatus(s.openDate, s.closeDate) ===
                          'closed' && (
                          <span className="closed-store">
                            <span className="dot" />
                          </span>
                        )}
                      </td>
                      <td className="store-name">
                        <Link href={`/stores/${s._id}`}>
                          <a>{s.name}</a>
                        </Link>
                      </td>
                      <td className="store-date">
                        {new Date(s.openDate).toDateString()}
                      </td>
                      <td className="store-date">
                        {' '}
                        {s.closeDate
                          ? new Date(s.closeDate).toDateString()
                          : 'Open Permanently'}
                      </td>
                      <td className="text-center store-products">
                        {s.products ? s.products.length : 0}
                      </td>
                      <td className="text-center store-orders">
                        {s.orders ? s.orders.length : 0}
                      </td>
                      <td className="store-actions">
                        <StoresTableMenu storeId={s._id} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
      <Notification
        query="deleteStore"
        heading="Store deleted successfully"
        callbackUrl="/"
      />
    </StoresTableStyles>
  );
}

const StoresTableStyles = styled.div`
  h2 {
    margin: 0;
    font-size: 1.375rem;
    font-weight: 600;
    color: #111827;
  }

  .container {
    margin: 0 auto;
    padding: 5rem 2rem;
    max-width: 70rem;
    width: 100%;
  }

  .header-row {
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
  }

  .create-store-link {
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: 0.875rem;
    font-weight: 500;
    color: #4338ca;
    line-height: 1;
    cursor: pointer;

    svg {
      margin: 0 0.375rem 0 0;
      height: 0.875rem;
      width: 0.875rem;
    }

    &:hover {
      color: #3730a3;
      text-decoration: underline;
    }

    &:focus {
      outline: 2px solid transparent;
      outline-offset: 2px;
    }

    &:focus-visible {
      text-decoration: underline;
    }
  }

  .table-container {
    margin: 1.25rem 0 0;
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

    &.text-center {
      text-align: center;
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
    text-align: left;

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
    color: #1f2937;

    &.store-name {
      padding-left: 0.5rem;
      font-size: 0.875rem;
      font-weight: 500;
      color: #111827;

      a {
        &:hover {
          text-decoration: underline;
        }

        &:focus {
          outline: 2px solid transparent;
          outline-offset: 2px;
        }

        &:focus-visible {
          text-decoration: underline;
          color: #2c33bb;
        }
      }
    }

    &.store-date,
    &.store-products,
    &.store-orders {
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

  .no-stores-link {
    color: #2563eb;
    text-decoration: underline;

    &:hover {
      color: #1d4ed8;
    }
  }
`;

const StoresLoadingSpinner = styled(LoadingSpinner)`
  position: absolute;
  top: 2rem;
  right: 2rem;
`;
