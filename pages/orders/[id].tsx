import React from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { useQueryClient, useQuery, useMutation } from 'react-query';
import styled from 'styled-components';
import { format } from 'date-fns';
import { useSession } from '../../hooks/useSession';
import useEscapeKeydownClose from '../../hooks/useEscapeKeydownClose';
import useOutsideClick from '../../hooks/useOutsideClick';
import { Note, Store } from '../../interfaces';
import {
  formatPhoneNumber,
  formatToMoney,
  calculateStripeFee,
} from '../../utils';
import Layout from '../../components/Layout';
import OrderStatusButton from '../../components/OrderStatusButton';
import Notes from '../../components/Notes';
import LoadingSpinner from '../../components/LoadingSpinner';
import PrintableOrder from '../../components/PrintableOrder';

export default function Order() {
  const [session, sessionLoading] = useSession({ required: true });
  const router = useRouter();
  const queryClient = useQueryClient();
  const [options, setOptions] = React.useState({
    includesName: false,
    includesNumber: false,
  });
  const [showOrderMenu, setShowOrderMenu] = React.useState(false);
  const orderMenuRef = React.useRef<HTMLDivElement>(null);
  useOutsideClick(showOrderMenu, setShowOrderMenu, orderMenuRef);
  useEscapeKeydownClose(showOrderMenu, setShowOrderMenu);

  const { isLoading, isFetching, isError, error, data } = useQuery(
    ['stores', 'store', 'order', router.query.id],
    async () => {
      if (!router.query.sid) return;
      const response = await fetch(`/api/stores/${router.query.sid}`);

      if (!response.ok) {
        throw new Error('Failed to fetch the order.');
      }

      const data: { store: Store } = await response.json();
      const store = data.store;
      const order = store.orders.find(o => o.orderId === router.query.id);
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
          console.log('YES');
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
      const prevNotes = data.order.notes || [];
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
            return { ...o, notes: [...previousNotes, newNote] };
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

  if (sessionLoading || !session) return <div />;

  return (
    <>
      <Layout title={`Order #${data?.order?.orderId} | Macaport Dashboard`}>
        <OrderStyles>
          <div className="container">
            {isLoading && <LoadingSpinner isLoading={isLoading} />}
            {isError && error instanceof Error && <div>Error: {error}</div>}
            {data?.order && (
              <>
                <div className="actions-row">
                  <Link href={`/stores/${router.query.sid}`}>
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

                  <div className="order-menu-container">
                    <button
                      type="button"
                      onClick={() => setShowOrderMenu(!showOrderMenu)}
                      className="order-menu-button"
                    >
                      <span className="sr-only">Menu</span>
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
                          d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"
                        />
                      </svg>
                    </button>

                    <div
                      ref={orderMenuRef}
                      className={`menu${showOrderMenu ? ' show' : ''}`}
                    >
                      <button
                        type="button"
                        onClick={() => window.print()}
                        className="menu-link"
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

                      <a
                        href={`https://dashboard.stripe.com/payments/${data.order.stripeId}`}
                        target="_blank"
                        rel="noreferrer"
                        className="menu-link"
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
                            d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                          />
                        </svg>
                        Stripe dashboard
                      </a>
                    </div>
                  </div>
                </div>

                <div className="order-header">
                  <div>
                    <div className="order-number-status">
                      <h2>Order #{data.order.orderId}</h2>
                      <OrderStatusButton
                        store={data.store}
                        order={data.order}
                      />
                    </div>
                    <p>
                      {format(
                        new Date(data.order.createdAt),
                        "MMM. dd, yyyy 'at' h:mmaa"
                      )}
                    </p>
                  </div>
                </div>

                <div className="main-content">
                  <FetchingSpinner isLoading={isFetching} />

                  <div>
                    <h3 className="section-title">Order details</h3>
                    <div className="detail-grid">
                      <div>
                        <div className="detail-item">
                          <div className="label">Store</div>
                          <div className="value">{data.order.store.name}</div>
                        </div>

                        {data.store.requireGroupSelection && (
                          <div className="detail-item">
                            <div className="label">{data.store.groupTerm}</div>
                            <div className="value">{data.order.group}</div>
                          </div>
                        )}

                        <div className="detail-item">
                          <div className="label">Shipping Method</div>
                          <div className="value">
                            {data.order.shippingMethod}
                          </div>
                        </div>

                        <div className="detail-item">
                          <div className="label">Shipping address</div>
                          <div className="value">
                            {data.order.shippingAddress?.street}{' '}
                            {data.order.shippingAddress?.street2}
                            <br />
                            {data.order.shippingAddress?.city},{' '}
                            {data.order.shippingAddress?.state}{' '}
                            {data.order.shippingAddress?.zipcode}
                          </div>
                        </div>
                      </div>

                      <div>
                        <div className="detail-item">
                          <div className="label">Customer name</div>
                          <div className="value">
                            {data.order.customer.firstName}{' '}
                            {data.order.customer.lastName}
                          </div>
                        </div>

                        <div className="detail-item">
                          <div className="label">Customer email</div>
                          <div className="value">
                            <a href={`mailto:${data.order.customer.email}`}>
                              {data.order.customer.email}
                            </a>
                          </div>
                        </div>

                        <div className="detail-item">
                          <div className="label">Customer phone</div>
                          <div className="value">
                            {formatPhoneNumber(data.order.customer.phone)}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="order-items">
                    <h4>Order items</h4>
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
                                    href={`/stores/${router.query.sid}/product?pid=${i.sku.storeProductId}`}
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
                  </div>

                  <Notes
                    label="Order"
                    notes={data.order.notes}
                    addNote={addNoteMutation}
                    updateNote={updateNoteMutation}
                    deleteNote={deleteNoteMutation}
                  />
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
    max-width: 75rem;
    width: 100%;
  }

  .container {
    padding: 3rem 0 0;
  }

  .actions-row {
    margin: 0 0 2.5rem;
    display: flex;
    justify-content: space-between;
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
      color: #1c5eb9;

      svg {
        color: #1c5eb9;
      }
    }
  }

  .order-menu-container {
    display: flex;
    justify-content: flex-end;
    width: 25%;

    .menu {
      top: 5.5rem;
      right: 0;
    }
  }

  .order-menu-button {
    padding: 0;
    height: 2rem;
    width: 2rem;
    display: flex;
    justify-content: center;
    align-items: center;
    background-color: transparent;
    border: none;
    color: #6b7280;
    border-radius: 0.3125rem;
    cursor: pointer;

    svg {
      height: 1.25rem;
      width: 1.25rem;
    }

    &:hover {
      color: #111827;
    }
  }

  .menu {
    padding: 0 1rem;
    position: absolute;
    display: none;
    flex-direction: column;
    align-items: flex-start;
    background-color: #fff;
    border-radius: 0.5rem;
    box-shadow: rgb(255, 255, 255) 0px 0px 0px 0px,
      rgba(17, 24, 39, 0.05) 0px 0px 0px 1px,
      rgba(0, 0, 0, 0.1) 0px 4px 6px -1px, rgba(0, 0, 0, 0.06) 0px 2px 4px -1px;

    &.show {
      display: flex;
      z-index: 100;
    }
  }

  .menu-link {
    padding: 0.75rem 1.5rem 0.75rem 0;
    width: 100%;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    background-color: transparent;
    border: none;
    border-bottom: 1px solid #e5e7eb;
    font-size: 0.875rem;
    font-weight: 400;
    color: #1f2937;
    text-align: left;
    cursor: pointer;

    &:last-child {
      border-bottom: none;
    }

    &:hover {
      color: #000;

      svg {
        color: #6b7280;
      }
    }

    svg {
      height: 1rem;
      width: 1rem;
      color: #9ca3af;
    }
  }

  .order-header {
    padding: 1.375rem 0 1.5rem;
    border-top: 1px solid #dcdfe4;
    border-bottom: 1px solid #dcdfe4;

    p {
      margin: 0.25rem 0 0;
      font-size: 1rem;
      font-weight: 500;
      color: #6b7280;
    }
  }

  .order-number-status {
    display: flex;
    align-items: center;
    gap: 1rem;
  }

  .order-status {
    span {
      padding: 0.375rem 0.5rem 0.375rem;
      display: inline-flex;
      align-items: center;
      font-size: 0.75rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.1em;
      color: #374151;
      border-radius: 0.25rem;
      background: #fff;
      line-height: 1;

      &.unfulfilled {
        background-color: #fee2e2;
        color: #991b1b;
      }

      &.fulfilled {
        background-color: #feefb4;
        color: #92400e;
      }

      &.completed {
        color: #14864d;
        background-color: #c9f7e0;
      }
    }
  }

  .main-content {
    position: relative;
    padding: 3.5rem 0;
  }

  .section-title {
    margin: 0 0 0.875rem;
    padding: 0 0 0.75rem;
    border-bottom: 1px solid #dcdfe4;
  }

  .detail-grid {
    margin: 1.5rem 0 0;
    padding: 0 0 0.5rem;
    display: flex;
    gap: 8rem;
    border-bottom: 1px solid #dcdfe4;
  }

  .detail-item {
    margin: 0 0 0.75rem;
    display: grid;
    grid-template-columns: 10rem 1fr;
  }

  .label {
    margin: 0 0 0.4375rem;
    font-size: 0.9375rem;
    font-weight: 500;
    color: #6b7280;
    text-transform: capitalize;
  }

  .value {
    font-size: 0.9375rem;
    color: #111827;
    line-height: 1.5;

    a:hover {
      color: #1c5eb9;
      text-decoration: underline;
    }
  }

  .order-items {
    margin: 3.5rem 0 0;
  }

  .table-container {
    margin: 0 0 2.5rem;
    width: 100%;
    background-color: #fff;
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
    padding: 0.875rem 1rem;
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

  tr:last-of-type {
    td {
      border-bottom: none;

      &:first-of-type {
        border-bottom-left-radius: 0.375rem;
      }

      &:last-of-type {
        border-bottom-right-radius: 0.375rem;
      }
    }
  }

  td {
    padding: 0.875rem 1rem;
    background-color: #fff;
    font-size: 0.875rem;
    font-weight: 500;
    color: #4b5563;

    .product-name {
      margin: 0 0 1px;
      font-weight: 500;
      color: #000;
    }

    .product-id {
      font-family: 'Dank Mono', monospace;
      font-size: 0.875rem;
      font-weight: 700;
      color: #6b7280;
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
        color: #1c5eb9;
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
      border-bottom: 1px solid #dcdfe4;

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

  @media print {
    display: none;
  }
`;

const FetchingSpinner = styled(LoadingSpinner)`
  position: absolute;
  top: 2rem;
  right: 0;
`;
