import React from 'react';
import { useSession } from 'next-auth/react';
import styled from 'styled-components';
import { format } from 'date-fns';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/20/solid';

import Sidebar from '../Sidebar';
import OrderSidebarMenu from './OrderSidebarMenu';
import OrderStatus from './OrderStatus';
import PrintableOrder from '../PrintableOrder';
import OrderDetailItem from './OrderDetailItem';
import OrderItem from './OrderItem';
import OrderItemsBreakdown from './OrderItemsBreakdown';

import { formatPhoneNumber, formatToMoney } from '../../utils';

import { Order, Store } from '../../interfaces';

type Props = {
  closeSidebar: () => void;
  isOpen: boolean;
  selectedOrder: Order | undefined;
  selectedOrderIndex: number | undefined;
  prevOrderId: string | undefined;
  nextOrderId: string | undefined;
  updateSelectedOrder: (orderId: string) => void;
  store: Store;
  setPrintOption: React.Dispatch<
    React.SetStateAction<
      'unfulfilled' | 'personalization' | 'single' | undefined
    >
  >;
  showCancelOrderModal: boolean;
  setShowCancelOrderModal: React.Dispatch<React.SetStateAction<boolean>>;
  openTriggerStoreShipmentModal: () => void;
};

export default function OrderSidebar({
  closeSidebar,
  isOpen,
  selectedOrder,
  selectedOrderIndex = 0,
  prevOrderId,
  nextOrderId,
  updateSelectedOrder,
  store,
  setPrintOption,
  showCancelOrderModal,
  setShowCancelOrderModal,
  openTriggerStoreShipmentModal,
}: Props) {
  const mainContentRef = React.useRef<HTMLDivElement>(null);

  const session = useSession();
  const userId = session?.data?.user.id;

  // TODO: move this to a custom hook
  React.useEffect(() => {
    if (isOpen) {
      const handleLeftKeydown = (e: KeyboardEvent) => {
        if (e.key === 'ArrowLeft' && prevOrderId) {
          updateSelectedOrder(prevOrderId);
          mainContentRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
        }
      };

      const handleRightKeydown = (e: KeyboardEvent) => {
        if (e.key === 'ArrowRight' && nextOrderId) {
          updateSelectedOrder(nextOrderId);
          mainContentRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
        }
      };

      document.addEventListener('keydown', handleLeftKeydown);
      document.addEventListener('keydown', handleRightKeydown);

      return () => {
        document.removeEventListener('keydown', handleLeftKeydown);
        document.removeEventListener('keydown', handleRightKeydown);
      };
    }
  }, [isOpen, nextOrderId, prevOrderId, updateSelectedOrder]);

  React.useEffect(() => {
    if (isOpen) {
      mainContentRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [isOpen]);

  if (!selectedOrder) return null;

  const {
    createdAt,
    customer,
    group,
    items,
    note,
    orderId,
    shippingMethod,
    shippingAddress,
    stripeId,
    summary,
    orderStatus,
    switchFitnessDiscount,
    sheboyganLutheranStaffDiscount,
  } = selectedOrder;
  const { email, firstName, lastName, phone } = customer;
  const { subtotal, salesTax, shipping, total, stripeFee } = summary;

  const renderShippingAddressLabel = () => {
    if (shippingMethod === 'Direct') {
      return 'Shipping address:';
    } else if (shippingMethod === 'Primary') {
      return 'Primary location:';
    } else {
      return '';
    }
  };

  const renderShippingAddressValue = () => {
    const { name, street, street2, city, state, zipcode } = shippingAddress;
    if (shippingMethod === 'Direct' || shippingMethod === 'Primary') {
      return (
        <>
          {name && name}
          {street && (
            <>
              {name ? <br /> : null}
              {street}
            </>
          )}
          {street2 ? (
            <>
              <br />
              {street2}
            </>
          ) : null}
          {city || state || zipcode ? <br /> : null}
          {city ? city : ''}
          {city && state ? `, ${state}` : state ? state : ''}
          {zipcode ? ` ${zipcode}` : ''}
        </>
      );
    } else {
      return '';
    }
  };

  return (
    <>
      <OrderSidebarStyles>
        <Sidebar
          {...{ isOpen, closeSidebar }}
          disableOutsideClick={showCancelOrderModal}
          disableEscapeKeydown={showCancelOrderModal}
          customHeader={
            <div className="custom-header">
              <div className="customer-details">
                <div className="details flex justify-between">
                  <div>
                    <p className="name">
                      {firstName} {lastName}
                    </p>
                    <p className="email">
                      <a href={`mailto:${email}`}>{email}</a>
                    </p>
                    <p className="phone">{formatPhoneNumber(phone)}</p>
                  </div>
                  <div>
                    <div className="order-status">
                      <OrderStatus
                        {...{
                          order: selectedOrder,
                          copy: `Order ${
                            orderStatus === 'PartiallyShipped'
                              ? 'Partially Shipped'
                              : orderStatus === 'Unfulfilled' &&
                                selectedOrder.meta.receiptPrinted
                              ? 'Printed'
                              : orderStatus
                          }`,
                          customClass: 'custom-order-status',
                        }}
                      />
                    </div>
                    <p className="date">
                      {format(new Date(createdAt), "P 'at' h:mmaaa")}
                    </p>
                    <p className="order-id">#{orderId}</p>
                  </div>
                </div>
                <OrderSidebarMenu
                  {...{
                    stripeId,
                    setPrintOption,
                    setShowCancelOrderModal,
                    store,
                    openTriggerStoreShipmentModal,
                  }}
                />
              </div>
              <div>
                <div className="order-number-header">
                  <p>
                    <span>
                      Order {selectedOrderIndex + 1} of {store.orders.length}
                    </span>
                  </p>
                </div>
                <div className="breakdown-section">
                  <OrderItemsBreakdown
                    orderItems={items}
                    customClass="order-items-breakdown"
                  />
                </div>
              </div>
            </div>
          }
        >
          <div ref={mainContentRef} className="main-order-content">
            <div className="order-details">
              <div className="details">
                <OrderDetailItem label="Store:" value={store.name} />
                {store.requireGroupSelection && (
                  <OrderDetailItem label={store.groupTerm} value={group} />
                )}
                <OrderDetailItem
                  label="Shipping method:"
                  value={shippingMethod}
                />
                {shippingMethod !== 'Store Pickup' && (
                  <OrderDetailItem
                    label={renderShippingAddressLabel()}
                    value={renderShippingAddressValue()}
                    customValueClass="shipping-address-value"
                  />
                )}
                {switchFitnessDiscount && summary.discount ? (
                  <OrderDetailItem
                    label="Switch discount:"
                    value={
                      <>
                        {formatToMoney(summary.discount, true)} discount applied
                        for{' '}
                        <span
                          title={switchFitnessDiscount.email}
                          className="switch-discount-email"
                        >
                          {switchFitnessDiscount.email}
                        </span>
                      </>
                    }
                  />
                ) : null}
                {sheboyganLutheranStaffDiscount && summary.discount ? (
                  <OrderDetailItem
                    label="Staff discount:"
                    value={
                      <>
                        {formatToMoney(summary.discount, true)} discount applied
                        for{' '}
                        <span
                          title={sheboyganLutheranStaffDiscount.email}
                          className="switch-discount-email"
                        >
                          {sheboyganLutheranStaffDiscount.email}
                        </span>
                      </>
                    }
                  />
                ) : null}
                <OrderDetailItem
                  label="Order note:"
                  value={note ? note : 'None provided'}
                  customClass={note ? 'note-item' : undefined}
                  customValueClass="note-value"
                />
              </div>
              <div className="summary">
                <OrderDetailItem
                  label="Subtotal:"
                  value={formatToMoney(subtotal, true)}
                  customClass="summary-item"
                  customLabelClass="summary-label"
                  customValueClass="summary-value"
                />
                {switchFitnessDiscount && summary.discount ? (
                  <OrderDetailItem
                    label="Discount:"
                    value={`-${formatToMoney(summary.discount, true)}`}
                    customClass="summary-item"
                    customLabelClass="summary-label"
                    customValueClass="summary-value"
                  />
                ) : null}
                {sheboyganLutheranStaffDiscount && summary.discount ? (
                  <OrderDetailItem
                    label="Discount:"
                    value={`-${formatToMoney(summary.discount, true)}`}
                    customClass="summary-item"
                    customLabelClass="summary-label"
                    customValueClass="summary-value"
                  />
                ) : null}
                <OrderDetailItem
                  label="Sales tax:"
                  value={formatToMoney(salesTax, true)}
                  customClass="summary-item"
                  customLabelClass="summary-label"
                  customValueClass="summary-value"
                />
                <OrderDetailItem
                  label="Shipping:"
                  value={formatToMoney(shipping, true)}
                  customClass="summary-item"
                  customLabelClass="summary-label"
                  customValueClass="summary-value"
                />
                <OrderDetailItem
                  label="Total:"
                  value={formatToMoney(total, true)}
                  customClass="summary-item"
                  customLabelClass="summary-label"
                  customValueClass="summary-value"
                />
                <OrderDetailItem
                  label="Stripe fee:"
                  value={formatToMoney(stripeFee, true)}
                  customClass="summary-item"
                  customLabelClass="summary-label"
                  customValueClass="summary-value"
                />
                <OrderDetailItem
                  label="Net:"
                  value={formatToMoney(total - stripeFee, true)}
                  customClass="summary-item"
                  customLabelClass="summary-label"
                  customValueClass="summary-value"
                />
              </div>
            </div>
            <div className="order-items">
              <p className="order-items-label">
                <span>Order items</span>
              </p>
              <div>
                {items.map(item => (
                  <OrderItem
                    key={item.id}
                    {...{
                      orderItems: items,
                      item,
                      order: selectedOrder,
                      store,
                      userId,
                    }}
                  />
                ))}
              </div>
            </div>
            <div className="order-number">
              <p>
                Order {selectedOrderIndex + 1} of {store.orders.length}
              </p>
            </div>
            <div className="next-prev-actions">
              <div className="buttons-wrapper">
                <button
                  type="button"
                  onClick={() => {
                    if (prevOrderId) {
                      updateSelectedOrder(prevOrderId);
                      mainContentRef.current?.scrollTo({
                        top: 0,
                        behavior: 'smooth',
                      });
                    }
                  }}
                  disabled={!prevOrderId}
                  className="prev-button"
                >
                  <ChevronLeftIcon className="icon" />
                  Prev order
                </button>
                <span className="divider" aria-hidden="true" />
                <button
                  type="button"
                  onClick={() => {
                    if (nextOrderId) {
                      updateSelectedOrder(nextOrderId);
                      mainContentRef.current?.scrollTo({
                        top: 0,
                        behavior: 'smooth',
                      });
                    }
                  }}
                  disabled={!nextOrderId}
                  className="next-button"
                >
                  Next order
                  <ChevronRightIcon className="icon" />
                </button>
              </div>
            </div>
          </div>
        </Sidebar>
      </OrderSidebarStyles>
      <PrintableOrder
        key={selectedOrder.orderId}
        order={selectedOrder}
        store={store}
      />
    </>
  );
}

const OrderSidebarStyles = styled.div`
  --unfulfilled-background: #fff1f1;
  --unfulfilled-text-color: #630303;
  --unfulfilled-border: #fecbcb;
  --unfulfilled-dark-border: #f83333;
  --fulfilled-background: #fffbeb;
  --fulfilled-text-color: #5e4c02;
  --fulfilled-border: #fce277;
  --fulfilled-dark-border: #fbce16;
  --fulfilled-text: #382d01;
  --shipped-background: #e5f9f2;
  --shipped-text-color: #0c3727;
  --shipped-border: #95e8ca;
  --shipped-dark-border: #28b883;
  --canceled-background: #f4f4f5;
  --canceled-border: #a1a1aa;
  --canceled-dark-border: #71717a;
  position: relative;
  .flex {
    display: flex;
  }
  .justify-between {
    justify-content: space-between;
  }
  .align-center {
    align-items: center;
  }
  .full-width {
    width: 100%;
  }
  p {
    margin: 0;
    &.name {
      color: #09090b;
      font-size: 1.125rem;
      font-weight: 600;
      line-height: 100%;
    }
    &.email,
    &.phone,
    &.date,
    &.order-id {
      color: #52525b;
      font-family: inherit;
      font-size: 0.9375rem;
      font-weight: 500;
      line-height: 100%;
    }
    &.email {
      margin-top: 0.375rem;
    }
    &.date {
      margin-top: 0.5rem;
    }
    &.phone,
    &.order-id {
      margin-top: 0.5rem;
    }
    &.order-id,
    &.date {
      text-align: right;
    }
    &.date {
      margin-top: 0.5625rem;
    }
    &.email {
      a:hover {
        text-decoration: underline;
      }
    }
  }
  .custom-header {
    background-color: #f9fafb;
    border-radius: 0.625rem 0.625rem 0rem 0rem;

    .order-number-header {
      background-color: #fff;
      p {
        position: relative;
        margin: 0 1rem 0 1.5rem;
        width: calc(100% - 2.5rem);
        color: #000;
        font-size: 0.75rem;
        font-weight: 600;
        line-height: 100%;
        text-align: center;
        text-transform: uppercase;
        letter-spacing: 0.1em;

        span {
          position: relative;
          padding: 0 1rem;
          background-color: #fff;
          z-index: 1;
        }
        &:after {
          content: '';
          display: block;
          position: absolute;
          top: 0.3125rem;
          left: 0;
          width: 100%;
          height: 1px;
          background-color: #d4d4d8;
          z-index: 0;
        }
      }
    }
  }
  .breakdown-section {
    padding: 1.3125rem 1rem 1.6875rem 1.5rem;
    background-color: #fff;
    border-bottom: 1px solid #e5e7eb;
    border-radius: 0.625rem 0.625rem 0rem 0rem;
    box-shadow: 0px 1px 2px 0px rgba(0, 0, 0, 0.05);
  }
  .customer-details {
    z-index: 100;
    position: sticky;
    top: 0;
    left: 0;
    width: 100%;
    padding: 1.75rem 1.25rem 1.5rem 1.75rem;
    display: grid;
    grid-template-columns: 1fr 1.5rem;
    background-color: #fff;
    border-radius: 0.625rem 0.625rem 0rem 0rem;
    .details {
      padding: 0 2rem 0 0;
    }
    .discount {
      display: flex;
      p {
      }
    }
    .order-status {
      display: flex;
      justify-content: flex-end;
      .custom-order-status {
        padding: 0.34375rem 0.875rem;
        min-width: 10.5rem;
        font-weight: 700;
        user-select: none;
        text-align: center;
      }
    }
    .order-menu-section {
      display: flex;
      justify-content: flex-end;
      align-items: start;
    }
  }
  .main-order-content {
    overflow-y: auto;
    position: fixed;
    top: 13.75rem;
    bottom: 0.375rem;
    width: 100%;
  }
  .order-details {
    padding: 2rem 2.5rem 0;
    display: flex;
    justify-content: space-between;
    .details,
    .summary {
      flex: 1 1 auto;
    }
    .details {
      padding-right: 3rem;
      display: flex;
      flex-direction: column;
      gap: 1rem 0;
      border-right: 1px solid #d4d4d8;
    }
    .switch-discount-email {
      display: inline-block;
      max-width: 14.75rem;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    .note-item {
      flex-direction: column;
      align-items: flex-start;
      gap: 0.625rem 0;
    }
    .note-value {
      line-height: 150%;
    }
  }
  .summary {
    padding-left: 4rem;
    display: flex;
    flex-direction: column;
    gap: 0.8125rem 0;
    min-width: 14.3125rem;
    .summary-item {
      justify-content: space-between;
    }
    .summary-label {
      width: 5rem;
      min-width: unset;
    }
    .summary-value {
      text-align: right;
    }
  }
  .order-items {
    margin: 2.25rem 2.5rem 0;
    .order-items-label {
      position: relative;
      color: #09090b;
      font-size: 0.6875rem;
      font-weight: 700;
      line-height: 100%;
      letter-spacing: 0.15rem;
      text-transform: uppercase;
      text-align: center;
      &:after {
        content: '';
        display: block;
        position: absolute;
        top: 0.34375rem;
        left: 0;
        width: 100%;
        height: 1px;
        background-color: #d4d4d8;
        z-index: 0;
      }
      span {
        position: relative;
        padding: 0 1.25rem;
        background-color: #f9fafb;
        z-index: 1;
      }
    }
  }
  .next-prev-actions {
    margin: 0 0 3rem;
    .buttons-wrapper {
      margin: 0 auto;
      max-width: 19rem;
      display: flex;
      justify-content: center;
      align-items: center;
      border-radius: 9999px;
      border: 1px solid #d4d4d8;
      background: #fff;
      box-shadow: 0px -1px 2px 0px rgba(0, 0, 0, 0.05),
        0px 1px 2px 0px rgba(0, 0, 0, 0.05);
      .prev-button,
      .next-button {
        padding: 0.75rem 1rem;
        display: flex;
        justify-content: center;
        align-items: center;
        gap: 0 0.5rem;
        background-color: transparent;
        border: none;
        color: #27272a;
        text-align: center;
        font-size: 0.75rem;
        font-weight: 700;
        line-height: 100%;
        letter-spacing: 0.10313rem;
        text-transform: uppercase;
        cursor: pointer;
        transition: color 100ms linear;
        &:hover {
          color: #000;
          .icon {
            color: #065f46;
          }
        }
        &:disabled {
          color: #a1a1aa;
          cursor: default;
          .icon {
            color: #d4d4d8;
          }
        }
        .icon {
          height: 1.0625rem;
          width: 1.0625rem;
          color: #a1a1aa;
          transition: color 100ms linear;
        }
      }
      .divider {
        height: 1.0625rem;
        width: 1px;
        background-color: #d4d4d8;
      }
    }
  }
  .order-number {
    margin: 2.25rem 0 1.75rem;
    width: 100%;
    p {
      padding: 0.25rem 0.5rem;
      color: #09090b;
      font-size: 0.75rem;
      font-weight: 600;
      line-height: 100%;
      text-align: center;
      text-transform: uppercase;
      letter-spacing: 0.1em;
    }
  }
`;
