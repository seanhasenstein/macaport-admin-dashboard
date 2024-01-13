import React from 'react';
import styled from 'styled-components';
import { format } from 'date-fns';
import classNames from 'classnames';

import OrderStatusButton from './OrderStatusButton';
import Table from '../common/Table';
import OrderSidebar from './OrderSidebar';

import { calculateTotalItems, formatToMoney } from '../../utils';

import {
  Order,
  OrderStatus,
  StoreWithOrderStatusTotals,
} from '../../interfaces';

type OrderViewOptions = OrderStatus | 'All' | 'Personalized';

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
  { id: 7, option: 'Personalized' },
];

interface ButtonWrapperProps {
  children: React.ReactNode;
  customClassName?: string;
  onClick: () => void;
}

function ButtonWrapper({
  children,
  customClassName,
  onClick,
}: ButtonWrapperProps) {
  return (
    <ButtonWrapperStyles
      type="button"
      onClick={onClick}
      className={classNames(customClassName)}
    >
      {children}
    </ButtonWrapperStyles>
  );
}

const ButtonWrapperStyles = styled.button`
  padding: 1rem;
  background-color: transparent;
  border: none;
  text-align: inherit;
  color: inherit;
  font-size: inherit;
  font-weight: inherit;
  font-family: inherit;
  width: 100%;
  min-height: 69px;
  cursor: pointer;
`;

export default function OrdersTable({ store }: Props) {
  const [orderViewOption, setOrderViewOption] =
    React.useState<OrderViewOptions>('All');
  const [filteredOrders, setFilteredOrders] = React.useState(store.orders);
  const [selectedOrder, setSelectedOrder] = React.useState<Order | undefined>();
  const [showSidebar, setShowSidebar] = React.useState(false);

  const closeSidebar = () => setShowSidebar(false);

  const buttonOnClick = (orderId: string) => {
    const order = store.orders.find(o => o.orderId === orderId);
    setSelectedOrder(order);
    setShowSidebar(true);
  };

  React.useEffect(() => {
    if (orderViewOption === 'All') {
      setFilteredOrders(store.orders);
      return;
    }
    if (orderViewOption === 'Personalized') {
      const updatedFilteredOrders = store.orders.filter(o =>
        o.items.some(item => item.personalizationAddons.length > 0)
      );
      setFilteredOrders(updatedFilteredOrders);
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
        <>
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
            <Table className="table-container">
              <table>
                <thead>
                  <tr>
                    <th />
                    <th>Date</th>
                    <th>Customer</th>
                    {store.requireGroupSelection && <th>{store.groupTerm}</th>}
                    <th>Shipping</th>
                    <th className="text-center">Unique / Total Items</th>
                    <th className="text-center">
                      Has at least one
                      <br />
                      personalized item
                    </th>
                    <th className="text-right">Total</th>
                    <th className="text-center">Order Status</th>
                    <th className="text-right">
                      Has a<br />
                      note
                    </th>
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
                      {filteredOrders.map((o, index) => (
                        <tr key={o.orderId}>
                          <td className="order-number">
                            <ButtonWrapper
                              onClick={() => buttonOnClick(o.orderId)}
                              customClassName="order-number-button"
                            >
                              {index + 1}.
                            </ButtonWrapper>
                          </td>
                          <td>
                            <ButtonWrapper
                              onClick={() => buttonOnClick(o.orderId)}
                            >
                              <div className="create-at-date">
                                {format(new Date(o.createdAt), 'MM/dd/yyyy')}
                              </div>
                              <div className="create-at-time">
                                {format(new Date(o.createdAt), 'h:mmaa')}
                              </div>
                            </ButtonWrapper>
                          </td>
                          <td>
                            <ButtonWrapper
                              onClick={() => buttonOnClick(o.orderId)}
                            >
                              <div className="customer-name">
                                {o.customer.firstName} {o.customer.lastName}
                              </div>
                              <div className="order-id">#{o.orderId}</div>
                            </ButtonWrapper>
                          </td>
                          {store.requireGroupSelection && (
                            <td>
                              <ButtonWrapper
                                onClick={() => buttonOnClick(o.orderId)}
                              >
                                {o.group}
                              </ButtonWrapper>
                            </td>
                          )}
                          <td>
                            <ButtonWrapper
                              onClick={() => buttonOnClick(o.orderId)}
                            >
                              {o.shippingMethod}
                            </ButtonWrapper>
                          </td>
                          <td className="text-center total-items">
                            <ButtonWrapper
                              onClick={() => buttonOnClick(o.orderId)}
                            >
                              {o.orderStatus === 'Canceled'
                                ? 0
                                : o.items.length}{' '}
                              /{' '}
                              {o.orderStatus === 'Canceled'
                                ? 0
                                : calculateTotalItems(o.items)}
                            </ButtonWrapper>
                          </td>
                          <td className="text-center personalization">
                            <ButtonWrapper
                              onClick={() => buttonOnClick(o.orderId)}
                            >
                              {o.items.some(
                                item => item.personalizationAddons.length > 0
                              )
                                ? 'P'
                                : null}
                            </ButtonWrapper>
                          </td>
                          <td className="text-right">
                            <ButtonWrapper
                              onClick={() => buttonOnClick(o.orderId)}
                            >
                              {formatToMoney(o.summary.total, true)}
                            </ButtonWrapper>
                          </td>
                          <td className="text-center">
                            <OrderStatusButton store={store} order={o} />
                          </td>
                          <td className="note">
                            <ButtonWrapper
                              onClick={() => buttonOnClick(o.orderId)}
                              customClassName="note-button"
                            >
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
                            </ButtonWrapper>
                          </td>
                        </tr>
                      ))}
                    </>
                  )}
                </tbody>
              </table>
            </Table>
          </div>
          <OrderSidebar
            {...{ closeSidebar, isOpen: showSidebar, selectedOrder, store }}
          />
        </>
      )}
    </OrdersTableStyles>
  );
}

const OrdersTableStyles = styled.div`
  overflow-x: auto;
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

  .table-container {
    min-width: 67rem;
  }

  td {
    padding: 0;
    &.empty {
      padding: 1.25rem 2rem;
      color: #1f2937;
      font-size: 0.9375rem;
    }

    &.order-number {
      padding-right: 0;
      padding-left: 0;
      .order-number-button {
        padding-right: 0;
        padding-left: 2.25rem;
      }
    }

    &.note {
      padding: 0;
      .note-button {
        padding-right: 2rem;
        width: 100%;
        display: flex;
        justify-content: flex-end;
        align-items: center;
        svg {
          height: 0.875rem;
          width: 0.875rem;
          color: #374151;
        }
      }
    }
  }

  .create-at-date,
  .create-at-time {
    font-size: 0.8125rem;
    font-weight: 500;
  }

  .create-at-time {
    margin-top: 0.125rem;
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
