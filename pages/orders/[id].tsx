import React from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import styled from 'styled-components';
import { format } from 'date-fns';
import { useOrderQuery } from '../../hooks/useOrderQuery';
import { useOrderMutation } from '../../hooks/useOrderMutations';
import Layout from '../../components/Layout';
import OrderStatusButton from '../../components/order/OrderStatusButton';
import LoadingSpinner from '../../components/LoadingSpinner';
import PrintableOrder from '../../components/PrintableOrder';
import OrderMenu from '../../components/order/OrderMenu';
import OrderDetails from '../../components/order/OrderDetails';
import OrderItems from '../../components/order/OrderItems';
import OrderSummary from '../../components/order/OrderSummary';
import CancelOrderModal from '../../components/order/CancelOrderModal';

export default function Order() {
  const router = useRouter();
  const [showCancelOrderModal, setShowCancelOrderModal] = React.useState(false);
  const { isLoading, isFetching, isError, error, data } = useOrderQuery();
  const { cancelOrder } = useOrderMutation({
    order: data?.order,
    store: data?.store,
  });

  return (
    <>
      <Layout
        title={`Order #${data?.order?.orderId} | Macaport Dashboard`}
        requiresAuth={true}
      >
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

                  <OrderMenu
                    orderStatus={data.order.orderStatus}
                    stripeId={data.order.stripeId}
                    setShowCancelOrderModal={setShowCancelOrderModal}
                  />
                </div>

                <div className="header">
                  <div>
                    <div className="category">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z" />
                        <path
                          fillRule="evenodd"
                          d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <div>Store Order</div>
                    </div>
                    <div className="order-name-status">
                      <h2>
                        {data.order.customer.firstName}{' '}
                        {data.order.customer.lastName}
                      </h2>
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
                    <p>#{data.order.orderId}</p>
                  </div>
                </div>

                <div className="main-content">
                  <FetchingSpinner isLoading={isFetching} />
                  <OrderDetails
                    order={data.order}
                    store={{
                      requireGroupSelection: data.store.requireGroupSelection,
                      groupTerm: data.store.groupTerm,
                    }}
                  />
                  <OrderItems order={data.order} />
                  <OrderSummary orderSummary={data.order.summary} />
                </div>
              </>
            )}
          </div>
        </OrderStyles>

        <PrintableOrder order={data?.order} store={data?.store} />

        <CancelOrderModal
          showModal={showCancelOrderModal}
          setShowModal={setShowCancelOrderModal}
          cancelOrder={cancelOrder}
        />
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

  .container {
    position: relative;
    margin: 0 auto;
    padding: 3rem 0 0;
    max-width: 74rem;
    width: 100%;
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

  .header {
    padding: 1.375rem 0;

    .category {
      margin: 0 0 1rem;
      display: flex;
      align-items: center;
      gap: 0.5rem;
      color: #374151;
      font-size: 0.875rem;
      font-weight: 500;
      text-transform: uppercase;
      letter-spacing: 0.025em;

      svg {
        height: 0.9375rem;
        width: 0.9375rem;
        color: #9ca3af;
      }
    }

    p {
      margin: 0.25rem 0 0;
      font-size: 1rem;
      font-weight: 500;
      color: #6b7280;
    }
  }

  .order-name-status {
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

  @media print {
    display: none;
  }
`;

const FetchingSpinner = styled(LoadingSpinner)`
  position: absolute;
  top: 2rem;
  right: 0;
`;
