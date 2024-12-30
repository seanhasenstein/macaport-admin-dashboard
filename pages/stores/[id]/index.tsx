import React from 'react';
import { useRouter } from 'next/router';
import styled from 'styled-components';
import { useReactToPrint } from 'react-to-print';

import { getStoreStatus } from '../../../utils';

import { Order, StoreStatus } from '../../../interfaces';

import { useStoreQuery } from '../../../hooks/useStoreQuery';
import { useOrderMutation } from '../../../hooks/useOrderMutations';
import useOutsideClick from '../../../hooks/useOutsideClick';
import useEscapeKeydownClose from '../../../hooks/useEscapeKeydownClose';

import Layout from '../../../components/Layout';
import PageNavButtons from '../../../components/PageNavButtons';
import StoreMenu from '../../../components/store/StoreMenu';
import StoreDetails from '../../../components/store/StoreDetails';
import StoreProducts from '../../../components/store/StoreProducts';
import StoreOrders from '../../../components/store/StoreOrders';
import LoadingSpinner from '../../../components/LoadingSpinner';
import Notification from '../../../components/Notification';
import CSVDownloadModal from '../../../components/store/CSVDownloadModal';
import PrintableOrder from '../../../components/PrintableOrder';
import DeleteStoreModal from '../../../components/store/DeleteStoreModal';
import TableLoadingSpinner from '../../../components/TableLoadingSpinner';
import CancelOrderModal from '../../../components/modals/CancelOrderModal';
import TriggerShipmentModal from '../../../components/store/TriggerShipmentModal';

export default function Store() {
  const router = useRouter();
  const storeQuery = useStoreQuery();

  const printUnfulfilledRef = React.useRef<HTMLDivElement>(null);
  const printPersonalizedRef = React.useRef<HTMLDivElement>(null);
  const printSingleRef = React.useRef<HTMLDivElement>(null);

  const handlePrintUnfulfilled = useReactToPrint({
    content: () => printUnfulfilledRef.current,
  });

  const handlePrintPersonalized = useReactToPrint({
    content: () => printPersonalizedRef.current,
  });

  const handlePrintSingle = useReactToPrint({
    content: () => printSingleRef.current,
  });

  const deleteProductRef = React.useRef<HTMLDivElement>(null);
  const csvModalRef = React.useRef<HTMLDivElement>(null);

  const [storeStatus, setStoreStatus] = React.useState<StoreStatus>();
  const [showDeleteProductModal, setShowDeleteProductModal] =
    React.useState(false);
  const [showDeleteStoreModal, setShowDeleteStoreModal] = React.useState(false);
  const [showCSVModal, setShowCSVModal] = React.useState(false);
  const [printOption, setPrintOption] = React.useState<
    'unfulfilled' | 'personalization' | 'single' | undefined
  >(undefined);
  const [selectedOrder, setSelectedOrder] = React.useState<Order | undefined>(
    undefined
  );
  const [showCancelOrderModal, setShowCancelOrderModal] = React.useState(false);
  const [showTriggerShipmentModal, setShowTriggerShipmentModal] =
    React.useState(false);

  const { setReceiptPrintedForUnfulfilledOrders } = useOrderMutation({
    store: storeQuery.data,
  });

  useOutsideClick(
    showDeleteProductModal,
    setShowDeleteProductModal,
    deleteProductRef
  );

  useEscapeKeydownClose(showDeleteProductModal, setShowDeleteProductModal);

  React.useEffect(() => {
    if (storeQuery.data) {
      setStoreStatus(
        getStoreStatus(storeQuery.data.openDate, storeQuery.data.closeDate)
      );

      if (storeQuery.data.orders && !selectedOrder) {
        if (router.query.orderId) {
          const order = storeQuery.data.orders.find(
            order => order.orderId === router.query.orderId
          );
          if (order) {
            setSelectedOrder(order);
          } else {
            setSelectedOrder(storeQuery.data.orders[0]);
          }
        } else {
          setSelectedOrder(storeQuery.data.orders[0]);
        }
      }
    }
  }, [router.query.orderId, selectedOrder, storeQuery.data]);

  React.useEffect(() => {
    if (printOption) {
      if (printOption === 'unfulfilled') {
        setReceiptPrintedForUnfulfilledOrders.mutate();
        handlePrintUnfulfilled();
      }
      if (printOption === 'personalization') {
        handlePrintPersonalized();
      }
      if (printOption === 'single') {
        handlePrintSingle();
      }
      setPrintOption(undefined);
    }
  }, [handlePrintPersonalized, handlePrintSingle, handlePrintUnfulfilled]);

  return (
    <Layout
      title={`${
        storeQuery.data?.name ? `${storeQuery.data.name} | ` : ''
      }Macaport Dashboard`}
      requiresAuth={true}
    >
      <StoreStyles>
        <div className="container">
          {storeQuery.isLoading && <TableLoadingSpinner />}

          {storeQuery.isError && storeQuery.error instanceof Error && (
            <div>Error: {storeQuery.error}</div>
          )}

          {storeQuery.data && (
            <>
              <PageNavButtons />

              <div>
                <FetchingSpinner isLoading={storeQuery.isFetching} />
                <div className="store-details-container">
                  <div className="header">
                    <div className="store-status-name-row">
                      <div className="store-status">
                        <span className={storeStatus}>
                          Store{' '}
                          {storeStatus === 'upcoming'
                            ? 'Upcoming'
                            : storeStatus === 'open'
                            ? 'Open'
                            : 'Closed'}
                        </span>
                      </div>
                      <h2 className="store-name">{storeQuery.data.name}</h2>
                    </div>
                    <StoreMenu
                      storeId={storeQuery.data._id}
                      storeStatus={storeStatus}
                      setShowDeleteModal={setShowDeleteStoreModal}
                      setShowCSVModal={setShowCSVModal}
                      setPrintOption={setPrintOption}
                      showTriggerStoreShipmentModal={() =>
                        setShowTriggerShipmentModal(true)
                      }
                    />
                  </div>
                  <StoreDetails store={storeQuery.data} />
                </div>
                <StoreProducts store={storeQuery.data} />
                <StoreOrders
                  store={storeQuery.data}
                  {...{
                    selectedOrder,
                    setSelectedOrder,
                    setPrintOption,
                    showCancelOrderModal,
                    setShowCancelOrderModal,
                    openTriggerStoreShipmentModal: () =>
                      setShowTriggerShipmentModal(true),
                  }}
                />
              </div>
            </>
          )}
        </div>

        <Notification
          query="createStore"
          heading="Store successfully created"
          callbackUrl={`/stores/${router.query.id}`}
        />
        <Notification
          query="updateStore"
          heading="Store successfully updated"
          callbackUrl={`/stores/${router.query.id}`}
        />
        <Notification
          query="addProduct"
          heading="Product successfully added"
          callbackUrl={`/stores/${router.query.id}`}
        />
        <Notification
          query="deleteProduct"
          heading="Product successfully deleted"
          callbackUrl={`/stores/${router.query.id}`}
        />
        {storeQuery.data && selectedOrder && showCancelOrderModal && (
          <CancelOrderModal
            store={storeQuery.data}
            order={selectedOrder}
            isOpen={showCancelOrderModal}
            closeModal={() => setShowCancelOrderModal(false)}
          />
        )}
      </StoreStyles>

      {storeQuery.data && showTriggerShipmentModal && (
        <TriggerShipmentModal
          closeModal={() => setShowTriggerShipmentModal(false)}
          isOpen={showTriggerShipmentModal}
          store={storeQuery.data}
        />
      )}

      {storeQuery.data && showDeleteStoreModal && (
        <DeleteStoreModal
          store={storeQuery.data}
          showModal={showDeleteStoreModal}
          setShowModal={setShowDeleteStoreModal}
        />
      )}

      {storeQuery.data && showCSVModal && (
        <CSVDownloadModal
          containerRef={csvModalRef}
          store={storeQuery.data}
          showModal={showCSVModal}
          setShowModal={setShowCSVModal}
        />
      )}

      {printOption === 'unfulfilled' ? (
        <div
          className="printable-orders"
          aria-hidden="true"
          ref={printUnfulfilledRef}
        >
          {storeQuery?.data?.orders?.map(order => {
            if (order.orderStatus === 'Unfulfilled') {
              return (
                <PrintableOrder
                  key={order.orderId}
                  order={order}
                  store={storeQuery.data}
                />
              );
            }
          })}
        </div>
      ) : null}

      {printOption === 'personalization' ? (
        <div
          className="printable-orders"
          aria-hidden="true"
          ref={printPersonalizedRef}
        >
          {storeQuery?.data?.orders?.map(order => {
            const orderHasAtLeastOnePersonalizationItem = order.items.some(
              item => item.personalizationAddons.length > 0
            );

            if (orderHasAtLeastOnePersonalizationItem) {
              return (
                <PrintableOrder
                  key={order.orderId}
                  order={order}
                  store={storeQuery.data}
                />
              );
            }
          })}
        </div>
      ) : null}

      {printOption === 'single' ? (
        <div ref={printSingleRef}>
          <PrintableOrder order={selectedOrder} store={storeQuery.data} />
        </div>
      ) : null}
    </Layout>
  );
}

const StoreStyles = styled.div`
  position: relative;

  h2 {
    margin: 0;
    font-size: 1.5rem;
    font-weight: 600;
    color: #111827;
    line-height: 100%;
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
    padding: 3rem 1.5rem 0;
    max-width: 74rem;
    width: 100%;
  }

  .store-details-container {
    margin: 1.875rem 0 0;
    padding: 1.625rem 1.75rem 1rem;
    background-color: #fff;
    border: 1px solid #e5e7eb;
    border-radius: 0.4375rem;
    box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05);
  }

  .header {
    margin: 0 0 1rem;
    padding: 0 0 1.625rem;
    display: flex;
    justify-content: space-between;
    border-bottom: 1px solid #e5e7eb;

    .store-status-name-row {
      display: flex;
      align-items: center;
    }

    .store-status {
      span {
        padding: 0.3125rem 0.5rem;
        display: inline-flex;
        align-items: center;
        font-size: 0.6875rem;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.075em;
        color: #374151;
        border-radius: 0.25rem;
        background: #fff;
        line-height: 1;
        border: 1px solid rgba(0, 0, 0, 0.12);

        &.closed {
          background-color: #fee2e2;
          color: #991b1b;
        }

        &.upcoming {
          background-color: #fef3c7;
          color: #92400e;
        }

        &.open {
          background-color: #d1fae5;
          color: #065f46;
        }
      }
    }

    .store-name {
      margin: 0 0 0 1.25rem;
      padding: 0 0 0 1rem;
      font-size: 1.25rem;
      font-weight: 800;
      color: #1f2937;
      letter-spacing: -0.025em;
      line-height: 100%;
      border-left: 1px solid #d1d5db;
    }
  }

  .section-title {
    margin: 0 0 0.875rem;
    padding: 0 0 0.75rem;
    border-bottom: 1px solid #d1d5db;
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
