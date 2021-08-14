import React from 'react';
import Link from 'next/link';
import { useQuery } from 'react-query';
import styled from 'styled-components';
import { Store } from '../interfaces';
import { getStoreStatus } from '../utils';
import StoresTableMenu from './StoresTableMenu';

export default function StoresTable() {
  const [currentActiveId, setCurrentActiveId] = React.useState<
    string | undefined
  >(undefined);

  const storesQuery = useQuery<Store[]>(
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
      staleTime: 600000,
    }
  );

  storesQuery.isLoading && <div />;
  storesQuery.isError && storesQuery.error instanceof Error && (
    <div>Error: {storesQuery.error.message}</div>
  );
  return (
    <StoresTableStyles>
      {storesQuery.data && (
        <>
          <h3>Stores for macaport.com</h3>
          <div className="stores section">
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
                  {storesQuery.data.map(s => (
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
                        <StoresTableMenu
                          storeId={s._id}
                          currentActiveId={currentActiveId}
                          setCurrentActiveId={setCurrentActiveId}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </StoresTableStyles>
  );
}

const StoresTableStyles = styled.div`
  h3 {
    margin: 0;
    font-weight: 600;
    color: #111827;
  }

  .section {
    margin: 0 0 4rem;
  }

  .table-container {
    margin: 2rem 0 0;
    width: 100%;
    border: 1px solid #e5e7eb;
    border-radius: 0.375rem;
    box-shadow: rgba(0, 0, 0, 0) 0px 0px 0px 0px,
      rgba(0, 0, 0, 0) 0px 0px 0px 0px, rgba(0, 0, 0, 0.05) 0px 1px 2px 0px;
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
    padding: 0.875rem 1rem;
    background-color: #f3f4f6;
    font-size: 0.75rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.0375em;
    color: #6b7280;
    text-align: left;

    &:first-of-type {
      border-top-left-radius: 0.375rem;
    }

    &:last-of-type {
      border-top-right-radius: 0.375rem;
    }

    &.status svg {
      height: 1.25rem;
      width: 1.25rem;
      color: #9ca3af;
    }
  }

  td {
    padding: 1.125rem 1rem;
    font-size: 0.875rem;
    font-weight: 500;
    color: #1f2937;

    &.store-name {
      padding-left: 0.5rem;
      font-size: 0.875rem;
      font-weight: 500;
      color: #111827;
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
`;
