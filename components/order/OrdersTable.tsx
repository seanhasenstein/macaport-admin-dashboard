import React from 'react';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';
import styled from 'styled-components';
import { format } from 'date-fns';
import classNames from 'classnames';

import OrderStatusComponent from './OrderStatus';
import Table from '../common/Table';
import OrderSidebar from './OrderSidebar';
import OrdersTableItemsBreakdown from './OrdersTableItemsBreakdown';

import { calculateTotalItems, formatToMoney } from '../../utils';

import {
  Order,
  OrderStatus,
  StoreWithOrderStatusTotals,
} from '../../interfaces';
import UnfulfilledToFulfulledButton from './UnfulfilledToFulfilledButton';

type OrderViewOptions = OrderStatus | 'All' | 'Personalized';

interface OrderFilterItem {
  id: number;
  option: OrderViewOptions;
}

const orderFilterItems: OrderFilterItem[] = [
  { id: 1, option: 'All' },
  { id: 2, option: 'Unfulfilled' },
  { id: 3, option: 'Printed' },
  { id: 4, option: 'Fulfilled' },
  { id: 5, option: 'PartiallyShipped' },
  { id: 6, option: 'Shipped' },
  { id: 7, option: 'Canceled' },
  { id: 8, option: 'Personalized' },
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

type Props = {
  store: StoreWithOrderStatusTotals;
  selectedOrder: Order | undefined;
  setSelectedOrder: React.Dispatch<React.SetStateAction<Order | undefined>>;
  setPrintOption: React.Dispatch<
    React.SetStateAction<
      'unfulfilled' | 'personalization' | 'single' | undefined
    >
  >;
  showCancelOrderModal: boolean;
  setShowCancelOrderModal: React.Dispatch<React.SetStateAction<boolean>>;
  openTriggerStoreShipmentModal: () => void;
};

export default function OrdersTable({
  store,
  selectedOrder,
  setSelectedOrder,
  setPrintOption,
  showCancelOrderModal,
  setShowCancelOrderModal,
  openTriggerStoreShipmentModal,
}: Props) {
  const router = useRouter();

  const [orderViewOption, setOrderViewOption] =
    React.useState<OrderViewOptions>('All');
  const [filteredOrders, setFilteredOrders] = React.useState(store.orders);

  const [selectedOrderIndex, setSelectedOrderIndex] = React.useState(0);
  const [prevOrderId, setPrevOrderId] = React.useState<string | undefined>();
  const [nextOrderId, setNextOrderId] = React.useState<string | undefined>();
  const [showSidebar, setShowSidebar] = React.useState(false);

  const session = useSession();
  const userId = session?.data?.user.id;

  const closeSidebar = () => setShowSidebar(false);

  const updateSelectedOrder = (orderId: string) => {
    const order = filteredOrders.find(o => o.orderId === orderId);
    const newSelectedIndex = filteredOrders.findIndex(
      o => o.orderId === orderId
    );
    const prevOrderId =
      newSelectedIndex === 0
        ? undefined
        : filteredOrders[newSelectedIndex - 1].orderId;
    const nextOrderId =
      newSelectedIndex === filteredOrders.length - 1
        ? undefined
        : filteredOrders[newSelectedIndex + 1].orderId;

    setSelectedOrder(order);
    setSelectedOrderIndex(newSelectedIndex);
    setPrevOrderId(prevOrderId);
    setNextOrderId(nextOrderId);
  };

  const buttonOnClick = (orderId: string) => {
    updateSelectedOrder(orderId);
    setShowSidebar(true);
  };

  React.useEffect(() => {
    if (router.query.orderId) {
      const order = store.orders.find(o => o.orderId === router.query.orderId);
      if (order) {
        setSelectedOrder(order);
        const orderIndex = store.orders.findIndex(
          o => o.orderId === router.query.orderId
        );
        setSelectedOrderIndex(orderIndex);
        setPrevOrderId(
          orderIndex === 0 ? undefined : store.orders[orderIndex - 1].orderId
        );
        setNextOrderId(
          orderIndex === store.orders.length - 1
            ? undefined
            : store.orders[orderIndex + 1].orderId
        );
        setShowSidebar(true);
      }
    }
  }, [router.query.orderId, setSelectedOrder, store.orders]);

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
    const updatedFilteredOrders = store.orders.filter(o => {
      if (
        orderViewOption === 'Printed' &&
        o.orderStatus === 'Unfulfilled' &&
        o.meta.receiptPrinted
      ) {
        return true;
      } else if (
        orderViewOption === 'Unfulfilled' &&
        o.orderStatus === 'Unfulfilled' &&
        o.meta.receiptPrinted
      ) {
        return false;
      } else {
        return o.orderStatus === orderViewOption;
      }
    });
    setFilteredOrders(updatedFilteredOrders);
  }, [orderViewOption, store.orders]);

  // NOTE: this is needed to update the order status in the sidebar
  // TODO: find see if there is a better way to do this
  React.useEffect(() => {
    const updatedSelectedOrder = store.orders.find(
      order => order.orderId === selectedOrder?.orderId
    );
    setSelectedOrder(updatedSelectedOrder);
  }, [selectedOrder?.orderId, setSelectedOrder, store]);

  return (
    <OrdersTableStyles>
      <h3>
        {orderViewOption === 'PartiallyShipped'
          ? 'Partially shipped'
          : orderViewOption}{' '}
        orders
      </h3>
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
                    {item.option === 'PartiallyShipped'
                      ? 'Partially Shipped'
                      : item.option}{' '}
                    <span className="status-total">
                      {store.orderStatusTotals[item.option]}
                    </span>
                  </button>
                ))}
              </div>
            </div>
            <Table customClass="table-container">
              <table>
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Customer</th>
                    {store.requireGroupSelection && <th>{store.groupTerm}</th>}
                    <th>Shipping</th>
                    <th className="text-center">Unique / Total</th>
                    <th className="text-center">Items status</th>
                    <th className="text-center">Order Status</th>
                    <th className="text-center">Personlized</th>
                    <th className="text-right">Note</th>
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
                      {filteredOrders.map((o, index) => {
                        const orderHasUnfulfilledOrBackorderedItems =
                          o.items.some(
                            i =>
                              i.status.current === 'Unfulfilled' ||
                              i.status.current === 'Backordered'
                          );
                        return (
                          <tr key={o.orderId}>
                            <td>
                              <ButtonWrapper
                                onClick={() => buttonOnClick(o.orderId)}
                              >
                                {index + 1}.
                              </ButtonWrapper>
                            </td>
                            <td>
                              <ButtonWrapper
                                onClick={() => buttonOnClick(o.orderId)}
                              >
                                <div className="customer-name">
                                  {o.customer.firstName} {o.customer.lastName}
                                </div>
                                <div className="create-at-date">
                                  {format(
                                    new Date(o.createdAt),
                                    'MM/dd/yyyy h:mmaa'
                                  )}
                                </div>
                                <div className="order-id">#{o.orderId}</div>
                                <div className="order-total">
                                  {formatToMoney(o.summary.total, true)}
                                </div>
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
                            <td className="text-center">
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
                            <td className="text-center">
                              <ButtonWrapper
                                customClassName="order-items-button-wrapper"
                                onClick={() => buttonOnClick(o.orderId)}
                              >
                                <OrdersTableItemsBreakdown
                                  orderItems={o.items}
                                />
                              </ButtonWrapper>
                            </td>
                            <td className="text-center order-status">
                              <ButtonWrapper
                                onClick={() => buttonOnClick(o.orderId)}
                              >
                                <OrderStatusComponent
                                  order={o}
                                  customClass="custom-table-order-status"
                                />
                              </ButtonWrapper>
                            </td>
                            <td className="text-center personalized">
                              <ButtonWrapper
                                onClick={() => buttonOnClick(o.orderId)}
                                customClassName="note-button"
                              >
                                {o.items.some(
                                  item => item.personalizationAddons.length > 0
                                ) ? (
                                  <span className="personalized-span">P</span>
                                ) : null}
                              </ButtonWrapper>
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
                            <td
                              className={
                                orderHasUnfulfilledOrBackorderedItems
                                  ? ''
                                  : 'blank-td'
                              }
                            >
                              {orderHasUnfulfilledOrBackorderedItems ? (
                                <UnfulfilledToFulfulledButton
                                  {...{
                                    order: o,
                                    store,
                                    userId,
                                    orderHasUnfulfilledOrBackorderedItems,
                                  }}
                                />
                              ) : (
                                <ButtonWrapper
                                  onClick={() => buttonOnClick(o.orderId)}
                                >
                                  <span />
                                </ButtonWrapper>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </>
                  )}
                </tbody>
              </table>
            </Table>
          </div>
          <OrderSidebar
            {...{
              closeSidebar,
              isOpen: showSidebar,
              selectedOrder,
              selectedOrderIndex,
              prevOrderId,
              nextOrderId,
              updateSelectedOrder,
              store,
              setPrintOption,
              showCancelOrderModal,
              setShowCancelOrderModal,
              openTriggerStoreShipmentModal,
            }}
          />
        </>
      )}
    </OrdersTableStyles>
  );
}

const OrdersTableStyles = styled.div`
  overflow-x: auto;
  .buttons {
    margin: 0 0 1.75rem;
    width: 100%;

    .container {
      padding: 0.1875rem;
      min-width: 67rem;
      width: 100%;
      display: flex;
      justify-content: space-between;
      background-color: #e8eaee;
      border: 1px solid #d1d5db;
      border-radius: 0.375rem;
      box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05);
    }

    button {
      padding: 0.625rem 0.9375rem;
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
    margin-bottom: 0.1875rem;
    min-width: 67rem;
  }

  th:first-of-type,
  td:first-of-type button {
    padding-left: 2rem;
    padding-right: 0;
  }

  .order-items-button-wrapper {
    display: flex;
    justify-content: center;
    align-items: center;
    padding-top: 0.5rem;
    padding-bottom: 0.5rem;
  }

  th {
    padding-top: 0.75rem;
    padding-bottom: 0.75rem;
  }

  td {
    background-color: #fdfdfd;
  }

  tr:last-of-type {
    td:first-of-type {
      border-bottom-left-radius: 0.375rem;
    }
    td:last-of-type {
      border-bottom-right-radius: 0.375rem;
    }
  }

  td,
  td:first-of-type {
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
        padding-left: 0;
      }
    }

    &.order-status {
      padding-left: 1rem;
      padding-right: 1rem;
      .custom-table-order-status {
        padding: 0.3125rem 0;
        min-width: 7.25rem;
        font-size: 0.625rem;
      }
    }

    &.personalized {
      .personalized-span {
        margin: 0 auto;
        padding: 0 0 0 0.0625rem;
        height: 1.25rem;
        width: 1.25rem;
        display: flex;
        justify-content: center;
        align-items: center;
        background-color: #4b5563;
        color: #fff;
        font-size: 0.5625rem;
        font-weight: 700;
        text-align: center;
        line-height: 100%;
        border-radius: 9999px;
      }
    }

    &.note {
      padding: 0;
      .note-button {
        padding-left: 0;
        width: 100%;
        display: flex;
        align-items: center;
        svg {
          height: 1.0625rem;
          width: 1.0625rem;
          color: #4b5563;
        }
      }
    }

    &.blank-td {
      padding: 0;
    }
  }

  .customer-name {
    font-size: 0.875rem;
    font-weight: 600;
    color: #09090b;
    line-height: 100%;
  }

  .create-at-date,
  .order-id,
  .order-total {
    margin-top: 0.25rem;
    font-size: 0.75rem;
    font-weight: 500;
    color: #71717a;
  }

  .order-actions {
    padding-left: 0;
    position: relative;
  }
`;
