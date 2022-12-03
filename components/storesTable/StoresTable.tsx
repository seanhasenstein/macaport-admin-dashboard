import React from 'react';
import Link from 'next/link';
import styled from 'styled-components';
import { format } from 'date-fns';
import { StoresTableStore } from '../../interfaces';
import StoresTableMenu from './StoresTableMenu';
import Notification from '../Notification';
import StoreStatus from './StoreStatus';
import Table from '../common/Table';

type Props = {
  stores: StoresTableStore[];
  tableLabel?: string;
};

export default function StoresTable({ stores, tableLabel }: Props) {
  return (
    <StoresTableStyles>
      {tableLabel ? <h2 className="table-label">{tableLabel}</h2> : null}
      <Table>
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
                  <th>Open &amp; Close Dates</th>
                  <th className="text-center">Products</th>
                  <th className="text-center">Orders</th>
                  <th className="text-center">UNFL</th>
                  <th className="text-center">PRNT</th>
                  <th className="text-center">FULL</th>
                  <th className="text-center">COMP</th>
                  <th className="text-center">CANC</th>
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
                <td>
                  <StoreStatus openDate={s.openDate} closeDate={s.closeDate} />
                </td>
                <td>
                  <div className="store-name">
                    <Link href={`/stores/${s._id}`}>
                      <a>{s.name}</a>
                    </Link>
                  </div>
                  <div className="store-id">{s.storeId}</div>
                </td>
                <td>
                  <div className="store-dates">
                    <div>
                      {format(new Date(s.openDate), "M/d/yy 'at' h:mmaa")}
                    </div>
                    <div>
                      {s.closeDate
                        ? format(new Date(s.closeDate), "M/d/yy 'at' h:mmaa")
                        : 'Permanently Open'}
                    </div>
                  </div>
                </td>
                <td className="text-center">{s.products}</td>
                <td className="text-center">{s.orders.total}</td>
                <td className="text-center">{s.orders.unfulfilled}</td>
                <td className="text-center">{s.orders.printed}</td>
                <td className="text-center">{s.orders.fulfilled}</td>
                <td className="text-center">{s.orders.completed}</td>
                <td className="text-center">{s.orders.canceled}</td>
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
      </Table>
      <Notification
        query="deleteStore"
        heading="Store deleted successfully"
        callbackUrl="/"
      />
    </StoresTableStyles>
  );
}

const StoresTableStyles = styled.div`
  .table-label {
    margin: 0 0 1.75rem;
    font-size: 1.25rem;
    font-weight: 600;
    color: #111827;
  }

  .store-name {
    margin: 0 0 0.3125rem;
    font-size: 0.875rem;
    font-weight: 500;
    color: #000;
  }

  .store-dates {
    display: flex;
    flex-direction: column;
    gap: 0.625rem;
  }

  .store-id {
    font-family: 'Dank Mono', 'Menlo', monospace;
    font-weight: 700;
    color: #6b7280;
  }

  td.store-actions {
    position: relative;
  }
`;
