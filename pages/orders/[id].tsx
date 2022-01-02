import React from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { useQueryClient, useQuery, useMutation } from 'react-query';
import styled from 'styled-components';
import { format } from 'date-fns';
import useActiveNavTab from '../../hooks/useActiveNavTab';
import { useSession } from '../../hooks/useSession';
import { Note, Order as OrderInterface, Store } from '../../interfaces';
import {
  formatPhoneNumber,
  formatToMoney,
  calculateStripeFee,
} from '../../utils';
import Layout from '../../components/Layout';
import Notes from '../../components/Notes';
import LoadingSpinner from '../../components/LoadingSpinner';
import PrintableOrder from '../../components/PrintableOrder';

const navValues = ['details', 'items', 'notes'];
type NavValue = typeof navValues[number];

export default function Order() {
  const [session, sessionLoading] = useSession({ required: true });
  const router = useRouter();
  const { activeNav, setActiveNav } = useActiveNavTab(
    navValues,
    `/orders/${router.query.id}?sid=${router.query.id}&`
  );
  const queryClient = useQueryClient();
  const [options, setOptions] = React.useState({
    includesName: false,
    includesNumber: true,
  });

  const { isLoading, isFetching, isError, error, data } = useQuery(
    ['stores', 'store', 'order', router.query.id],
    async () => {
      if (!router.query.sid) return;
      const response = await fetch(`/api/stores/${router.query.sid}`);

      if (!response.ok) {
        throw new Error('Failed to fetch the order.');
      }

      const data = await response.json();
      const store: Store = data.store;
      const order = store.orders.find(
        (o: OrderInterface) => o.orderId === router.query.id
      );
      return { store, order };
    },
    {
      initialData: () => {
        const store = queryClient.getQueryData<Store>([
          'stores',
          'store',
          router.query.sid,
        ]);
        const order = store?.orders.find(o => o.orderId === router.query.id);
        if (store && order) {
          return { store, order };
        }
      },
      initialDataUpdatedAt: () => {
        return queryClient.getQueryState(['stores', 'store', router.query.sid])
          ?.dataUpdatedAt;
      },
      staleTime: 1000 * 60 * 10,
    }
  );

  React.useEffect(() => {
    if (data?.order) {
      const includesName = data.order.items.some(i => i.customName);
      const includesNumber = data.order.items.some(i => i.customNumber);
      setOptions({ includesName, includesNumber });
    }
  }, [data?.order]);

  const addNoteMutation = useMutation(
    async (note: Note) => {
      if (!data?.order) return;
      const prevNotes = data?.order.notes || [];

      const response = await fetch(
        `/api/orders/update/notes?id=${router.query.sid}&oid=${router.query.id}`,
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

      const responseData = await response.json();
      return responseData.store;
    },
    {
      onMutate: async newNote => {
        await queryClient.cancelQueries([
          'stores',
          'store',
          'order',
          router.query.id,
        ]);
        const previousNotes = data?.order?.notes || [];
        const updatedOrders = data?.store.orders.map(o => {
          if (o.orderId === router.query.id) {
            return { ...o, notes: [...o.notes, newNote] };
          }
          return o;
        });

        queryClient.setQueryData(
          ['stores', 'store', 'order', router.query.id],
          {
            store: { ...data?.store, orders: updatedOrders },
            order: { ...data?.order, notes: [...previousNotes, newNote] },
          }
        );

        return { previousNotes, newNote };
      },
      onError: () => {
        // TODO: trigger a notification
        queryClient.setQueryData(
          ['stores', 'store', 'order', router.query.id],
          { store: data?.store, order: data?.order }
        );
      },
      onSettled: () => {
        queryClient.invalidateQueries('stores');
        queryClient.invalidateQueries(['order', router.query.id]);
      },
    }
  );

  const updateNoteMutation = useMutation(
    async (note: Note) => {
      const notes = data?.order?.notes.map(n => {
        if (n.id === note.id) {
          return note;
        } else {
          return n;
        }
      });

      const response = await fetch(
        `/api/orders/update/notes?id=${router.query.sid}&oid=${router.query.id}`,
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

      const responseData = await response.json();
      return responseData.store;
    },
    {
      onMutate: async updatedNote => {
        await queryClient.cancelQueries([
          'stores',
          'store',
          'order',
          router.query.id,
        ]);
        const previousNotes = data?.order?.notes;
        const updatedNotes = previousNotes?.map(n =>
          n.id === updatedNote.id ? updatedNote : n
        );
        const updatedOrders = data?.store.orders.map(o => {
          if (o.orderId === router.query.id) {
            return { ...o, notes: updatedNotes };
          }
          return o;
        });
        queryClient.setQueryData(
          ['stores', 'store', 'order', router.query.id],
          {
            store: { ...data?.store, orders: updatedOrders },
            order: { ...data?.order, notes: updatedNotes },
          }
        );
        return { previousNotes, updatedNote };
      },
      onError: () => {
        // TODO: trigger a notifaction
        queryClient.setQueryData(
          ['stores', 'store', 'order', router.query.id],
          { store: data?.store, order: data?.order }
        );
      },
      onSettled: () => {
        queryClient.invalidateQueries('stores');
        // TODO: do I need this second invalidation?
        queryClient.invalidateQueries([
          'stores',
          'store',
          'order',
          router.query.id,
        ]);
      },
    }
  );

  const deleteNoteMutation = useMutation(
    async (id: string) => {
      const notes = data?.order?.notes.filter(n => n.id !== id);

      const response = await fetch(
        `/api/orders/update/notes?id=${router.query.sid}&oid=${router.query.id}`,
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

      const responseData = await response.json();
      return responseData.store;
    },
    {
      onMutate: async id => {
        await queryClient.cancelQueries([
          'stores',
          'store',
          'order',
          router.query.id,
        ]);
        const previousNotes = data?.order?.notes;
        const updatedNotes = previousNotes?.filter(n => n.id !== id);
        const updatedOrder = { ...data?.order, notes: updatedNotes };
        const updatedOrders = data?.store.orders.map(o => {
          if (o.orderId === router.query.id) {
            return { ...o, notes: updatedNotes };
          }
          return o;
        });
        const updatedStore = { ...data?.store, orders: updatedOrders };
        queryClient.setQueryData(
          ['stores', 'store', 'order', router.query.id],
          { store: updatedStore, order: updatedOrder }
        );
        return { previousNotes };
      },
      onError: () => {
        // TODO: trigger a notification
        queryClient.setQueryData(
          ['stores', 'store', 'order', router.query.id],
          { store: data?.store, order: data?.order }
        );
      },
      onSettled: () => {
        queryClient.invalidateQueries('stores');
        // TODO: do I need this 2nd invalidation?
        queryClient.invalidateQueries([
          'stores',
          'store',
          'order',
          router.query.id,
        ]);
      },
    }
  );

  const handleNavClick = (value: NavValue) => {
    setActiveNav(value);
    router.push(
      `/orders/${router.query.id}?sid=${router.query.sid}&active=${value}`,
      undefined,
      {
        shallow: true,
      }
    );
  };

  if (sessionLoading || !session) return <div />;

  return (
    <>
      <Layout title={`Order #${data?.order?.orderId} | Macaport Dashboard`}>
        <OrderStyles>
          <button
            type="button"
            onClick={() => window.print()}
            className="print-button"
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
            Print order
          </button>
          <div className="container">
            {isLoading && <LoadingSpinner isLoading={isLoading} />}
            {isError && error instanceof Error && <div>Error: {error}</div>}
            {data?.order && (
              <>
                <Link href={`/stores/${router.query.sid}?active=orders`}>
                  <a className="back-link">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z"
                        clipRule="evenodd"
                      />
                    </svg>
                    Back to store
                  </a>
                </Link>
                <div className="order-header">
                  <h2>Order #{data.order.orderId}</h2>
                  <p>{data.order.store.name}</p>
                </div>

                <div className="order-nav">
                  <button
                    type="button"
                    onClick={() => handleNavClick('details')}
                    className={activeNav === 'details' ? 'active' : ''}
                  >
                    <span>Details</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleNavClick('items')}
                    className={activeNav === 'items' ? 'active' : ''}
                  >
                    <span>Order Items</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleNavClick('notes')}
                    className={activeNav === 'notes' ? 'active' : ''}
                  >
                    <span>Notes</span>
                  </button>
                </div>

                <div className="body">
                  <FetchingSpinner isLoading={isFetching} />
                  {activeNav === 'details' && (
                    <>
                      <div className="customer-info">
                        <h3>
                          {data.order.customer.firstName}{' '}
                          {data.order.customer.lastName}
                        </h3>
                        <p>
                          <a
                            href={`mailto:${data.order.customer.email}`}
                            target="_blank"
                            rel="noreferrer"
                          >
                            {data.order.customer.email}
                          </a>
                        </p>
                        <p>{formatPhoneNumber(data.order.customer.phone)}</p>
                      </div>
                      <div className="order-details-grid">
                        <div>
                          <div className="info-item">
                            <div className="label">Order Status</div>
                            <div className="value">
                              <div className="order-status">
                                <span
                                  className={
                                    data.order.orderStatus === 'Unfulfilled'
                                      ? 'unfulfilled'
                                      : data.order.orderStatus === 'Fulfilled'
                                      ? 'fulfilled'
                                      : data.order.orderStatus === 'Completed'
                                      ? 'completed'
                                      : ''
                                  }
                                >
                                  <div className="dot" />
                                  {data.order.orderStatus}
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="info-item">
                            <div className="label">Order Date</div>
                            <div className="value">
                              {format(
                                new Date(data.order.createdAt),
                                "MMM dd, yyyy 'at' h:mmaa"
                              )}
                            </div>
                          </div>
                          <div className="info-item">
                            <div className="label">Transaction Id</div>
                            <div className="value">{data.order.stripeId}</div>
                          </div>
                        </div>
                        <div>
                          {data.store.requireGroupSelection && (
                            <div className="info-item">
                              <div className="label">
                                {data.store.groupTerm}
                              </div>
                              <div className="value">{data.order.group}</div>
                            </div>
                          )}
                          <div className="info-item">
                            <div className="label">Shipping Method</div>
                            {data.order.shippingMethod}
                          </div>
                          {data.order.shippingMethod === 'Direct' ? (
                            <div className="info-item">
                              <div className="label">Shipping Address</div>
                              <span>
                                {data.order.shippingAddress?.street}{' '}
                                {data.order.shippingAddress?.street2}
                                <br />
                                {data.order.shippingAddress?.city},{' '}
                                {data.order.shippingAddress?.state}{' '}
                                {data.order.shippingAddress?.zipcode}
                              </span>
                            </div>
                          ) : data.order.shippingMethod === 'Primary' ? (
                            <div className="info-item">
                              <div className="label">Primary Location</div>
                              <span>{data.order.shippingAddress.name}</span>
                            </div>
                          ) : null}
                        </div>
                        <div>
                          <div className="order-summary-row">
                            <div className="order-summary">
                              <div className="summary-item">
                                <div className="summary-label">Subtotal</div>
                                <div className="summary-value">
                                  {formatToMoney(
                                    data.order.summary.subtotal,
                                    true
                                  )}
                                </div>
                              </div>
                              <div className="summary-item">
                                <div className="summary-label">Sales Tax</div>
                                <div className="summary-value">
                                  {formatToMoney(
                                    data.order.summary.salesTax,
                                    true
                                  )}
                                </div>
                              </div>
                              <div className="summary-item">
                                <div className="summary-label">Shipping</div>
                                <div className="summary-value">
                                  {formatToMoney(
                                    data.order.summary.shipping,
                                    true
                                  )}
                                </div>
                              </div>
                              <div className="summary-item total">
                                <div className="summary-label">Total</div>
                                <div className="summary-value">
                                  {formatToMoney(
                                    data.order.summary.total,
                                    true
                                  )}
                                </div>
                              </div>
                              <div className="summary-item">
                                <div className="summary-label">Stripe Fee</div>
                                <div className="summary-value">
                                  -
                                  {formatToMoney(
                                    calculateStripeFee(
                                      data.order.summary.total
                                    ),
                                    true
                                  )}
                                </div>
                              </div>
                              <div className="summary-item">
                                <div className="summary-label">Net</div>
                                <div className="summary-value">
                                  {formatToMoney(
                                    data.order.summary.total -
                                      calculateStripeFee(
                                        data.order.summary.total
                                      ),
                                    true
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                  {activeNav === 'items' && (
                    <>
                      <h4>Order Items</h4>
                      <div className="order-items">
                        <div className="table-container">
                          <table>
                            <thead>
                              <tr>
                                <th>Name</th>
                                <th>Color</th>
                                <th>Size</th>
                                {options.includesName && <th>Name</th>}
                                {options.includesNumber && (
                                  <th className="text-center">Number</th>
                                )}
                                <th>Price</th>
                                <th className="text-center">Qty.</th>
                                <th className="text-right">Item Total</th>
                              </tr>
                            </thead>
                            <tbody>
                              {data.order.items.map(i => (
                                <tr
                                  key={`${i.sku.id}-${i.customName}-${i.customNumber}`}
                                  className="order-item"
                                >
                                  <td>
                                    <div className="product-name">
                                      <Link
                                        href={`/stores/${router.query.sid}/product?pid=${i.sku.productId}`}
                                      >
                                        {i.name}
                                      </Link>
                                    </div>
                                    <div className="product-id">{i.sku.id}</div>
                                  </td>
                                  <td>{i.sku.color.label}</td>
                                  <td>{i.sku.size.label}</td>
                                  {options.includesName && (
                                    <td>{i.customName ? i.customName : '-'}</td>
                                  )}
                                  {options.includesNumber && (
                                    <td className="text-center">
                                      {i.customNumber ? i.customNumber : '-'}
                                    </td>
                                  )}
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
                      <div className="order-summary-row">
                        <div className="order-summary">
                          <div className="summary-item">
                            <div className="summary-label">Subtotal</div>
                            <div className="summary-value">
                              {formatToMoney(data.order.summary.subtotal, true)}
                            </div>
                          </div>
                          <div className="summary-item">
                            <div className="summary-label">Sales Tax</div>
                            <div className="summary-value">
                              {formatToMoney(data.order.summary.salesTax, true)}
                            </div>
                          </div>
                          <div className="summary-item">
                            <div className="summary-label">Shipping</div>
                            <div className="summary-value">
                              {formatToMoney(data.order.summary.shipping, true)}
                            </div>
                          </div>
                          <div className="summary-item total">
                            <div className="summary-label">Total</div>
                            <div className="summary-value">
                              {formatToMoney(data.order.summary.total, true)}
                            </div>
                          </div>
                          <div className="summary-item">
                            <div className="summary-label">Stripe Fee</div>
                            <div className="summary-value">
                              -
                              {formatToMoney(
                                calculateStripeFee(data.order.summary.total),
                                true
                              )}
                            </div>
                          </div>
                          <div className="summary-item">
                            <div className="summary-label">Net</div>
                            <div className="summary-value">
                              {formatToMoney(
                                data.order.summary.total -
                                  calculateStripeFee(data.order.summary.total),
                                true
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                  {activeNav === 'notes' && (
                    <Notes
                      label="Order"
                      notes={data.order.notes}
                      addNote={addNoteMutation}
                      updateNote={updateNoteMutation}
                      deleteNote={deleteNoteMutation}
                    />
                  )}
                </div>
              </>
            )}
          </div>
        </OrderStyles>
        {data?.order && data.store && (
          <PrintableOrder
            order={data.order}
            store={data.store}
            options={options}
          />
        )}
      </Layout>
    </>
  );
}

const OrderStyles = styled.div`
  position: relative;

  h2 {
    margin: 0;
    font-size: 1.5rem;
    font-weight: 600;
    color: #111827;
  }

  h3 {
    margin: 0 0 1.25rem;
    font-size: 1.25rem;
    font-weight: 600;
    color: #111827;
  }

  h4 {
    margin: 0 0 1rem;
    font-size: 1.125rem;
    font-weight: 600;
    color: #111827;
  }

  .container,
  .order-summary-row {
    position: relative;
    margin: 0 auto;
    max-width: 70rem;
    width: 100%;
  }

  .container {
    padding: 3rem 0 0;
  }

  .back-link {
    display: inline-flex;
    align-items: center;
    gap: 0.25rem;
    font-weight: 500;
    color: #4b5563;

    svg {
      margin: 1px 0 0;
      height: 1rem;
      width: 1rem;
      color: #9ca3af;
    }

    &:hover {
      color: #1f2937;
    }

    &:focus {
      outline: 2px solid transparent;
      outline-offset: 2px;
    }

    &:focus-visible {
      text-decoration: underline;
      color: #2c33bb;

      svg {
        color: #2c33bb;
      }
    }
  }

  .order-header {
    padding: 3rem 0 2.25rem;

    p {
      margin: 0.25rem 0 0;
      color: #6b7280;
    }
  }

  .order-nav {
    padding: 0.625rem 0;
    border-bottom: 1px solid #e5e7eb;
    border-top: 1px solid #e5e7eb;

    button {
      margin: 0 0.75rem 0 0;
      padding: 0.4375rem 0.75rem;
      background-color: transparent;
      border: none;
      border-radius: 9999px;
      font-size: 0.875rem;
      font-weight: 500;
      line-height: 1;
      color: #374151;
      cursor: pointer;

      &:hover {
        background-color: #e5e7eb;
        color: #111827;
      }

      &.active {
        background-color: #2c33bb;
        color: #fff;
      }
    }
  }

  .body {
    position: relative;
    padding: 3.5rem 0 2.5rem;
  }

  .customer-info {
    margin: 0 0 3rem;

    h3 {
      margin: 0;
    }

    p {
      margin: 0;
      color: #6b7280;
      line-height: 1.5;
    }

    a:hover {
      text-decoration: underline;
      color: #2c33bb;
    }
  }

  .order-details-grid {
    display: grid;
    grid-template-columns: 1fr 0.9fr 0.9fr;
  }

  .info-item {
    padding: 0 0 2rem;
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
      padding: 0.375rem 0.8125rem 0.375rem 0.75rem;
      display: inline-flex;
      align-items: center;
      font-size: 0.75rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: #374151;
      border-radius: 9999px;
      background: #fff;
      line-height: 1;

      .dot {
        margin: 0 0.5rem 0 0;
        height: 0.625rem;
        width: 0.625rem;
        border-radius: 9999px;
        background-color: #374151;
      }

      &.unfulfilled {
        background-color: #fee2e2;
        border: 1px solid #fecaca;
        box-shadow: inset 0 1px 1px #fff;
        color: #991b1b;

        .dot {
          background-color: #ef4444;
          border: 2px solid #fca5a5;
        }
      }

      &.fulfilled {
        background-color: #fef3c7;
        border: 1px solid #fef08a;
        box-shadow: inset 0 1px 1px #fff;
        color: #92400e;

        .dot {
          background-color: #f59e0b;
          border: 2px solid #fcd34d;
        }
      }

      &.completed {
        background-color: #d1fae5;
        border: 1px solid #a7f3d0;
        box-shadow: inset 0 1px 1px #fff;
        color: #065f46;

        .dot {
          background-color: #10b981;
          border: 2px solid #6ee7b7;
        }
      }
    }
  }

  .table-container {
    margin: 0 0 2.5rem;
    width: 100%;
    background-color: #fff;
    border: 1px solid #e5e7eb;
    border-radius: 0.25rem;
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
    padding: 0.875rem 1rem;
    background-color: #f3f4f6;
    font-size: 0.75rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.0375em;
    color: #6b7280;
    text-align: left;

    &:first-of-type {
      border-top-left-radius: 0.25rem;
    }

    &:last-of-type {
      border-top-right-radius: 0.25rem;
    }
  }

  tr:last-of-type td {
    border-bottom: none;
  }

  td {
    padding: 0.875rem 1rem;
    font-size: 0.875rem;
    font-weight: 500;
    color: #4b5563;

    .product-name {
      margin: 0 0 1px;
      font-weight: 500;
      color: #111827;
    }

    .product-id {
      font-size: 0.75rem;
      color: #9ca3af;
    }

    a {
      &:hover {
        text-decoration: underline;
      }

      &:focus {
        outline: 2px solid transparent;
        outline-offset: 2px;
      }

      &:focus-visible {
        text-decoration: underline;
        color: #2c33bb;
      }
    }
  }

  .order-summary-row {
    display: flex;
    justify-content: flex-end;
  }

  .order-summary {
    margin: 0 0 3rem;
    display: flex;
    flex-direction: column;
  }

  .summary-item {
    padding: 0.3125rem 0;
    display: flex;
    justify-content: space-between;
    font-size: 0.9375rem;
    font-weight: 500;

    &.total {
      margin-bottom: 0.3125rem;
      padding-bottom: 0.75rem;
      font-weight: 600;
      border-bottom: 1px solid #d1d5db;

      .summary-label {
        color: #111827;
      }

      .summary-value {
        color: #059669;
      }
    }
  }

  .summary-label {
    width: 14rem;
    color: #4b5563;
  }

  .summary-value {
    text-align: right;
    color: #111827;
  }

  .print-button {
    position: absolute;
    top: 2rem;
    right: 2rem;
    padding: 0.5rem 0.75rem;
    display: inline-flex;
    justify-content: center;
    align-items: center;
    color: #475569;
    font-size: 0.875rem;
    font-weight: 500;
    text-align: center;
    line-height: 1;
    background-color: #e2e8f0;
    border: 1px solid #cbd5e1;
    border-radius: 0.3125rem;
    box-shadow: inset 0 1px 1px #fff, 0 1px 2px 0 rgb(0 0 0 / 0.05);
    cursor: pointer;

    svg {
      margin: 0 0.375rem 0 0;
      height: 0.875rem;
      width: 0.875rem;
      color: #9ca3af;
    }

    &:hover {
      border-color: #bfcbda;
      box-shadow: inset 0 1px 1px #fff, 0 1px 2px 0 rgb(0 0 0 / 0.1);
    }

    &:focus {
      outline: 2px solid transparent;
      outline-offset: 2px;
    }

    &:focus-visible {
      box-shadow: rgb(255, 255, 255) 0px 0px 0px 2px,
        rgb(99, 102, 241) 0px 0px 0px 4px, rgba(0, 0, 0, 0) 0px 0px 0px 0px;
    }
  }

  @media print {
    display: none;
  }
`;

const FetchingSpinner = styled(LoadingSpinner)`
  position: absolute;
  top: 2rem;
  right: 0;
`;
