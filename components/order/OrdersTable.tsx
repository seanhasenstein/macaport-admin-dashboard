import React from 'react';
import Link from 'next/link';
import styled from 'styled-components';
import { format } from 'date-fns';

import { OrderStatus, StoreWithOrderStatusTotals } from '../../interfaces';
import { calculateTotalItems, formatToMoney } from '../../utils';

import OrdersTableMenu from './OrdersTableMenu';
import OrderStatusButton from './OrderStatusButton';
import Table from '../common/Table';

type OrderViewOptions = OrderStatus | 'All';

type Props = {
  store: StoreWithOrderStatusTotals;
};

interface OrderFilterItem {
  id: number;
  option: OrderViewOptions;
}

const orderFilterItems: OrderFilterItem[] = [
  { id: 1, option: 'All' },
  { id: 2, option: 'Unfulfilled' },
  { id: 3, option: 'Printed' },
  { id: 4, option: 'Fulfilled' },
  { id: 5, option: 'Completed' },
  { id: 6, option: 'Canceled' },
];

export default function OrdersTable({ store }: Props) {
  const [orderViewOption, setOrderViewOption] =
    React.useState<OrderViewOptions>('All');
  const [filteredOrders, setFilteredOrders] = React.useState(store.orders);

  React.useEffect(() => {
    if (orderViewOption === 'All') {
      setFilteredOrders(store.orders);
      return;
    }
    const updatedFilteredOrders = store.orders.filter(
      o => o.orderStatus === orderViewOption
    );
    setFilteredOrders(updatedFilteredOrders);
  }, [orderViewOption, store.orders]);

  return (
    <OrdersTableStyles>
      {store.orders && (
        <div>
          <div className="buttons">
            <div className="container">
              {orderFilterItems.map(item => (
                <button
                  key={item.id}
                  type="button"
                  className={orderViewOption === item.option ? 'active' : ''}
                  onClick={() => setOrderViewOption(item.option)}
                >
                  {item.option}{' '}
                  <span className="status-total">
                    {store.orderStatusTotals[item.option]}
                  </span>
                </button>
              ))}
            </div>
          </div>
          <Table>
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Customer</th>
                  {store.requireGroupSelection && <th>{store.groupTerm}</th>}
                  <th>Shipping</th>
                  <th className="text-center">Unique / Total Items</th>
                  <th className="text-right">Total</th>
                  <th className="text-center">Order Status</th>
                  <th />
                  <th />
                </tr>
              </thead>
              <tbody>
                {filteredOrders.length === 0 ? (
                  <tr>
                    <td className="empty">
                      There are no{' '}
                      {orderViewOption !== 'All' &&
                        orderViewOption.toLowerCase()}{' '}
                      orders
                    </td>
                  </tr>
                ) : (
                  <>
                    {filteredOrders.map(o => (
                      <tr key={o.orderId}>
                        <td>
                          {format(new Date(o.createdAt), 'MM/dd/yyyy h:mmaa')}
                        </td>
                        <td>
                          <div className="customer-name">
                            <Link
                              href={`/orders/${o.orderId}?sid=${store._id}`}
                            >
                              <a>
                                {o.customer.firstName} {o.customer.lastName}
                              </a>
                            </Link>
                          </div>
                          <div className="order-id">#{o.orderId}</div>
                        </td>
                        {store.requireGroupSelection && <td>{o.group}</td>}
                        <td>{o.shippingMethod}</td>
                        <td className="text-center total-items">
                          {o.orderStatus === 'Canceled' ? 0 : o.items.length} /{' '}
                          {o.orderStatus === 'Canceled'
                            ? 0
                            : calculateTotalItems(o.items)}
                        </td>
                        <td className="text-right">
                          {formatToMoney(o.summary.total, true)}
                        </td>
                        <td className="text-center">
                          <OrderStatusButton store={store} order={o} />
                        </td>
                        <td className="note">
                          {o.note ? (
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              viewBox="0 0 20 20"
                              fill="currentColor"
                            >
                              <path
                                fillRule="evenodd"
                                d="M3.43 2.524A41.29 41.29 0 0110 2c2.236 0 4.43.18 6.57.524 1.437.231 2.43 1.49 2.43 2.902v5.148c0 1.413-.993 2.67-2.43 2.902a41.202 41.202 0 01-5.183.501.78.78 0 00-.528.224l-3.579 3.58A.75.75 0 016 17.25v-3.443a41.033 41.033 0 01-2.57-.33C1.993 13.244 1 11.986 1 10.573V5.426c0-1.413.993-2.67 2.43-2.902z"
                                clipRule="evenodd"
                              />
                            </svg>
                          ) : null}
                        </td>
                        <td className="order-actions">
                          <OrdersTableMenu store={store} order={o} />
                        </td>
                      </tr>
                    ))}
                  </>
                )}
              </tbody>
            </table>
          </Table>
        </div>
      )}
    </OrdersTableStyles>
  );
}

const OrdersTableStyles = styled.div`
  .buttons {
    margin: 0 0 1.125rem;
    display: inline-flex;

    .container {
      padding: 0.1875rem;
      display: inline-flex;
      background-color: #e8eaee;
      border: 1px solid #d1d5db;
      border-radius: 0.375rem;
      box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05);
    }

    button {
      padding: 0.625rem 1.25rem;
      display: flex;
      justify-content: center;
      align-items: center;
      gap: 0.375rem;
      background-color: transparent;
      border: 1px solid transparent;
      font-size: 0.875rem;
      font-weight: 500;
      color: #1f2937;
      border-radius: 0.375rem;
      cursor: pointer;

      .status-total {
        display: inline-flex;
        justify-content: center;
        align-items: center;
        height: 1.25rem;
        width: 1.25rem;
        background-color: #d1d5dd;
        font-size: 0.625rem;
        font-weight: 600;
        border-radius: 9999px;
        color: #323843;
      }

      &:hover {
        color: #1f2937;
      }

      &.active {
        background-color: #fff;
        border-color: #c6cbd2;
        color: #1f2937;
        box-shadow: rgba(0, 0, 0, 0) 0px 0px 0px 0px,
          rgba(0, 0, 0, 0) 0px 0px 0px 0px, rgba(0, 0, 0, 0.05) 0px 1px 2px 0px;
      }

      &:not(:first-of-type, :last-of-type) {
        margin: 0 0.5rem;
      }
    }
  }

  td {
    &.empty {
      padding: 1.25rem 2rem;
      color: #1f2937;
      font-size: 0.9375rem;
    }

    &.note {
      svg {
        height: 0.875rem;
        width: 0.875rem;
        color: #374151;
      }
    }
  }

  .customer-name {
    margin: 0 0 0.125rem;
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
        color: #1c44b9;
        text-decoration: underline;
      }
    }
  }

  .order-id {
    font-family: 'Dank Mono', 'Menlo', monospace;
    font-size: 0.875rem;
    font-weight: 700;
    color: #6b7280;
  }

  .order-actions {
    padding-left: 0;
    position: relative;
  }
`;
