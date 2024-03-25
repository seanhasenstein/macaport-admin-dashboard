import React from 'react';
import Link from 'next/link';
import styled from 'styled-components';
import { format } from 'date-fns';
import classNames from 'classnames';

import Notification from '../Notification';
import StoreStatus from './StoreStatus';
import Table from '../common/Table';

import { getStoreStatus } from '../../utils';

import { StoresTableStore } from '../../interfaces';

function TdLink({
  children,
  storeId,
}: {
  children: React.ReactNode;
  storeId: string;
}) {
  return (
    <Link href={`/stores/${storeId}`}>
      <a className="td-store-link">{children}</a>
    </Link>
  );
}

type Props = {
  stores: StoresTableStore[];
  tableLabel?: string;
};

export default function StoresTable({ stores, tableLabel }: Props) {
  return (
    <StoresTableStyles>
      {tableLabel ? <h2 className="table-label">{tableLabel}</h2> : null}
      <Table customClass="custom-table-class">
        <table>
          <thead>
            <tr>
              {stores.length < 1 ? (
                <th>Store Results</th>
              ) : (
                <>
                  <th>Store details</th>
                  <th className="text-center">Products</th>
                  <th className="text-center">Orders</th>
                  <th className="text-center">
                    <span title="Unfulfilled">U</span>
                  </th>
                  <th className="text-center">
                    <span title="Printed">P</span>
                  </th>
                  <th className="text-center">
                    <span title="Fulfilled">F</span>
                  </th>
                  <th className="text-center">
                    <span title="Partially shipped">PS</span>
                  </th>
                  <th className="text-center">
                    <span title="Shipped">S</span>
                  </th>
                  <th className="text-center">
                    <span title="Canceled">C</span>
                  </th>
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
            {stores.map(s => {
              const hasUnfulfilled =
                s.ordersStatusTotals.unfulfilled > 0 ? 'hasUnfulfilled' : '';
              const hasPrinted =
                s.ordersStatusTotals.printed > 0 ? 'hasPrinted' : '';
              const hasFulfilled =
                s.ordersStatusTotals.fulfilled > 0 ? 'hasFulfilled' : '';
              const hasPartiallyShipped =
                s.ordersStatusTotals.partiallyShipped > 0
                  ? 'hasPartiallyShipped'
                  : '';
              const allShipped =
                s.ordersStatusTotals.shipped + s.ordersStatusTotals.canceled ===
                s.ordersStatusTotals.total
                  ? 'allShipped'
                  : '';

              const storeStatus = getStoreStatus(s.openDate, s.closeDate);
              const isPermanentlyOpen = storeStatus === 'open' && !s.closeDate;

              return (
                <tr key={s._id}>
                  <td>
                    <TdLink storeId={s._id}>
                      <div className="store-details">
                        <div className="store-status">
                          <StoreStatus
                            openDate={s.openDate}
                            closeDate={s.closeDate}
                            customClass="custom-store-status"
                          />
                        </div>
                        <div>
                          <div className="store-name">{s.name}</div>
                          <div className="store-dates">
                            <div>
                              {isPermanentlyOpen ? (
                                'Permanently open'
                              ) : (
                                <>
                                  {format(
                                    new Date(s.openDate),
                                    'M/d/yy h:mmaa'
                                  )}{' '}
                                  -{' '}
                                  {s.closeDate
                                    ? format(
                                        new Date(s.closeDate),
                                        'M/d/yy h:mmaa'
                                      )
                                    : 'Perm. open'}
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </TdLink>
                  </td>
                  <td className="text-center">{s.products}</td>
                  <td className="text-center">{s.orders.length}</td>
                  <td className={classNames('notify-td', hasUnfulfilled)}>
                    <TdLink storeId={s._id}>
                      <span>{s.ordersStatusTotals.unfulfilled}</span>
                    </TdLink>
                  </td>
                  <td className={classNames('notify-td', hasPrinted)}>
                    <TdLink storeId={s._id}>
                      <span>{s.ordersStatusTotals.printed}</span>
                    </TdLink>
                  </td>
                  <td className={classNames('notify-td', hasFulfilled)}>
                    <TdLink storeId={s._id}>
                      <span>{s.ordersStatusTotals.fulfilled}</span>
                    </TdLink>
                  </td>
                  <td className={classNames('notify-td', hasPartiallyShipped)}>
                    <TdLink storeId={s._id}>
                      <span>{s.ordersStatusTotals.partiallyShipped}</span>
                    </TdLink>
                  </td>
                  <td className={classNames('notify-td', allShipped)}>
                    <TdLink storeId={s._id}>
                      <span>{s.ordersStatusTotals.shipped}</span>
                    </TdLink>
                  </td>
                  <td className={classNames('notify-td')}>
                    <TdLink storeId={s._id}>
                      <span>{s.ordersStatusTotals.canceled}</span>
                    </TdLink>
                  </td>
                </tr>
              );
            })}
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
  .custom-table-class {
    width: fit-content;

    table {
      max-width: 800px;
      width: 100%;
    }

    th {
      cursor: default;

      &:first-of-type {
        padding-left: 2.75rem;
      }

      &:last-of-type {
        padding-right: 1.5rem;
      }
    }

    td {
      padding: 0;

      &:first-of-type {
        .td-store-link {
          padding-left: 1.25rem;
          padding-right: 1.5rem;
        }
      }

      &:last-of-type {
        .td-store-link {
          padding-left: 1rem;
          padding-right: 1.5rem;
        }
      }
    }
  }

  .table-label {
    margin: 0 0 1.75rem;
    font-size: 1.25rem;
    font-weight: 600;
    color: #111827;
  }

  .td-store-link {
    display: block;
    padding-top: 0.75rem;
    padding-bottom: 0.75rem;
    &:hover {
      text-decoration: none;
    }
  }

  .store-details {
    display: flex;
    align-items: center;
  }

  .store-status {
    margin: 0 0.875rem 0 0;
    .custom-store-status {
      height: 0.875rem;
      width: 0.875rem;
      .dot {
        height: 0.4375rem;
        width: 0.4375rem;
      }
    }
  }

  .store-name {
    margin: 0 0 0.3125rem;
    display: block;
    max-width: 14rem;
    font-size: 0.75rem;
    font-weight: 600;
    color: #000;
  }

  .store-dates {
    margin: 0.25rem 0 0;
    display: flex;
    flex-direction: column;
    gap: 0.25rem 0;
    font-size: 0.75rem;
    color: #525252;
  }

  td.store-actions {
    position: relative;
    padding-left: 0;
    padding-right: 0.625rem;
  }

  .notify-td {
    span {
      width: 100%;
      display: block;
      text-align: center;
    }
  }

  .hasUnfulfilled,
  .hasPrinted,
  .hasFulfilled,
  .hasPartiallyShipped,
  .allShipped,
  .warning {
    border: 1px solid rgba(0, 0, 0, 0.1);
  }

  .hasUnfulfilled,
  .warning {
    background-color: #fee2e2;
    color: #5f1616;
  }

  .hasPrinted {
    background-color: #ffedd5;
    color: #5a210d;
  }

  .hasFulfilled {
    background-color: #fef9c3;
    color: #4f2c0d;
  }

  .hasPartiallyShipped {
    background-color: #fae8ff;
    color: #86198f;
  }

  .allShipped {
    background-color: #d1fae5;
    color: #032a1f;
  }
`;
