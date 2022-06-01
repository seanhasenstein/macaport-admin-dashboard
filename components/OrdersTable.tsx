import React from 'react';
import Link from 'next/link';
import styled from 'styled-components';
import { format } from 'date-fns';
import { calculateTotalItems, formatToMoney } from '../utils';
import { Order, OrderStatus, Store } from '../interfaces';
import OrdersTableMenu from './OrdersTableMenu';
import OrderStatusButton from './OrderStatusButton';

type OrderViewOptions = OrderStatus | 'All';

type Props = {
  store: Store;
  orders: Order[];
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
              {orderFilterItems.map(item => (
                <button
                  key={item.id}
                  type="button"
                  className={orderViewOption === item.option ? 'active' : ''}
                  onClick={() => setOrderViewOption(item.option)}
                >
                  {item.option}
                </button>
              ))}
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
                          {format(
                            new Date(o.createdAt),
                            'MMM. dd, yyyy h:mmaa'
                          )}
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
                          {o.orderStatus === 'Canceled' ? 0 : o.items.length}
                        </td>
                        <td className="text-center">
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
                        <td className="order-actions">
                          <OrdersTableMenu store={store} order={o} />
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
      color: #6b7280;
      font-size: 0.9375rem;
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
