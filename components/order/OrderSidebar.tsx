import React from 'react';
import styled from 'styled-components';
import { format } from 'date-fns';

import Sidebar from '../Sidebar';
import { Order, Store } from '../../interfaces';
import OrderStatusButton from './OrderStatusButton';
import { formatPhoneNumber, formatToMoney } from '../../utils';

type Props = {
  closeSidebar: () => void;
  isOpen: boolean;
  selectedOrder: Order | undefined;
  store: Store;
};

export default function OrderSidebar({
  closeSidebar,
  isOpen,
  selectedOrder,
  store,
}: Props) {
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
    summary,
  } = selectedOrder;
  const { email, firstName, lastName, phone } = customer;
  const { subtotal, salesTax, shipping, total, stripeFee } = summary;

  const renderShippingAddressLabel = () => {
    if (shippingMethod === 'Direct') {
      return 'Shipping address';
    } else if (shippingMethod === 'Primary') {
      return 'Primary location';
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
      return null;
    }
  };

  return (
    <Sidebar headerTitle="Order details" {...{ isOpen, closeSidebar }}>
      <OrderSidebarStyles>
        <div className="flex space-between align-end">
          <div>
            <p className="name">
              {firstName} {lastName}
            </p>
            <p className="email">{email}</p>
            <p className="phone">{formatPhoneNumber(phone)}</p>
          </div>
          <div>
            <div className="status">
              <OrderStatusButton order={selectedOrder} store={store} />
            </div>
            <p className="date">{format(new Date(createdAt), "P 'at' p")}</p>
            <p className="order-id">#{orderId}</p>
          </div>
        </div>
        <div className="section">
          <h3 className="section-title">
            <span>Shipping details</span>
          </h3>
          <div className="item">
            <p className="label">Shipping method:</p>
            <p className="value">{shippingMethod}</p>
          </div>
          {['Direct', 'Primary'].includes(shippingMethod) ? (
            <div className="item">
              <p className="label">{renderShippingAddressLabel()}:</p>
              <p className="value address">{renderShippingAddressValue()}</p>
            </div>
          ) : null}
        </div>
        {store.requireGroupSelection ? (
          <div className="section">
            <h3 className="section-title">
              <span>Group</span>
            </h3>
            <div className="item">
              <p className="label">{store.groupTerm}:</p>
              <p className="value">{group}</p>
            </div>
          </div>
        ) : null}
        <div className="section">
          <h3 className="section-title order-note">
            <span>Order note</span>
          </h3>
          <p className="order-note">{note ? note : 'None provided'}</p>
        </div>
        <div className="section">
          <h3 className="section-title">
            <span>Order items</span>
          </h3>
          <div className="order-items">
            {items.map((item, index) => (
              <div key={index} className="order-item">
                <div className="order-header">
                  <p className="item-name">{item.name}</p>
                  <p className="item-total">
                    {formatToMoney(item.itemTotal, true)}
                  </p>
                </div>
                <h3 className="section-title">
                  <span>Item details</span>
                </h3>
                <div className="item-details">
                  <div className="item-img">
                    <img src={item.image} alt={item.name} />
                  </div>
                  <div className="details">
                    <div className="item">
                      <p className="label">Artwork:</p>
                      <p className="value">
                        {item.artworkId ? item.artworkId : 'Not provided'}
                      </p>
                    </div>
                    <div className="item">
                      <p className="label">Color:</p>
                      <p className="value color">
                        <span
                          className="dot"
                          style={{ backgroundColor: item.sku.color.hex }}
                        />
                        {item.sku.color.label}
                      </p>
                    </div>
                    <div className="item">
                      <p className="label">Size:</p>
                      <p className="value">{item.sku.size.label}</p>
                    </div>
                    <div className="item">
                      <p className="label">Qty:</p>
                      <p className="value">{item.quantity}</p>
                    </div>
                    <div className="item">
                      <p className="label">Price:</p>
                      <p className="value">
                        {formatToMoney(item.sku.size.price, true)}
                      </p>
                    </div>
                  </div>
                </div>
                {item.personalizationAddons.length > 0 ? (
                  <div>
                    <h3 className="section-title">
                      <span>Item personalization</span>
                    </h3>
                    {item.personalizationAddons.map(addon => (
                      <>
                        <div key={addon.itemId} className="addon-item">
                          <p className="label">{addon.addon}:</p>
                          <p className="value">
                            {addon.value}
                            <span className="location">[{addon.location}]</span>
                          </p>
                        </div>
                        {addon.subItems.map(subItem => (
                          <div key={subItem.itemId} className="addon-item">
                            <p className="label">{subItem.addon}:</p>
                            <p className="value">
                              {subItem.value}
                              <span className="location">
                                [{subItem.location}]
                              </span>
                            </p>
                          </div>
                        ))}
                      </>
                    ))}
                  </div>
                ) : null}
              </div>
            ))}
          </div>
        </div>
        <div className="section summary">
          <h3 className="section-title">
            <span>Order summary</span>
          </h3>
          <div className="flex space-between align-end">
            <div>
              <div className="item">
                <p className="label">Subtotal:</p>
                <p className="value">{formatToMoney(subtotal, true)}</p>
              </div>
              <div className="item">
                <p className="label">Sales tax:</p>
                <p className="value">{formatToMoney(salesTax, true)}</p>
              </div>
              <div className="item">
                <p className="label">Shipping:</p>
                <p className="value">{formatToMoney(shipping, true)}</p>
              </div>
              <div className="item">
                <p className="label">Total:</p>
                <p className="value">{formatToMoney(total, true)}</p>
              </div>
            </div>
            <div>
              <div className="item">
                <p className="label">Stripe fee:</p>
                <p className="value">-{formatToMoney(stripeFee, true)}</p>
              </div>
              <div className="item">
                <p className="label">Net:</p>
                <p className="value">
                  {formatToMoney(total - stripeFee, true)}
                </p>
              </div>
            </div>
          </div>
        </div>
      </OrderSidebarStyles>
    </Sidebar>
  );
}

const OrderSidebarStyles = styled.div`
  padding: 2rem;
  .flex {
    display: flex;
  }
  .space-between {
    justify-content: space-between;
  }
  .align-end {
    align-items: flex-end;
  }
  .section {
    margin-top: 2rem;
    &.summary {
      .label {
        max-width: 7rem;
      }
    }
    .section-title {
      margin: 0 0 1.75rem;
      padding: 0;
      position: relative;
      border: none;
      &.order-note {
        margin-bottom: 1.25rem;
      }
      &:after {
        content: '';
        position: absolute;
        left: 0;
        top: 0.9375rem;
        width: 100%;
        height: 1px;
        background-color: #d4d4d8;
        z-index: -1;
      }
      span {
        padding: 0 1.25rem 0 0;
        background-color: #f9fafb;
        color: #18181b;
        font-size: 0.75rem;
        font-weight: 700;
        line-height: 100%;
        letter-spacing: 0.15rem;
        text-transform: uppercase;
      }
    }
  }
  p {
    margin: 0;
    &.name {
      color: #09090b;
      font-size: 1.125rem;
      font-weight: 600;
      line-height: 100%;
      letter-spacing: -0.0225rem;
    }
    &.email,
    &.phone,
    &.date,
    &.order-id {
      color: #52525b;
      font-family: 'Inter', sans-serif;
      font-size: 0.9375rem;
      font-weight: 500;
      line-height: 100%;
    }
    &.date,
    &.order-id {
      text-align: right;
    }
    &.email,
    &.date {
      margin-top: 0.875rem;
    }
    &.phone,
    &.order-id {
      margin-top: 0.625rem;
    }
    &.order-note {
      margin: 0;
      color: #71717a;
      font-size: 0.9375rem;
      font-weight: 500;
      line-height: 150%;
    }
  }
  .status {
    display: flex;
    justify-content: flex-end;
  }
  .item-details {
    display: flex;
    align-items: center;
    gap: 0 1.25rem;
    .item-img {
      width: 5.5rem;
      img {
        width: 100%;
      }
    }
    .item {
      margin: 0.625rem 0 0;
      &:first-of-type {
        margin-top: 0;
      }
      .label {
        width: 5rem;
      }
    }
  }
  .item {
    margin: 0 0 1.125rem;
    display: flex;
    &:last-of-type {
      margin-bottom: 0;
    }
    .label,
    .value {
      font-size: 0.9375rem;
      font-weight: 500;
      line-height: 100%;
    }
    .label {
      width: 9rem;
      color: #09090b;
    }
    .value {
      color: #71717a;
      &.address {
        margin-top: -0.125rem;
        line-height: 150%;
      }
      &.color {
        display: flex;
        align-items: center;
        gap: 0 0.5rem;
        .dot {
          margin: 0;
          display: inline-block;
          height: 0.875rem;
          width: 0.875rem;
          border-radius: 9999px;
          border: 1px solid rgba(0, 0, 0, 0.35);
        }
      }
    }
  }
  .order-items {
    .order-item {
      margin-top: 1.125rem;
      padding: 1.5rem 1.375rem;
      background-color: #fff;
      border: 1px solid #dddde2;
      border-radius: 0.375rem;
      box-shadow: 0px 1px 2px 0px rgba(0, 0, 0, 0.05);
      &:first-of-type {
        margin-top: 0;
      }
      .section-title {
        margin: 1rem 0 1.125rem;
        span {
          z-index: 10;
          background: #fff;
          position: relative;
        }
        &:after {
          z-index: 0;
        }
      }
      .order-header {
        display: grid;
        grid-template-columns: 1fr 6rem;
        grid-gap: 0 1rem;
        .item-name,
        .item-total {
          color: #09090b;
          font-size: 0.9375rem;
          font-weight: 500;
          line-height: 100%;
        }
        .item-name {
          line-height: 130%;
        }
        .item-total {
          text-align: right;
        }
      }
      .addon-item {
        margin-top: 0.75rem;
        display: flex;
        &:first-of-type {
          margin-top: 1rem;
        }
        .label,
        .value {
          font-size: 0.9375rem;
          font-weight: 500;
          line-height: 100%;
        }
        .label {
          min-width: 6rem;
          color: #27272a;
        }
        .value {
          color: #52525b;
          .location {
            margin-left: 0.3125rem;
            font-size: 0.6875rem;
            color: #71717a;
          }
        }
      }
    }
  }
`;
