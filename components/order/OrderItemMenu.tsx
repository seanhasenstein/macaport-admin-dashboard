import React from 'react';
import styled from 'styled-components';
import classNames from 'classnames';

import Menu from '../common/Menu';

import { useOrderItemMutation } from '../../hooks/useOrderItemMutation';

import { Order, OrderItem, OrderItemStatus, Store } from '../../interfaces';

type Props = {
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  orderItems: OrderItem[];
  orderItem: OrderItem;
  order: Order;
  store: Store;
  userId: string;
};

export default function OrderItemMenu({
  isOpen,
  setIsOpen,
  orderItems,
  orderItem,
  order,
  store,
  userId,
}: Props) {
  const orderItemStatus = orderItem.status.current;
  const orderIsCanceled = order.orderStatus === 'Canceled';
  const { updateOrderItemStatus } = useOrderItemMutation({
    order,
    store,
    userId: userId || '',
  });

  const toggleSidebar = (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => {
    e.stopPropagation();
    if (orderIsCanceled) return;
    setIsOpen(!isOpen);
  };
  const closeSidebar = () => setIsOpen(false);

  const handleSetStatus = (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>,
    statusToSet: OrderItemStatus,
    returnToInventory = false
  ) => {
    e.stopPropagation();
    if (statusToSet === orderItemStatus) {
      setIsOpen(false);
      return;
    }
    updateOrderItemStatus.mutate({
      orderItems,
      orderItem,
      statusToSet,
      ...(returnToInventory && { returnToInventory }),
    });
    setIsOpen(false);
  };

  const customClasses = {
    customButtonClass: 'custom-menu-button',
    customMenuClass: 'custom-menu',
  };

  return (
    <OrderItemMenuStyles
      className={classNames({ 'canceled-order': orderIsCanceled })}
    >
      <Menu {...{ isOpen, closeSidebar, toggleSidebar, ...customClasses }}>
        <div className="menu-items">
          <button
            type="button"
            onClick={e => handleSetStatus(e, 'Unfulfilled')}
            className="menu-button unfulfilled"
          >
            <span className="dot unfulfilled" />
            Set to unfulfilled
          </button>
          <button
            type="button"
            onClick={e => handleSetStatus(e, 'Fulfilled')}
            className="menu-button fulfilled"
          >
            <span className="dot fulfilled" />
            Set to fulfilled
          </button>
          <button
            type="button"
            onClick={e => handleSetStatus(e, 'Shipped')}
            className="menu-button shipped"
          >
            <span className="dot" />
            Set to shipped
          </button>
          <button
            type="button"
            onClick={e => handleSetStatus(e, 'Canceled', true)}
            className="menu-button canceled"
          >
            <span className="dot" />
            Cancel item and return to inventory
          </button>
          <button
            type="button"
            onClick={e => handleSetStatus(e, 'Canceled')}
            className="menu-button canceled"
          >
            <span className="dot" />
            Cancel item without returning to inventory
          </button>
        </div>
      </Menu>
    </OrderItemMenuStyles>
  );
}

const OrderItemMenuStyles = styled.div`
  &.canceled-order {
    .custom-menu-button {
      background-color: transparent;
      pointer-events: none;
    }
  }
  .custom-menu {
    z-index: 100;
  }
  .custom-menu-button {
    margin-left: 0.875rem;
    padding: 0.25rem 0;
    display: flex;
    justify-content: center;
    align-items: center;
    background-color: #fff;
    border: 1px solid #dddde2;
    border-radius: 0.375rem;
    box-shadow: 0px 1px 2px 0px rgba(0, 0, 0, 0.05);
    pointer-events: all;
    &:hover {
      border-color: #c8c8d0;
    }
  }
  .menu-items {
    display: flex;
    flex-direction: column;
  }
  .menu-button {
    padding: 0.625rem 1.125rem;
    width: 100%;
    background-color: transparent;
    border-width: 0 0 1px 0;
    border-style: solid;
    border-color: #dddde2;
    text-align: left;
    font-size: 0.875rem;
    color: #18181b;
    cursor: pointer;
    pointer-events: all;
    transition: all 0.075s linear;
    &.unfulfilled {
      .dot {
        background-color: #a32626;
      }
    }
    &.fulfilled {
      .dot {
        background-color: #b29625;
      }
    }
    &.shipped {
      .dot {
        background-color: #21986c;
      }
    }
    &.canceled {
      .dot {
        background-color: #224fb3;
      }
    }
    .dot {
      margin-right: 0.5625rem;
      display: inline-block;
      width: 0.5625rem;
      height: 0.5625rem;
      border-radius: 50%;
      background-color: #27272a;
      border: 1px solid rgba(0, 0, 0, 0.75);
    }
    &:hover {
      color: #000;
      background-color: #f5f5f5;
    }
    &:first-of-type {
      border-radius: 0.375rem 0.375rem 0 0;
    }
    &:last-of-type {
      border-radius: 0 0 0.375rem 0.375rem;
      border: none;
    }
  }
  .custom-menu {
    padding: 0;
    top: 2.5625rem;
    border-radius: 0.375rem;
  }
`;
