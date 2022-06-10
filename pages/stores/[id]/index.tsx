import React from 'react';
import { useRouter } from 'next/router';
import styled from 'styled-components';
import { getStoreStatus } from '../../../utils';
import { useSession } from '../../../hooks/useSession';
import { useStoreQuery } from '../../../hooks/useStoreQuery';
import { useStoreMutations } from '../../../hooks/useStoreMutations';
import useOutsideClick from '../../../hooks/useOutsideClick';
import useEscapeKeydownClose from '../../../hooks/useEscapeKeydownClose';
import Layout from '../../../components/Layout';
import Notes from '../../../components/Notes';
import PageNavigationButtons from '../../../components/PageNavigationButtons';
import StoreMenu from '../../../components/store/StoreMenu';
import StoreDetails from '../../../components/store/StoreDetails';
import StoreProducts from '../../../components/store/StoreProducts';
import StoreOrders from '../../../components/store/StoreOrders';
import LoadingSpinner from '../../../components/LoadingSpinner';
import Notification from '../../../components/Notification';
import CSVDownloadModal from '../../../components/store/CSVDownloadModal';
import PrintableOrder from '../../../components/PrintableOrder';
import DeleteStoreModal from '../../../components/store/DeleteStoreModal';

type StoreStatus = 'upcoming' | 'open' | 'closed';

export default function Store() {
  const [session, loading] = useSession({ required: true });
  const router = useRouter();
  const deleteProductRef = React.useRef<HTMLDivElement>(null);
  const csvModalRef = React.useRef<HTMLDivElement>(null);
  const [storeStatus, setStoreStatus] = React.useState<StoreStatus>();
  const [showDeleteProductModal, setShowDeleteProductModal] =
    React.useState(false);
  const [showDeleteStoreModal, setShowDeleteStoreModal] = React.useState(false);
  const [showCSVModal, setShowCSVModal] = React.useState(false);
  useOutsideClick(
    showDeleteProductModal,
    setShowDeleteProductModal,
    deleteProductRef
  );
  useEscapeKeydownClose(showDeleteProductModal, setShowDeleteProductModal);
  const storeQuery = useStoreQuery();
  const { addNote, updateNote, deleteNote } = useStoreMutations({
    store: storeQuery.data,
  });

  React.useEffect(() => {
    if (storeQuery.data) {
      setStoreStatus(
        getStoreStatus(storeQuery.data.openDate, storeQuery.data.closeDate)
      );
    }
  }, [storeQuery.data]);

  if (loading || !session) return <div />;

  return (
    <Layout
      title={
        storeQuery.data?.name
          ? `${storeQuery.data.name} | Macaport Dashboard`
          : 'Macaport Dashboard'
      }
    >
      <StoreStyles>
        <div className="container">
          {storeQuery.isLoading && (
            <LoadingSpinner isLoading={storeQuery.isLoading} />
          )}

          {storeQuery.isError && storeQuery.error instanceof Error && (
            <div>Error: {storeQuery.error}</div>
          )}

          {storeQuery.data && (
            <>
              <PageNavigationButtons />

              <div className="header">
                <div>
                  <div className="category">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
                    </svg>
                    <div>Website Store</div>
                  </div>
                  <div className="name-status-row">
                    <h2>{storeQuery.data.name}</h2>
                    <div className="store-status">
                      <span className={storeStatus}>
                        {storeStatus === 'upcoming'
                          ? 'Upcoming'
                          : storeStatus === 'open'
                          ? 'Open'
                          : 'Closed'}
                      </span>
                    </div>
                  </div>
                  <p>{storeQuery.data.storeId}</p>
                </div>
                <StoreMenu
                  setShowDeleteModal={setShowDeleteStoreModal}
                  setShowCSVModal={setShowCSVModal}
                />
              </div>

              <div className="main-content">
                <FetchingSpinner isLoading={storeQuery.isFetching} />
                <StoreDetails store={storeQuery.data} />
                <StoreProducts store={storeQuery.data} />
                <StoreOrders store={storeQuery.data} />
                <Notes
                  label="Store"
                  notes={storeQuery.data.notes}
                  addNote={addNote}
                  updateNote={updateNote}
                  deleteNote={deleteNote}
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
      </StoreStyles>

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

      <div className="printable-orders" aria-hidden="true">
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

  .header {
    display: flex;
    justify-content: space-between;
    align-items: center;

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

  .name-status-row {
    display: flex;
    align-items: center;
    gap: 1rem;
  }

  .store-status {
    span {
      padding: 0.3125rem 0.5rem;
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

      &.closed {
        background-color: #fee2e2;
        color: #991b1b;
      }

      &.upcoming {
        background-color: #feefb4;
        color: #92400e;
      }

      &.open {
        color: #14864d;
        background-color: #c9f7e0;
      }
    }
  }

  .main-content {
    position: relative;
    padding: 4rem 0;
  }

  .section-title {
    margin: 0 0 0.875rem;
    padding: 0 0 0.75rem;
    border-bottom: 1px solid #dcdfe4;
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
