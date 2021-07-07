import React from 'react';
import { GetServerSideProps } from 'next';
import { ObjectID } from 'mongodb';
import { getSession } from 'next-auth/client';
import Link from 'next/link';
import styled from 'styled-components';
import { connectToDb, order } from '../db';
import { Order as OrderInterface } from '../interfaces';
import { formatPhoneNumber, formatToMoney } from '../utils';
import Layout from '../components/Layout';

const OrderStyles = styled.div`
  .title {
    padding: 1.625rem 2.5rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 1px solid #e5e7eb;

    .details {
      display: flex;
      align-items: center;
      gap: 1.25rem;
    }

    .buttons {
      display: flex;
      align-items: center;
      box-shadow: rgba(0, 0, 0, 0) 0px 0px 0px 0px,
        rgba(0, 0, 0, 0) 0px 0px 0px 0px, rgba(0, 0, 0, 0.05) 0px 1px 2px 0px;

      a {
        padding: 0.5rem 1rem;
        display: flex;
        justify-content: center;
        align-items: center;
        border: 1px solid #d1d5db;

        &:hover {
          background-color: #f9fafb;
        }

        &:focus {
          outline: 2px solid transparent;
          outline-offset: 2px;
          border-color: #2563eb;
          box-shadow: rgb(255, 255, 255) 0px 0px 0px 0px,
            rgb(37, 99, 235) 0px 0px 0px 1px, rgba(0, 0, 0, 0) 0px 0px 0px 0px;
          z-index: 100;
        }

        &:first-of-type {
          margin-right: -1px;
          border-radius: 0.375rem 0 0 0.375rem;
        }

        &:last-of-type {
          border-radius: 0 0.375rem 0.375rem 0;
        }
      }
    }

    svg {
      height: 1.25rem;
      width: 1.25rem;
      color: #6b7280;
    }
  }

  h2 {
    margin: 0;
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 1.375rem;
    font-weight: 600;
    color: #111827;
  }

  h3 {
    margin: 0 0 1rem;
    font-size: 1.5rem;
    font-weight: 600;
    color: #1f2937;
  }

  h4 {
    margin: 0 0 1rem;
    font-size: 1.125rem;
    font-weight: 600;
    color: #374151;
  }

  .main-content {
    padding: 3rem;
    position: relative;
    max-width: 80rem;
    width: 100%;
  }

  .edit-order-link {
    padding: 0.5rem 1.25rem;
    display: flex;
    justify-content: center;
    align-items: center;
    position: absolute;
    top: 2rem;
    right: 2rem;
    font-size: 0.9375rem;
    font-weight: 500;
    color: #374151;
    border: 1px solid #d1d5db;
    border-radius: 0.25rem;
    box-shadow: rgba(0, 0, 0, 0) 0px 0px 0px 0px,
      rgba(0, 0, 0, 0) 0px 0px 0px 0px, rgba(0, 0, 0, 0.05) 0px 1px 2px 0px;

    &:hover {
      background-color: #f9fafb;
    }

    svg {
      margin: 0 0.375rem 0 0;
      height: 1.125rem;
      width: 1.125rem;
      color: #9ca3af;
    }
  }

  .section {
    margin: 4rem 0;
  }

  .grid-cols-2 {
    display: grid;
    grid-template-columns: 1fr 1fr;
    width: 100%;
  }

  .info-item {
    padding: 1rem 0;
    display: flex;
    flex-direction: column;
    font-size: 1rem;
    color: #111827;
    line-height: 1.35;
  }

  .label {
    margin: 0 0 0.375rem;
    font-size: 0.8125rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.0375em;
    color: #89909d;
  }

  .order-status {
    span {
      display: inline-flex;
      align-items: center;
      padding: 0.375rem 0.875rem;
      font-size: 0.875rem;
      font-weight: 600;
      letter-spacing: 0.025em;
      color: #374151;
      border-radius: 9999px;
      background: #fff;
      border: 1px solid #d1d5db;

      .dot {
        margin: 0 0.75rem 0 0;
        height: 0.375rem;
        width: 0.375rem;
        border-radius: 9999px;
        background-color: #374151;
      }

      &.unfulfilled .dot {
        background-color: #ef4444;
      }

      &.fulfilled .dot {
        background-color: #f59e0b;
      }

      &.completed .dot {
        background-color: #10b981;
      }
    }
  }

  /****  ORDER ITEMS ****/

  table {
    width: 100%;
    border-collapse: collapse;
  }

  td,
  th {
    padding: 0.625rem 2rem;

    &:first-of-type {
      padding-left: 0;
    }

    &:last-of-type {
      padding-right: 0;
      text-align: right;
    }

    &.text-center {
      text-align: center;
    }
  }

  th {
    font-size: 0.8125rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.025em;
    color: #89909d;
    text-align: left;
    border-bottom: 1px solid #e5e7eb;
  }

  td {
    font-size: 0.9375rem;
    font-weight: 500;
    color: #1f2937;
    border-bottom: 1px solid #e5e7eb;

    .product-name {
      margin: 0 0 0.125rem;
      font-size: 1rem;
      font-weight: 500;
    }

    .product-id {
      color: #89909d;
    }
  }

  /**** ORDER SUMMARY ****/

  .order-summary {
    display: flex;
    justify-content: flex-end;

    .wrapper {
      max-width: 22rem;
      width: 100%;
    }
  }

  .summary-item {
    padding: 0.625rem 0;
    display: flex;
    justify-content: space-between;
    border-bottom: 1px solid #e5e7eb;

    &:last-of-type {
      border-bottom: none;
    }
  }

  .summary-header {
    font-size: 1rem;
    font-weight: 500;
    color: #6b7280;

    &.total {
      font-weight: 600;
      color: #111827;
    }
  }

  .summary-data {
    font-size: 1rem;
    color: #111827;

    &.total {
      font-weight: 600;
      color: #059669;
    }
  }
`;

type Props = {
  order: OrderInterface;
  error?: string;
};

export default function Order({ order, error }: Props) {
  if (error) {
    return (
      <Layout>
        <OrderStyles>
          <div className="title">
            <h2>Order</h2>
          </div>
          <div className="main-content">
            <p>Error: {error}</p>
          </div>
        </OrderStyles>
      </Layout>
    );
  }

  return (
    <Layout>
      <OrderStyles>
        <div className="title">
          <div className="details">
            <h2>Order #{order.orderId}</h2>
            <div className="order-status">
              <span
                className={
                  order.orderStatus === 'Unfulfilled'
                    ? 'unfulfilled'
                    : order.orderStatus === 'Fulfilled'
                    ? 'fulfilled'
                    : order.orderStatus === 'Completed'
                    ? 'completed'
                    : ''
                }
              >
                <div className="dot" />
                {order.orderStatus}
              </span>
            </div>
          </div>
          <div className="buttons">
            <Link href="#">
              <a>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              </a>
            </Link>
            <Link href="#">
              <a>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              </a>
            </Link>
          </div>
        </div>
        <div className="main-content">
          <Link href={'#'}>
            <a className="edit-order-link">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"
                />
              </svg>
              Edit Order
            </a>
          </Link>
          <h3>
            {order.customer.firstName} {order.customer.lastName}
          </h3>
          <div className="grid-cols-2">
            <div>
              <div className="info-item">
                <div className="label">Order Date</div>
                {new Date(order.createdAt).toDateString()}
              </div>
              <div className="info-item">
                <div className="label">Customer Email</div>
                {order.customer.email}
              </div>
              <div className="info-item">
                <div className="label">Customer Phone</div>
                {formatPhoneNumber(order.customer.phone)}
              </div>
            </div>
            <div>
              <div className="info-item">
                <div className="label">Store</div>
                New London High School XC
              </div>
              <div className="info-item">
                <div className="label">Shipping Method</div>
                {order.shippingMethod}
              </div>
              {order.shippingMethod === 'Direct' && (
                <div className="info-item">
                  <div className="label">Shipping Address</div>
                  <span>
                    {order.shippingAddress?.street}{' '}
                    {order.shippingAddress?.street2}
                    <br />
                    {order.shippingAddress?.city},{' '}
                    {order.shippingAddress?.state}{' '}
                    {order.shippingAddress?.zipcode}
                  </span>
                </div>
              )}
            </div>
          </div>
          <div className="section">
            <h4>Order Items</h4>
            <div className="order-items">
              <table>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Color</th>
                    <th>Size</th>
                    <th>Price</th>
                    <th className="text-center">Qty.</th>
                    <th>Item Total</th>
                  </tr>
                </thead>
                <tbody>
                  {order.items.map(i => (
                    <tr key={i.productId} className="order-item">
                      <td>
                        <div className="product-name">{i.name}</div>
                        <div className="product-id">{i.productId}</div>
                      </td>
                      <td>{i.color}</td>
                      <td>{i.size}</td>
                      <td>{formatToMoney(i.price)}</td>
                      <td className="text-center">{i.quantity}</td>
                      <td>{formatToMoney(i.itemTotal, true)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <div className="section order-summary">
            <div className="wrapper">
              <h4>Order Summary</h4>
              <div className="summary-item">
                <div className="summary-header">Subtotal</div>
                <div className="summary-data">
                  {formatToMoney(order.summary.subtotal, true)}
                </div>
              </div>
              <div className="summary-item">
                <div className="summary-header">Shipping</div>
                <div className="summary-data">
                  {formatToMoney(order.summary.shipping, true)}
                </div>
              </div>
              <div className="summary-item">
                <div className="summary-header total">Order Total</div>
                <div className="summary-data total">
                  {formatToMoney(order.summary.total, true)}
                </div>
              </div>
            </div>
          </div>
        </div>
      </OrderStyles>
    </Layout>
  );
}

export const getServerSideProps: GetServerSideProps = async context => {
  try {
    const session = await getSession(context);
    if (!session) {
      return {
        props: {},
        redirect: {
          permanent: false,
          destination: '/login',
        },
      };
    }

    if (!context.query.id) {
      throw new Error('An Order ID must be provided.');
    }

    const orderId = Array.isArray(context.query.id)
      ? context.query.id[0]
      : context.query.id;

    const { db } = await connectToDb();
    const result = await order.getOrder(db, { _id: new ObjectID(orderId) });
    return {
      props: {
        order: result,
      },
    };
  } catch (error) {
    console.error(error);
    return {
      props: {
        error: error.message,
      },
    };
  }
};
