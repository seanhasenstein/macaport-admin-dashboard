import React from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import styled from 'styled-components';
import { format } from 'date-fns';
import { formatPhoneNumber, formatToMoney } from '../../utils';

import { useSession } from '../../hooks/useSession';
import { useOrderQuery } from '../../hooks/useOrderQuery';
import { useOrderMutation } from '../../hooks/useOrderMutations';
import useEscapeKeydownClose from '../../hooks/useEscapeKeydownClose';
import useOutsideClick from '../../hooks/useOutsideClick';
import Layout from '../../components/Layout';
import OrderStatusButton from '../../components/OrderStatusButton';
import Notes from '../../components/Notes';
import LoadingSpinner from '../../components/LoadingSpinner';
import PrintableOrder from '../../components/PrintableOrder';

export default function Order() {
  const [session, sessionLoading] = useSession({ required: true });
  const router = useRouter();
  const [showOrderMenu, setShowOrderMenu] = React.useState(false);
  const [showCancelOrderModal, setShowCancelOrderModal] = React.useState(false);
  const orderMenuRef = React.useRef<HTMLDivElement>(null);
  const cancelOrderRef = React.useRef<HTMLDivElement>(null);
  useOutsideClick(showOrderMenu, setShowOrderMenu, orderMenuRef);
  useOutsideClick(
    showCancelOrderModal,
    setShowCancelOrderModal,
    cancelOrderRef
  );
  useEscapeKeydownClose(showOrderMenu, setShowOrderMenu);
  useEscapeKeydownClose(showCancelOrderModal, setShowCancelOrderModal);
  const { isLoading, isFetching, isError, error, data } = useOrderQuery();
  const { addNote, updateNote, deleteNote, cancelOrder } = useOrderMutation({
    order: data?.order,
    store: data?.store,
  });

  const handleCancelOrderClick = () => {
    cancelOrder.mutate();
    setShowCancelOrderModal(false);
  };

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
                      {data.order.orderStatus !== 'Canceled' && (
                        <button
                          type="button"
                          onClick={() => {
                            setShowOrderMenu(false);
                            setShowCancelOrderModal(true);
                          }}
                          className="menu-link cancel-order"
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
                              d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                          </svg>
                          Cancel order
                        </button>
                      )}
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
                            {data.order.shippingAddress?.name &&
                              data.order.shippingAddress?.name}
                            {data.order.shippingAddress?.street && (
                              <>
                                <br />
                                {data.order.shippingAddress?.street}
                              </>
                            )}{' '}
                            {data.order.shippingAddress?.street2 && (
                              <>
                                <br />
                                {data.order.shippingAddress?.street2}
                              </>
                            )}
                            {data.order.shippingAddress.city ||
                            data.order.shippingAddress.state ||
                            data.order.shippingAddress.zipcode ? (
                              <br />
                            ) : null}
                            {data.order.shippingAddress?.city}
                            {data.order.shippingAddress?.state &&
                              `, ${data.order.shippingAddress?.state}`}{' '}
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
                            <th>Price</th>
                            <th className="text-center">Qty.</th>
                            <th className="text-right">Item Total</th>
                          </tr>
                        </thead>
                        <tbody>
                          {data.order.items.map((item, index) => (
                            <tr
                              key={`${item.sku.id}-${index}`}
                              className="order-item"
                            >
                              <td>
                                <div className="product-name">
                                  <Link
                                    href={`/stores/${router.query.sid}/product?pid=${item.sku.storeProductId}`}
                                  >
                                    {item.name}
                                  </Link>
                                </div>
                                {item.personalizationAddons.length > 0 && (
                                  <div className="addon-items">
                                    {item.personalizationAddons.map(
                                      addonItem => (
                                        <div
                                          key={addonItem.id}
                                          className="addon-item"
                                        >
                                          <div className="flex-row-center">
                                            <span className="addon-label">
                                              {addonItem.addon}:
                                            </span>
                                            <span className="addon-value">
                                              {addonItem.value}
                                            </span>
                                            <span className="addon-location">
                                              [
                                              {addonItem.location.toLowerCase()}
                                              ]
                                            </span>
                                          </div>
                                          {addonItem.subItems.map(subitem => (
                                            <div
                                              key={subitem.id}
                                              className="addon-item flex-row-center"
                                            >
                                              <span className="addon-label">
                                                {subitem.addon}:
                                              </span>
                                              <span className="addon-value">
                                                {subitem.value}
                                              </span>
                                              <span className="addon-location">
                                                [
                                                {subitem.location.toLowerCase()}
                                                ]
                                              </span>
                                            </div>
                                          ))}
                                        </div>
                                      )
                                    )}
                                  </div>
                                )}
                              </td>
                              <td>{item.sku.color.label}</td>
                              <td>{item.sku.size.label}</td>
                              <td>{formatToMoney(item.price)}</td>
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

                  <div className="order-summary">
                    <h3 className="section-title">Order summary</h3>
                    <div className="detail-grid">
                      <div>
                        <div className="detail-item">
                          <div className="label">Subtotal</div>
                          <div className="value">
                            {formatToMoney(data.order.summary.subtotal, true)}
                          </div>
                        </div>

                        <div className="detail-item">
                          <div className="label">Sales Tax</div>
                          <div className="value">
                            {formatToMoney(data.order.summary.salesTax, true)}
                          </div>
                        </div>

                        <div className="detail-item">
                          <div className="label">Shipping</div>
                          <div className="value">
                            {formatToMoney(data.order.summary.shipping, true)}
                          </div>
                        </div>

                        <div className="detail-item total">
                          <div className="label">Total</div>
                          <div className="value">
                            {formatToMoney(data.order.summary.total, true)}
                          </div>
                        </div>

                        <div className="detail-item">
                          <div className="label">Stripe Fee</div>
                          <div className="value">
                            -{formatToMoney(data.order.summary.stripeFee, true)}
                          </div>
                        </div>

                        <div className="detail-item">
                          <div className="label">Net</div>
                          <div className="value">
                            {data.order.summary.total -
                              data.order.summary.stripeFee <
                            0
                              ? '-'
                              : ''}
                            {formatToMoney(
                              Math.abs(
                                data.order.summary.total -
                                  data.order.summary.stripeFee
                              ),
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
                    addNote={addNote}
                    updateNote={updateNote}
                    deleteNote={deleteNote}
                  />
                </div>
              </>
            )}
          </div>
        </OrderStyles>

        {data?.order && data.store && (
          <PrintableOrder order={data.order} store={data.store} />
        )}

        {showCancelOrderModal && (
          <CancelOrderModalStyles>
            <div ref={cancelOrderRef} className="modal">
              <div>
                <h3>Cancel order</h3>
                <p>
                  Are you sure you want to cancel this order? This will cause
                  the following changes:
                </p>
                <ul>
                  <li>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                    Order status set to 'canceled'.
                  </li>
                  <li>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                    Order totals to $0.00.
                  </li>
                  <li>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                    All order items quantity to 0 and item total to $0.00.
                  </li>
                  <li>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                    All order items quantity will be added back to inventory
                    products inventory.
                  </li>
                </ul>
              </div>
              <div className="buttons">
                <button
                  type="button"
                  className="secondary-button"
                  onClick={() => setShowCancelOrderModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="primary-button"
                  onClick={handleCancelOrderClick}
                >
                  Cancel the order
                </button>
              </div>
              <CancelOrderMutationSpinner isLoading={cancelOrder.isLoading} />
            </div>
          </CancelOrderModalStyles>
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
    max-width: 74rem;
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
      color: #1c44b9;

      svg {
        color: #1c44b9;
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

      &.cancel-order {
        color: #991b1b;

        svg {
          color: #991b1b;
        }
      }

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
      color: #1c44b9;
      text-decoration: underline;
    }
  }

  .order-items,
  .order-summary {
    margin: 3.5rem 0 0;
  }

  .table-container {
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
        color: #1c44b9;
      }
    }
  }

  .addon-items {
    margin: 0.3125rem 0 0 0;
  }

  .addon-item {
    margin: 0.25rem 0 0;
    font-size: 0.8125rem;
    color: #374151;
  }

  .flex-row-center {
    display: flex;
    align-items: center;
  }

  .addon-label {
    margin: 0 0.25rem 0 0;
    display: inline-flex;
    color: #6b7280;
  }

  .addon-location {
    margin: 0 0 0 0.25rem;
    font-size: 0.625rem;
    color: #6b7280;
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

const CancelOrderModalStyles = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.6);
  z-index: 9999;

  .modal {
    position: relative;
    margin: -8rem 0 0;
    padding: 2.25rem 2.5rem 1.75rem;
    max-width: 26rem;
    width: 100%;
    text-align: left;
    background-color: #fff;
    border-radius: 0.375rem;
    box-shadow: 0 25px 50px -12px rgb(0 0 0 / 0.25);

    h3 {
      margin: 0 0 0.75rem;
      font-size: 1.25rem;
      font-weight: 600;
      color: #111827;
    }

    p {
      margin: 0 0 1rem;
      font-size: 1rem;
      color: #1f2937;
      line-height: 1.5;
    }

    ul {
      margin: 1rem 0;
      padding: 0;
    }

    li {
      margin: 0 0 0.75rem;
      display: flex;
      gap: 0.5rem;
      font-size: 0.875rem;
      list-style: none;
      line-height: 1.5;

      svg {
        margin: 4px 0 0;
        flex-shrink: 0;
        height: 0.875rem;
        width: 0.875rem;
        color: #059669;
      }
    }

    .buttons {
      margin: 2rem 0 0;
      display: flex;
      justify-content: flex-end;
      align-items: center;
      gap: 0.75rem;
    }

    .primary-button,
    .secondary-button {
      padding: 0.5rem 1.25rem;
      font-size: 0.875rem;
      font-weight: 500;
      border-radius: 0.25rem;
      cursor: pointer;

      &:hover {
        color: #000;
        border-color: #c6cbd2;
        box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.1);
      }

      &:focus {
        outline: 2px solid transparent;
        outline-offset: 2px;
      }

      &:focus-visible {
        box-shadow: rgb(255, 255, 255) 0px 0px 0px 2px, #1c44b9 0px 0px 0px 4px,
          rgba(0, 0, 0, 0) 0px 0px 0px 0px;
      }
    }

    .primary-button {
      color: #b91c1c;
      background-color: #fee2e2;
      border: 1px solid #fdcfcf;
      box-shadow: inset 0 1px 1px #fff;

      &:hover {
        color: #a81919;
        border-color: #fcbcbc;
        box-shadow: inset 0 1px 1px #fff, rgba(0, 0, 0, 0) 0px 0px 0px 0px,
          rgba(0, 0, 0, 0) 0px 0px 0px 0px, rgba(0, 0, 0, 0.05) 0px 1px 2px 0px;
      }
    }

    .secondary-button {
      color: #1f2937;
      background-color: transparent;
      border: 1px solid #d1d5db;
      border-radius: 0.3125rem;
      box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05);
      cursor: pointer;
    }
  }
`;

const CancelOrderMutationSpinner = styled(LoadingSpinner)`
  position: absolute;
  top: 1.25rem;
  right: 1.25rem;
`;
