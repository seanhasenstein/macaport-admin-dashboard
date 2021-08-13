import React from 'react';
import { useRouter } from 'next/router';
import styled from 'styled-components';
import { formatToMoney } from '../utils';
import { Order } from '../interfaces';
import OrdersTableMenu from './OrdersTableMenu';

type OrderViewOptions = 'All' | 'Unfulfilled' | 'Fulfilled' | 'Completed';

export default function OrdersTable({ orders }: { orders: Order[] }) {
  const router = useRouter();
  const [orderViewOption, setOrderViewOption] =
    React.useState<OrderViewOptions>('All');
  const [filteredOrders, setFilteredOrders] = React.useState(orders);
  const [currentActiveId, setCurrentActiveId] = React.useState<
    string | undefined
  >(undefined);

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
                  <th>Order Status</th>
                  <th>
                    Customer/
                    {router.pathname === '/stores/[id]/orders'
                      ? 'Order ID'
                      : 'Store'}
                  </th>
                  <th>Shipping</th>
                  <th className="text-center"># of Items</th>
                  <th className="text-right">Total</th>
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
                        <td>{new Date(o.createdAt).toDateString()}</td>
                        <td className="order-status">
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
                        <td>
                          <div className="customer-name">
                            {o.customer.firstName} {o.customer.lastName}
                          </div>
                          {router.pathname === '/stores/[id]/orders' ? (
                            <div className="order-id">Order #{o.orderId}</div>
                          ) : (
                            <div className="store-name">{o.store.name}</div>
                          )}
                        </td>
                        <td>{o.shippingMethod}</td>
                        <td className="text-center total-items">
                          {o.items.length}
                        </td>
                        <td className="text-right">
                          {formatToMoney(o.summary.total)}
                        </td>
                        <td className="order-actions">
                          <OrdersTableMenu
                            storeId={o.store.id}
                            orderId={o.orderId}
                            currentActiveId={currentActiveId}
                            setCurrentActiveId={setCurrentActiveId}
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
  h3 {
    margin: 0;
    font-weight: 600;
    color: #111827;
  }

  .buttons {
    padding: 1.5rem 0 2rem;

    .container {
      padding: 0.375rem;
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

    &.text-right {
      text-align: right;
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
  }

  td {
    padding: 0.875rem 1rem;
    font-size: 0.875rem;
    font-weight: 500;
    color: #1f2937;

    &.empty {
      padding: 1.25rem 2rem;
    }
  }

  .customer-name {
    margin: 0 0 0.125rem;
    font-weight: 500;
  }

  .store-name,
  .order-id {
    color: #9ea4af;
  }

  .order-id {
    font-size: 0.75rem;
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
        color: #b91c1c;
      }

      &.fulfilled {
        background-color: #fef3c7;
        color: #b45309;
      }

      &.completed {
        background-color: #cffafe;
        color: #0e7490;
      }
    }
  }

  .total-items {
    color: #6b7280;
  }

  .order-actions {
    position: relative;
  }
`;
