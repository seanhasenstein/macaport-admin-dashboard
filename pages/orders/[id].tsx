import React from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { useQueryClient, useQuery, useMutation } from 'react-query';
import styled from 'styled-components';
import { useSession } from '../../hooks/useSession';
import { Store, Order as OrderInterface, Note } from '../../interfaces';
import { formatPhoneNumber, formatToMoney, createId } from '../../utils';
import Layout from '../../components/Layout';
import Notes from '../../components/Notes';

export default function Order() {
  const [session, sessionLoading] = useSession({ required: true });
  const router = useRouter();
  const queryClient = useQueryClient();

  const {
    isLoading,
    isError,
    error,
    data: order,
  } = useQuery<OrderInterface>(
    ['order', router.query.id],
    async () => {
      if (!router.query.id) return;
      const response = await fetch(
        `/api/orders/${router.query.id}?storeId=${router.query.storeId}`
      );

      if (!response.ok) {
        throw new Error('Failed to fetch the order.');
      }
      const data = await response.json();
      return data.order;
    },
    {
      initialData: () => {
        const stores = queryClient.getQueryData<Store[]>('stores');
        const store = stores?.find(s => s._id === router.query.storeId);
        return store?.orders.find(o => o.orderId === router.query.id);
      },
      initialDataUpdatedAt: () =>
        queryClient.getQueryState('stores')?.dataUpdatedAt,
      staleTime: 600000,
    }
  );

  const addNoteMutation = useMutation(
    async (noteText: string) => {
      if (!order) return;

      const note: Note = {
        id: createId('note'),
        text: noteText,
        createdAt: `${new Date()}`,
      };
      const prevNotes = order.notes || [];

      const response = await fetch(
        `/api/orders/update/notes?id=${router.query.storeId}&orderId=${router.query.id}`,
        {
          method: 'post',
          body: JSON.stringify({ notes: [...prevNotes, note] }),
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to add the note.');
      }

      const data = await response.json();
      return data.store;
    },
    {
      onSuccess: data => {
        queryClient.invalidateQueries('stores', { exact: true });
        queryClient.invalidateQueries(['store', data._id]);
        queryClient.invalidateQueries(['order', router.query.id]);
      },
    }
  );

  const updateNoteMutation = useMutation(
    async (note: Note) => {
      const notes = order?.notes.map(n => {
        if (n.id === note.id) {
          return note;
        } else {
          return n;
        }
      });

      const response = await fetch(
        `/api/orders/update/notes?id=${router.query.storeId}&orderId=${router.query.id}`,
        {
          method: 'post',
          body: JSON.stringify({ notes }),
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to update the note.');
      }

      const data = await response.json();
      return data.store;
    },
    {
      onSuccess: data => {
        queryClient.invalidateQueries('stores', { exact: true });
        queryClient.invalidateQueries(['store', data._id]);
        queryClient.invalidateQueries(['order', router.query.id]);
      },
    }
  );

  const deleteNoteMutation = useMutation(
    async (id: string) => {
      const notes = order?.notes.filter(n => n.id !== id);

      const response = await fetch(
        `/api/orders/update/notes?id=${router.query.storeId}&orderId=${router.query.id}`,
        {
          method: 'post',
          body: JSON.stringify({ notes }),
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to delete the note.');
      }

      const data = await response.json();
      return data.store;
    },
    {
      onSuccess: data => {
        queryClient.invalidateQueries('stores', { exact: true });
        queryClient.invalidateQueries(['store', data._id]);
        queryClient.invalidateQueries(['order', router.query.id]);
      },
    }
  );

  if (sessionLoading || !session) return <div />;

  return (
    <Layout title="Order | Macaport Dashboard">
      <OrderStyles>
        {isLoading && (
          <>
            <div className="title">
              <div className="details">
                <h2>Order #{router.query.id}</h2>
              </div>
            </div>
            <div className="main-content">
              <div className="wrapper">
                <div>Loading Order...</div>
              </div>
            </div>
          </>
        )}
        {isError && error instanceof Error && (
          <>
            <div className="title">
              <div className="details">
                <h2>Order Error!</h2>
              </div>
            </div>
            <div className="main-content">
              <div className="wrapper">
                <div>Error: {error.message}</div>
              </div>
            </div>
          </>
        )}
        {order && (
          <>
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
              {/* <div className="buttons">
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
              </div> */}
            </div>
            <div className="print-only print-title">
              <div className="print-logo">
                <img src="/images/logo.png" alt="Macaport logo" />
              </div>
              <div className="print-title-details">
                <div className="print-item order-number">
                  <span>Order #</span>
                  {order.orderId}
                </div>
                <div className="print-item">
                  <span>Date:</span>
                  {new Date(order.createdAt).toDateString()}
                </div>
              </div>
            </div>
            <div className="main-content">
              <div className="wrapper">
                <div className="header">
                  <div>
                    <h3>
                      {order.customer.firstName} {order.customer.lastName}
                    </h3>
                    <div className="contact-info">
                      <div className="item screen-only">
                        <div className="label">Order Date</div>
                        <div className="data">
                          {new Date(order.createdAt).toDateString()}
                        </div>
                      </div>
                      <div className="item">
                        <div className="label">Email</div>
                        <div className="data">{order.customer.email}</div>
                      </div>
                      <div className="item">
                        <div className="label">Phone</div>
                        <div className="data">
                          {formatPhoneNumber(order.customer.phone)}
                        </div>
                      </div>
                      <div className="item screen-only">
                        <div className="label">Transaction Id</div>
                        <div className="data">{order.stripeId}</div>
                      </div>
                    </div>
                  </div>
                  <div className="print-only macaport-contact">
                    <div>support@macaport.com</div>
                    <div>www.macaport.com</div>
                  </div>
                  <div className="action-buttons">
                    <Link
                      href={`/orders/update?id=${order.orderId}&storeId=${order.store.id}`}
                    >
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
                    <button
                      type="button"
                      className="print-button"
                      onClick={() => window.print()}
                    >
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
                          d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"
                        />
                      </svg>
                      Print Order
                    </button>
                  </div>
                </div>
                <div className="grid-cols-2 section">
                  <div>
                    <h4>Shipping Details</h4>
                    <div className="info-item">
                      <div className="label">Store</div>
                      {order.store.name}
                    </div>
                    <div className="info-item">
                      <div className="label">Method</div>
                      {order.shippingMethod}
                    </div>
                    {order.shippingMethod === 'Direct' ? (
                      <div className="info-item">
                        <div className="label">Address</div>
                        <span>
                          {order.shippingAddress?.street}{' '}
                          {order.shippingAddress?.street2}
                          <br />
                          {order.shippingAddress?.city},{' '}
                          {order.shippingAddress?.state}{' '}
                          {order.shippingAddress?.zipcode}
                        </span>
                      </div>
                    ) : order.shippingMethod === 'Primary' ? (
                      <div className="info-item">
                        <div className="label">Address</div>
                        <span>
                          {order.shippingAddress.name}
                          <br />
                          {order.shippingAddress?.street}{' '}
                          {order.shippingAddress?.street2}
                          <br />
                          {order.shippingAddress?.city},{' '}
                          {order.shippingAddress?.state}{' '}
                          {order.shippingAddress?.zipcode}
                        </span>
                      </div>
                    ) : null}
                  </div>
                  <div>
                    <h4>Order Summary</h4>
                    <div className="info-item">
                      <div className="label">Subtotal</div>
                      {formatToMoney(order.summary.subtotal, true)}
                    </div>
                    <div className="info-item">
                      <div className="label">Sales Tax</div>
                      {formatToMoney(order.summary.salesTax, true)}
                    </div>
                    <div className="info-item">
                      <div className="label">Shipping</div>
                      {formatToMoney(order.summary.shipping, true)}
                    </div>
                    <div className="info-item">
                      <div className="label">Total</div>
                      {formatToMoney(order.summary.total, true)}
                    </div>
                  </div>
                </div>
                <div className="section">
                  <h4>Order Items</h4>
                  <div className="order-items">
                    <div className="table-container">
                      <table>
                        <thead>
                          <tr>
                            <th>Name</th>
                            <th>Color</th>
                            <th>Size</th>
                            <th>Price</th>
                            <th className="text-center">Qty.</th>
                            <th className="text-right">Item Total</th>
                          </tr>
                        </thead>
                        <tbody>
                          {order.items.map(i => (
                            <tr key={i.sku.productId} className="order-item">
                              <td>
                                <div className="product-name">{i.name}</div>
                                <div className="product-id">{i.sku.id}</div>
                              </td>
                              <td>{i.sku.color.label}</td>
                              <td>{i.sku.size.label}</td>
                              <td>{formatToMoney(i.price)}</td>
                              <td className="text-center">{i.quantity}</td>
                              <td className="text-right">
                                {formatToMoney(i.itemTotal, true)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
                <div className="notes">
                  <Notes
                    label="Order"
                    notes={order.notes}
                    addNote={addNoteMutation.mutate}
                    updateNote={updateNoteMutation.mutate}
                    deleteNote={deleteNoteMutation.mutate}
                  />
                </div>
              </div>
            </div>
          </>
        )}
      </OrderStyles>
    </Layout>
  );
}

const OrderStyles = styled.div`
  .print-only {
    display: none;
  }

  .title {
    padding: 1.625rem 2rem;
    min-height: 5.25rem;
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
    margin: 0;
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
    padding: 3.5rem 3rem 10rem;
    position: relative;
  }

  .wrapper {
    width: 100%;
  }

  .header {
    padding: 0 0 2rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 1px solid #e5e7eb;
  }

  .contact-info {
    margin: 2rem 0 0;
    display: flex;

    > div {
      padding: 0 2rem;

      &:first-of-type {
        padding-left: 0;
      }

      &:last-of-type {
        padding-right: 0;
      }

      &:not(:last-of-type) {
        border-right: 1px solid #e5e7eb;
      }
    }
  }

  .action-buttons {
    display: flex;
    gap: 1rem;
    position: absolute;
    top: 2rem;
    right: 2rem;

    a,
    button {
      padding: 0.625rem 1.25rem;
      display: flex;
      justify-content: center;
      align-items: center;
      font-size: 0.9375rem;
      font-weight: 500;
      color: #374151;
      background-color: #fff;
      border: 1px solid #d1d5db;
      border-radius: 0.25rem;
      cursor: pointer;
      box-shadow: rgba(0, 0, 0, 0) 0px 0px 0px 0px,
        rgba(0, 0, 0, 0) 0px 0px 0px 0px, rgba(0, 0, 0, 0.05) 0px 1px 2px 0px;

      &:hover {
        background-color: #f9fafb;
      }
    }

    svg {
      margin: 0 0.375rem 0 0;
      height: 1.125rem;
      width: 1.125rem;
      color: #9ca3af;
    }
  }

  .section {
    padding: 3.5rem 0;
  }

  .grid-cols-2 {
    display: grid;
    grid-template-columns: 1fr 1fr;
    width: 100%;
    border-bottom: 1px solid #e5e7eb;
  }

  .info-item {
    padding: 1rem 0;
    display: flex;
    flex-direction: column;
    font-size: 1rem;
    color: #111827;
    line-height: 1.35;

    &:last-of-type {
      padding-bottom: 0;
    }
  }

  .label {
    margin: 0 0 0.375rem;
    font-size: 0.8125rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.0375em;
    color: #89909d;
  }

  .data {
    color: #111827;
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
        height: 0.625rem;
        width: 0.625rem;
        border-radius: 9999px;
        background-color: #374151;
      }

      &.unfulfilled {
        background-color: #fef2f2;
        border-color: #fee2e2;
        color: #991b1b;

        .dot {
          background-color: #ef4444;
          border: 2px solid #fecaca;
        }
      }

      &.fulfilled {
        background-color: #fffbeb;
        border-color: #fef3c7;
        color: #92400e;

        .dot {
          background-color: #f59e0b;
          border: 2px solid #fde68a;
        }
      }

      &.completed {
        background-color: #ecfdf5;
        border-color: #d1fae5;
        color: #065f46;

        .dot {
          background-color: #10b981;
          border: 2px solid #a7f3d0;
        }
      }
    }
  }

  /****  ORDER ITEMS ****/
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

  td,
  th {
    border-bottom: 1px solid #e5e7eb;

    &.text-left {
      text-align: left;
    }
    &.text-center {
      text-align: center;
    }
    &.text-right {
      text-align: right;
    }
  }

  th {
    padding: 1rem;
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

  tr:last-of-type td {
    border-bottom: none;
  }

  td {
    padding: 0.875rem 1rem;
    font-size: 0.9375rem;
    font-weight: 500;
    color: #1f2937;

    .product-name {
      margin: 0 0 0.125rem;
      font-size: 1rem;
      font-weight: 500;
    }

    .product-id {
      color: #89909d;
    }
  }

  @media print {
    @media (resolution: 300dpi) {
      .print-only {
        display: block;
      }

      .screen-only {
        display: none;
      }

      .order-status,
      .title,
      .action-buttons,
      .notes {
        display: none;
      }

      .print-title {
        display: flex;
        justify-content: space-between;
      }

      .print-title-details {
        margin: 10px 0 0;
        padding: 0 0 20px;
        display: flex;
        flex-direction: column;
        align-items: flex-end;
        justify-content: flex-end;
      }

      .print-logo {
        img {
          width: 200px;
        }
      }

      .print-item {
        font-size: 13px;
        color: #171717;

        span {
          margin-right: 6px;
          font-weight: 600;
          color: #171717;
        }

        &.order-number {
          margin: 0 0 6px;
          font-size: 16px;
          font-weight: 600;
          color: #171717;

          span {
            margin-right: 14px;
          }
        }
      }

      .main-content {
        padding: 0;
      }

      .header {
        padding: 28px 0 12px;
        border-top: 1px solid #dadade;
        border-bottom: none;

        h3 {
          font-size: 20px;
          color: #171717;
        }
      }

      h4 {
        margin: 0 0 14px;
        font-size: 14px;
        color: #171717;
      }

      .contact-info {
        margin: 0;
        flex-direction: column;

        .item {
          padding: 0;
          font-size: 13px;
          color: #404040;

          &:not(:last-of-type) {
            margin: 0 0 2px;
            border-right: none;
          }
        }

        .data {
          color: #171717;
        }

        .label {
          display: none;
        }
      }

      .macaport-contact {
        display: flex;
        flex-direction: column;
        align-items: flex-end;
        gap: 4px;
        font-size: 13px;
        color: #525252;
      }

      .section {
        padding: 32px 0 0;
      }

      .section.grid-cols-2 {
        border-bottom: none;

        > div:last-of-type {
          padding-left: 42px;
        }
      }

      .info-item {
        padding: 2px 0;
        flex-direction: row;
        gap: 8px;
        font-size: 13px;
        color: #171717;

        .label {
          margin: 0;
          width: 80px;
          font-size: 11px;
          color: #a3a3a3;
          line-height: 1.5;
        }
      }

      .table-container {
        border-radius: 2px;
        box-shadow: none;
      }

      .table-container,
      td,
      th {
        border-color: #dadade;
      }

      td,
      th {
        background-color: transparent;

        &:first-of-type {
          padding-left: 16px;
        }

        &:last-of-type {
          padding-right: 16px;
        }
      }

      th {
        padding: 12px 8px;
        font-size: 10px;
        color: #737373;
      }

      td {
        padding: 8px;
        font-size: 12px;
        color: #262626;

        .product-name {
          font-size: 12px;
          color: #171717;
        }

        .product-id {
          font-size: 10px;
          color: #bbb;
        }
      }
    }
  }
`;
