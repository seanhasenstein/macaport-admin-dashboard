import React from 'react';
import styled from 'styled-components';
import { format } from 'date-fns';
import classNames from 'classnames';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/20/solid';

import Sidebar from '../Sidebar';
import OrderSidebarMenu from './OrderSidebarMenu';
import OrderStatusButton from './OrderStatusButton';

import { Order, Store } from '../../interfaces';

import { formatPhoneNumber, formatToMoney } from '../../utils';
import PrintableOrder from '../PrintableOrder';

type OrderItemProps = {
  label: string;
  value: string | number | JSX.Element | null | undefined;
  customClass?: string;
  customLabelClass?: string;
  customValueClass?: string;
};

function OrderItem({
  label,
  value,
  customClass,
  customLabelClass,
  customValueClass,
}: OrderItemProps) {
  return (
    <OrderItemStyles className={classNames(customClass)}>
      <p className={classNames('label', customLabelClass)}>{label}</p>
      <p className={classNames('value', customValueClass)}>
        {value ? value : ''}
      </p>
    </OrderItemStyles>
  );
}

const OrderItemStyles = styled.div`
  display: flex;
  .label {
    min-width: 9.5rem;
    color: #09090b;
    font-size: 0.9375rem;
    font-weight: 500;
    line-height: 100%;
  }
  .value {
    color: #52525b;
    font-size: 0.9375rem;
    font-weight: 500;
    line-height: 100%;
  }
`;

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
  setShowCancelOrderModal: React.Dispatch<React.SetStateAction<boolean>>;
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
  setShowCancelOrderModal,
}: Props) {
  const mainContentRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (isOpen) {
      const handleUpKeydown = (e: KeyboardEvent) => {
        if (e.key === 'ArrowUp' && prevOrderId) {
          updateSelectedOrder(prevOrderId);
          mainContentRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
        }
      };

      const handleDownKeydown = (e: KeyboardEvent) => {
        if (e.key === 'ArrowDown' && nextOrderId) {
          updateSelectedOrder(nextOrderId);
          mainContentRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
        }
      };

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

      document.addEventListener('keydown', handleUpKeydown);
      document.addEventListener('keydown', handleDownKeydown);
      document.addEventListener('keydown', handleLeftKeydown);
      document.addEventListener('keydown', handleRightKeydown);

      return () => {
        document.removeEventListener('keydown', handleUpKeydown);
        document.removeEventListener('keydown', handleDownKeydown);
        document.removeEventListener('keydown', handleLeftKeydown);
        document.removeEventListener('keydown', handleRightKeydown);
      };
    }
  }, [isOpen, nextOrderId, prevOrderId, updateSelectedOrder]);

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
          customHeader={
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
                    <OrderStatusButton {...{ store, order: selectedOrder }} />
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
                  orderIsCanceled: selectedOrder.orderStatus === 'Canceled',
                }}
              />
            </div>
          }
        >
          <div ref={mainContentRef} className="main-order-content">
            <div className="order-details">
              <div className="details">
                <OrderItem label="Store:" value={store.name} />
                {store.requireGroupSelection && (
                  <OrderItem label={store.groupTerm} value={group} />
                )}
                <OrderItem label="Shipping method:" value={shippingMethod} />
                {shippingMethod !== 'Store Pickup' && (
                  <OrderItem
                    label={renderShippingAddressLabel()}
                    value={renderShippingAddressValue()}
                    customValueClass="shipping-address-value"
                  />
                )}
                <OrderItem
                  label="Order note:"
                  value={note ? note : 'None provided'}
                  customClass={note ? 'note-item' : undefined}
                  customValueClass="note-value"
                />
              </div>
              <div className="summary">
                <OrderItem
                  label="Subtotal:"
                  value={formatToMoney(subtotal, true)}
                  customClass="summary-item"
                  customLabelClass="summary-label"
                  customValueClass="summary-value"
                />
                <OrderItem
                  label="Sales tax:"
                  value={formatToMoney(salesTax, true)}
                  customClass="summary-item"
                  customLabelClass="summary-label"
                  customValueClass="summary-value"
                />
                <OrderItem
                  label="Shipping:"
                  value={formatToMoney(shipping, true)}
                  customClass="summary-item"
                  customLabelClass="summary-label"
                  customValueClass="summary-value"
                />
                <OrderItem
                  label="Total:"
                  value={formatToMoney(total, true)}
                  customClass="summary-item"
                  customLabelClass="summary-label"
                  customValueClass="summary-value"
                />
                <OrderItem
                  label="Stripe fee:"
                  value={formatToMoney(stripeFee, true)}
                  customClass="summary-item"
                  customLabelClass="summary-label"
                  customValueClass="summary-value"
                />
                <OrderItem
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
              <div className="items">
                {items.map((item, index) => {
                  const {
                    image,
                    itemTotal,
                    merchandiseCode,
                    name,
                    personalizationAddons,
                    quantity,
                    sku,
                    artworkId,
                  } = item;
                  const { color, size } = sku;
                  const { label: colorLabel, hex } = color;
                  const { label: sizeLabel } = size;

                  return (
                    <div key={index} className="item">
                      <div className="main-details">
                        <div className="full-width flex">
                          <div className="featured-img">
                            <img src={image} alt={name} />
                          </div>
                          <div className="full-width">
                            <div className="top-row">
                              <p className="item-name">{name}</p>
                              <p className="merch-code">
                                {merchandiseCode ? `${merchandiseCode}` : ''}
                              </p>
                            </div>
                            <div>
                              <div className="full-width flex justify-between align-center">
                                <p className="color">
                                  <span
                                    className="dot"
                                    style={{ backgroundColor: hex }}
                                  />
                                  {colorLabel}
                                </p>
                                <p className="artwork-id">
                                  <span>Artwork:</span>{' '}
                                  {artworkId ? artworkId : 'None'}
                                </p>
                              </div>
                              <div className="item-data">
                                <p className="quantity-and-size">
                                  <span className="quantity">{quantity}</span>
                                  <span className="x">x</span>
                                  <span className="size">{sizeLabel}</span>
                                </p>
                                <p className="item-total">
                                  {formatToMoney(itemTotal, true)}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      {/* personalization */}
                      {personalizationAddons.length > 0 && (
                        <div className="personalization-details">
                          <p className="title">
                            <span>Item personalization</span>
                          </p>
                          <div className="items">
                            {personalizationAddons.map((item, index) => {
                              const { addon, location, subItems, value } = item;
                              return (
                                <>
                                  <div
                                    key={index}
                                    className="personalization-item"
                                  >
                                    <div className="flex align-center">
                                      <p className="label">{addon}:</p>
                                      <p className="value">{value}</p>
                                    </div>
                                    <span className="location">{location}</span>
                                  </div>
                                  {subItems.length > 0 ? (
                                    <>
                                      {subItems.map((subItem, index) => (
                                        <div
                                          key={index}
                                          className="personalization-item"
                                        >
                                          <div className="flex align-center">
                                            <p className="label">
                                              {subItem.addon}:
                                            </p>
                                            <p className="value">
                                              {subItem.value}
                                            </p>
                                          </div>
                                          <span className="location">
                                            {subItem.location}
                                          </span>
                                        </div>
                                      ))}
                                    </>
                                  ) : null}
                                </>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
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
    &.email,
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
    &.email {
      a:hover {
        text-decoration: underline;
      }
    }
  }
  .customer-details {
    z-index: 100;
    position: sticky;
    top: 0;
    left: 0;
    width: 100%;
    margin: 0 0 0.5rem 0;
    padding: 2rem 1.5rem 0 2.5rem;
    display: grid;
    grid-template-columns: 1fr 1.5rem;
    border-radius: 0.625rem 0.625rem 0rem 0rem;
    border-bottom: 1px solid #e5e7eb;
    background: #fff;
    box-shadow: 0px 1px 2px 0px rgba(0, 0, 0, 0.05);
    .details {
      padding: 0 2rem 2rem 0;
    }
    .order-status {
      display: flex;
      justify-content: flex-end;
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
    top: 8.625rem;
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
      gap: 1.125rem 0;
      border-right: 1px solid #d4d4d8;
    }
    .note-item {
      flex-direction: column;
      align-items: flex-start;
      gap: 0.625rem 0;
    }
    .shipping-address-value,
    .note-value {
      line-height: 150%;
    }
    .shipping-address-value {
      margin-top: -0.1875rem;
    }
  }
  .summary {
    padding-left: 4rem;
    display: flex;
    flex-direction: column;
    gap: 0.875rem 0;
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
    margin: 2.75rem 2.5rem 0;
    .order-items-label {
      position: relative;
      margin: 0 0 1.5rem;
      padding: 0 0 1.25rem;
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
    .items {
      .item {
        margin: 1.125rem 0 0;
        padding: 1.125rem 1.125rem 1.3125rem 1rem;
        background-color: #fff;
        border: 1px solid #dddde2;
        border-radius: 0.5rem;
        box-shadow: 0px 1px 2px 0px rgba(0, 0, 0, 0.05);
        .main-details {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 0 2rem;
          .featured-img {
            margin-right: 1rem;
            width: 2.25rem;
            display: flex;
            flex-direction: column;
            img {
              max-height: 3.25rem;
              width: auto;
              object-fit: contain;
            }
          }
          .top-row {
            margin-bottom: 1.25rem;
            display: flex;
            justify-content: space-between;
            align-items: center;
            gap: 0 1rem;
            padding-bottom: 1rem;
            border-bottom: 1px solid #d4d4d8;
          }
          .item-name,
          .merch-code {
            color: #09090b;
            font-size: 0.875rem;
            font-weight: 600;
            line-height: 130%;
          }
          .color {
            margin: 0;
            display: flex;
            align-items: center;
            color: #52525b;
            font-size: 0.875rem;
            font-weight: 500;
            line-height: 100%;
            span {
              margin: 0 0.375rem 0 0;
            }
            .dot {
              flex-shrink: 0;
              margin: 0 0.375rem 0 0;
              display: inline-block;
              height: 0.875rem;
              width: 0.875rem;
              border: 1px solid rgba(0, 0, 0, 0.4);
              border-radius: 9999px;
            }
          }
          .artwork-id,
          .color {
            margin: 0;
            color: #52525b;
            font-size: 0.875rem;
            font-weight: 500;
            line-height: 130%;
            span {
              color: #27272a;
            }
          }
          .item-data {
            margin: 1.375rem 0 0;
            display: grid;
            grid-template-columns: 1fr 1fr;
            .quantity-and-size,
            .item-total {
              color: #52525b;
              font-size: 0.875rem;
              font-weight: 500;
              line-height: 130%;
              span {
                color: #09090b;
              }
              &.item-total {
                text-align: right;
              }
            }
            .quantity-and-size {
              display: grid;
              grid-template-columns: 2rem 2.75rem 1fr;
              .x {
                margin: -0.0625rem 0.5rem 0;
                color: #a1a1aa;
              }
            }
          }
        }
      }
    }
  }
  .personalization-details {
    margin: 0.25rem 0 0 3.25rem;
    padding: 1rem 0 0;
    .title {
      position: relative;
      padding: 0 0 1rem;
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
        background-color: #fff;
        z-index: 1;
      }
    }
    .items {
      margin: 0.4375rem 0 0;
      display: flex;
      flex-direction: column;
      padding: 0 0.625rem;
      background-color: #fafafa;
      border: 1px solid #e4e4e7;
      border-radius: 0.25rem;
      .personalization-item {
        padding: 0.6875rem 0.3125rem;
        display: flex;
        justify-content: space-between;
        align-items: center;
        border-bottom: 1px solid #d4d4d8;
        &:last-of-type {
          border-bottom: none;
        }
        p {
          margin: 0;
          &.label,
          &.value {
            font-size: 0.875rem;
            font-weight: 500;
            line-height: 100%;
          }
          &.label {
            margin: 0 0.625rem 0 0;
            color: #18181b;
          }
          &.value {
            color: #3f3f46;
          }
        }
        .location {
          margin: 0 0 0 0.5rem;
          padding: 0.125rem 0.25rem;
          font-size: 0.625rem;
          font-weight: 600;
          color: #52525b;
          background-color: #fff;
          border-radius: 0.1875rem;
          border: 1px solid #dddde2;
          box-shadow: 0px 1px 2px 0px rgba(0, 0, 0, 0.05);
        }
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
