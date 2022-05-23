import React from 'react';
import Link from 'next/link';
import styled from 'styled-components';
import { format } from 'date-fns';
import { Order, Store } from '../interfaces';
import { formatPhoneNumber, formatToMoney } from '../utils';

type Props = {
  order?: Order;
  store?: Store;
};

export default function PrintableOrder({ order, store }: Props) {
  if (store && order) {
    return (
      <PrintableOrderStyles aria-hidden="true">
        <div className="header">
          <Link href="/">
            <a className="logo">
              <img
                src="/images/logo.png"
                alt="Macaport logo in front of mountains"
              />
            </a>
          </Link>
          <div className="support-links">
            <a href="mailto:support@macaport.com">support@macaport.com</a>
            <a href="https://macaport.com/">www.macaport.com</a>
          </div>
        </div>

        <div className="body">
          <div className="top-row">
            <div className="customer">
              <div className="name bold-item">
                {order.customer.firstName} {order.customer.lastName}
              </div>
              <div className="email normal-item">{order.customer.email}</div>
              <div className="phone normal-item">
                {formatPhoneNumber(order.customer.phone)}
              </div>
            </div>
            <div className="id-date">
              <div className="item id bold-item">
                <span>Order #</span>
                {order.orderId}
              </div>
              <div className="item normal-item stripe-id">{order.stripeId}</div>
              <div className="item normal-item">
                {format(new Date(order.createdAt), "MMM. dd, yyyy 'at' h:mmaa")}
              </div>
            </div>
          </div>
          <div className="details-row section">
            <div>
              <h3>Shipping Details</h3>
              <div className="item">
                <div className="label">Store</div>
                <div className="value">{order.store.name}</div>
              </div>
              {store.requireGroupSelection && (
                <div className="item">
                  <div className="label">{store.groupTerm}</div>
                  <div className="value">{order.group}</div>
                </div>
              )}
              <div className="item">
                <div className="label">Method</div>
                <div className="value">{order.shippingMethod}</div>
              </div>
              {order.shippingMethod === 'Direct' && (
                <div className="item">
                  <div className="label">Address</div>
                  <div className="value">
                    {order.shippingAddress.street} <br />
                    {order.shippingAddress.street2 && (
                      <>
                        {order.shippingAddress.street2} <br />
                      </>
                    )}
                    {order.shippingAddress.city}, {order.shippingAddress.state}{' '}
                    {order.shippingAddress.zipcode}
                  </div>
                </div>
              )}
            </div>
            <div className="order-summary-row">
              <div className="order-summary">
                <h3>Order Summary</h3>
                <div className="item">
                  <div className="label">Subtotal</div>
                  <div className="value">
                    {formatToMoney(order.summary.subtotal, true)}
                  </div>
                </div>
                <div className="item">
                  <div className="label">Sales Tax</div>
                  <div className="value">
                    {formatToMoney(order.summary.salesTax, true)}
                  </div>
                </div>
                <div className="item">
                  <div className="label">Shipping</div>
                  <div className="value">
                    {formatToMoney(order.summary.shipping, true)}
                  </div>
                </div>
                <div className="item total">
                  <div className="label">Total</div>
                  <div className="value">
                    {formatToMoney(order.summary.total, true)}
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="order-items section">
            <h3>Order Items</h3>
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Color</th>
                    <th className="text-center">Size</th>
                    <th className="text-center">Price</th>
                    <th className="text-center">Qty.</th>
                    <th className="text-right">Item Total</th>
                  </tr>
                </thead>
                <tbody>
                  {order.items.map((item, index) => (
                    <tr key={`${item.sku.id}-${index}`}>
                      <td>
                        <div className="order-item-name">{item.name}</div>
                        {item.personalizationAddons.length > 0 && (
                          <div className="addon-items">
                            {item.personalizationAddons.map(addon => (
                              <div key={addon.id} className="addon-item">
                                <div className="flex-row-center">
                                  <span className="addon-label">
                                    {addon.addon}:
                                  </span>
                                  {addon.value}{' '}
                                  <span className="location">
                                    [{addon.location.toLowerCase()}]
                                  </span>
                                </div>
                                {addon.subItems.length > 0 && (
                                  <>
                                    {addon.subItems.map(subitem => (
                                      <div
                                        key={subitem.id}
                                        className="addon-item flex-row-center"
                                      >
                                        <span className="addon-label">
                                          {subitem.addon}:
                                        </span>
                                        {subitem.value}{' '}
                                        <span className="location">
                                          [{subitem.location.toLowerCase()}]
                                        </span>
                                      </div>
                                    ))}
                                  </>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </td>
                      <td>{item.sku.color.label}</td>
                      <td className="text-center">{item.sku.size.label}</td>
                      <td className="text-center">
                        {formatToMoney(item.price)}
                      </td>
                      <td className="text-center">{item.quantity}</td>
                      <td className="text-right">
                        {formatToMoney(item.itemTotal, true)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </PrintableOrderStyles>
    );
  } else {
    return null;
  }
}

const PrintableOrderStyles = styled.div`
  display: none;

  @media print {
    page-break-before: always;
    display: block;
    margin: 0 auto;
    padding: 56px 32px;
    width: 8.5in;
    height: 11in;

    @page {
      margin: 0 auto;
      padding: 56px 32px;
      width: 8.5in;
      height: 11in;
    }
  }

  h3 {
    margin: 0 0 14px;
    font-size: 14px;
    font-weight: 500;
    color: #18181b;
  }

  .section {
    margin: 40px 0 0;
  }

  .header {
    padding: 0 0 12px;
    display: flex;
    justify-content: space-between;
    border-bottom: 1px solid #a1a1aa;
  }

  .support-links {
    display: flex;
    flex-direction: column;
    justify-content: flex-end;
    gap: 4px;
    text-align: right;

    a {
      font-size: 13px;
      color: #3f3f46;
    }
  }

  .body {
    padding: 18px 0;
  }

  .top-row {
    display: flex;
    justify-content: space-between;
  }

  .bold-item {
    font-size: 18px;
    font-weight: 600;
    color: #18181b;
  }

  .normal-item {
    font-size: 13px;
    color: #27272a;
  }

  .name {
    margin: 0 0 2px;
    font-size: 20px;
  }

  .email,
  .phone {
    margin: 0 0 4px;
  }

  .id-date {
    display: flex;
    flex-direction: column;
    gap: 4px;

    .item {
      display: flex;
      justify-content: flex-end;

      &.id span {
        margin-right: 6px;
      }

      &.stripe-id {
        font-size: 12px;
      }
    }
  }

  .details-row {
    display: flex;
    gap: 160px;

    .item {
      margin: 0 0 3px;
      display: flex;
      align-items: center;
    }

    .label {
      width: 80px;
      font-size: 12px;
      font-weight: 600;
      color: #27272a;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .value {
      font-size: 13px;
      color: #18181b;
    }
  }

  .table-container {
    padding: 0 10px;
    border: 1px solid #a1a1aa;
    border-radius: 4px;
  }

  table {
    border-collapse: collapse;
    width: 100%;
  }

  td,
  th {
    &:first-of-type {
      padding-left: 0;
    }

    &:last-of-type {
      padding-right: 0;
    }
  }

  th {
    padding: 11px 8px;
    font-size: 9px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: #18181b;
    border-bottom: 1px solid #a1a1aa;
  }

  td {
    padding: 8px;
    font-size: 11px;
    color: #18181b;
    border-bottom: 1px solid #a1a1aa;
  }

  tr {
    &:last-of-type {
      td {
        border-bottom: none;
      }
    }
  }

  .order-item-name {
    margin: 0 0 2px;
    font-weight: 500;
  }

  .order-item-id {
    font-size: 11px;
    color: #a1a1aa;
  }

  .addon-items {
    margin: 0.1875rem 0 0;
  }

  .addon-item {
    margin: 2px 0 0;
    font-size: 10px;

    span {
      color: #9ca3af;

      &.addon-label {
        margin: 0 0.25rem 0 0;
      }

      &.location {
        margin: 0 0 0 0.25rem;
        font-size: 7px;
      }
    }
  }

  .flex-row-center {
    display: flex;
    align-items: center;
  }

  .order-summary-row {
    display: flex;
    justify-content: flex-end;
  }

  .order-summary {
    width: 220px;

    .item {
      margin: 0 0 3px;
      display: flex;
      justify-content: space-between;
      font-size: 13px;
      color: #18181b;

      &.total,
      &.total .label {
        font-weight: 600;
        color: #18181b;
      }
    }
  }
`;
