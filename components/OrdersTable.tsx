import React from 'react';
import Link from 'next/link';
import styled from 'styled-components';
import { format } from 'date-fns';
import { calculateTotalItems, formatToMoney } from '../utils';
import { Order, Store } from '../interfaces';
import OrdersTableMenu from './OrdersTableMenu';

type OrderViewOptions = 'All' | 'Unfulfilled' | 'Fulfilled' | 'Completed';

type Props = {
  store: Store;
  orders: Order[];
};

export default function OrdersTable({ store, orders }: Props) {
  const [orderViewOption, setOrderViewOption] =
    React.useState<OrderViewOptions>('All');
  const [filteredOrders, setFilteredOrders] = React.useState(orders);

  React.useEffect(() => {
    if (orderViewOption === 'All') {
      setFilteredOrders(orders);
      return;
    }
    const updatedFilteredOrders = orders.filter(
      o => o.orderStatus === orderViewOption
    );
    setFilteredOrders(updatedFilteredOrders);
  }, [orderViewOption, orders]);

  return (
    <OrdersTableStyles>
      {orders && (
        <div>
          <div className="buttons">
            <div className="container">
              <button
                type="button"
                className={orderViewOption === 'All' ? 'active' : ''}
                onClick={() => setOrderViewOption('All')}
              >
                All Orders
              </button>
              <button
                type="button"
                className={orderViewOption === 'Unfulfilled' ? 'active' : ''}
                onClick={() => setOrderViewOption('Unfulfilled')}
              >
                Unfulfilled Orders
              </button>
              <button
                type="button"
                className={orderViewOption === 'Fulfilled' ? 'active' : ''}
                onClick={() => setOrderViewOption('Fulfilled')}
              >
                Fulfilled Orders
              </button>
              <button
                type="button"
                className={orderViewOption === 'Completed' ? 'active' : ''}
                onClick={() => setOrderViewOption('Completed')}
              >
                Completed Orders
              </button>
            </div>
          </div>
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Customer</th>
                  {store.requireGroupSelection && <th>{store.groupTerm}</th>}
                  <th>Shipping</th>
                  <th className="text-center">Unique Items</th>
                  <th className="text-center">Total Items</th>
                  <th className="text-right">Total</th>
                  <th className="text-center">Order Status</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {filteredOrders.length === 0 ? (
                  <tr>
                    <td className="empty">
                      There are no {orderViewOption.toLowerCase()} orders
                    </td>
                  </tr>
                ) : (
                  <>
                    {filteredOrders.map(o => (
                      <tr key={o.orderId}>
                        <td>{format(new Date(o.createdAt), 'M/d/yy')}</td>
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
                          {o.items.length}
                        </td>
                        <td className="text-center">
                          {calculateTotalItems(o.items)}
                        </td>
                        <td className="text-right">
                          {formatToMoney(o.summary.total, true)}
                        </td>
                        <td className="order-status text-center">
                          <span
                            className={
                              o.orderStatus === 'Completed'
                                ? 'completed'
                                : o.orderStatus === 'Fulfilled'
                                ? 'fulfilled'
                                : o.orderStatus === 'Unfulfilled'
                                ? 'unfulfilled'
                                : ''
                            }
                          >
                            {o.orderStatus}
                          </span>
                        </td>
                        <td className="order-actions">
                          <OrdersTableMenu
                            store={store}
                            order={o}
                            orderStatus={o.orderStatus}
                          />
                        </td>
                      </tr>
                    ))}
                  </>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </OrdersTableStyles>
  );
}

const OrdersTableStyles = styled.div`
  margin: 0 0 5rem;

  .buttons {
    margin: 0 0 1.125rem;
    display: inline-flex;

    .container {
      padding: 0.1875rem;
      display: inline-flex;
      background-color: #f3f4f6;
      border: 1px solid #e5e7eb;
      border-radius: 0.375rem;
    }

    button {
      padding: 0.625rem 1.25rem;
      background-color: transparent;
      border: 1px solid transparent;
      font-size: 0.875rem;
      font-weight: 500;
      color: #6b7280;
      border-radius: 0.375rem;
      cursor: pointer;

      &:hover {
        color: #1f2937;
      }

      &.active {
        background-color: #fff;
        border-color: #e5e7eb;
        color: #1f2937;
        box-shadow: rgba(0, 0, 0, 0) 0px 0px 0px 0px,
          rgba(0, 0, 0, 0) 0px 0px 0px 0px, rgba(0, 0, 0, 0.05) 0px 1px 2px 0px;
      }

      &:not(:first-of-type, :last-of-type) {
        margin: 0 0.5rem;
      }
    }
  }

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

    &.text-center {
      text-align: center;
    }

    &.text-right {
      text-align: right;
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

    &:last-of-type td {
      border-bottom: none;
    }
  }

  th {
    padding: 0.875rem 1rem;
    background-color: #f3f4f6;
    font-size: 0.75rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.0375em;
    color: #4b5563;
    text-align: left;
  }

  td {
    padding: 0.75rem 1rem;
    font-size: 0.875rem;
    font-weight: 500;
    color: #4b5563;

    &.empty {
      padding: 1.25rem 2rem;
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
        color: #2c33bb;
        text-decoration: underline;
      }
    }
  }

  .order-id {
    font-size: 0.75rem;
    color: #9ea4af;
  }

  .order-status {
    span {
      padding: 0.25rem 0.5rem;
      font-size: 0.6875rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: #374151;
      border-radius: 9999px;
      background: #e5e7eb;

      &.unfulfilled {
        background-color: #fee2e2;
        border: 1px solid #fecaca;
        box-shadow: inset 0 1px 1px #fff;
        color: #991b1b;
      }

      &.fulfilled {
        background-color: #fef3c7;
        border: 1px solid #fde68a;
        box-shadow: inset 0 1px 1px #fff;
        color: #92400e;
      }

      &.completed {
        background-color: #d1fae5;
        border: 1px solid #a7f3d0;
        box-shadow: inset 0 1px 1px #fff;
        color: #065f46;
      }
    }
  }

  .order-actions {
    padding-left: 0;
    position: relative;
  }
`;
