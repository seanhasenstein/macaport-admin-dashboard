import React from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import styled from 'styled-components';
import { format } from 'date-fns';
import useOutsideClick from '../../../hooks/useOutsideClick';
import useEscapeKeydownClose from '../../../hooks/useEscapeKeydownClose';
import { useSession } from '../../../hooks/useSession';
import { Store as StoreInterface, Note } from '../../../interfaces';
import {
  formatPhoneNumber,
  getQueryParameter,
  getStoreStatus,
} from '../../../utils';
import Layout from '../../../components/Layout';
import Notes from '../../../components/Notes';
import StoreProducts from '../../../components/StoreProducts';
import OrdersTable from '../../../components/OrdersTable';
import LoadingSpinner from '../../../components/LoadingSpinner';
import Notification from '../../../components/Notification';
import CSVDownloadModal from '../../../components/CSVDownloadModal';
import PrintableOrder from '../../../components/PrintableOrder';

type StoreStatus = 'upcoming' | 'open' | 'closed';

export default function Store() {
  const [session, loading] = useSession({ required: true });
  const router = useRouter();
  const queryClient = useQueryClient();
  const storeMenuRef = React.useRef<HTMLDivElement>(null);
  const deleteStoreRef = React.useRef<HTMLDivElement>(null);
  const deleteProductRef = React.useRef<HTMLDivElement>(null);
  const csvModalRef = React.useRef<HTMLDivElement>(null);
  const [enableStoreQuery, setEnableStoreQuery] = React.useState(true);
  const [storeStatus, setStoreStatus] = React.useState<StoreStatus>();
  const [showStoreMenu, setShowStoreMenu] = React.useState(false);
  const [showDeleteProductModal, setShowDeleteProductModal] =
    React.useState(false);
  const [showDeleteStoreModal, setShowDeleteStoreModal] = React.useState(false);
  const [showCsvModal, setShowCsvModal] = React.useState(false);
  useOutsideClick(showStoreMenu, setShowStoreMenu, storeMenuRef);
  useOutsideClick(
    showDeleteStoreModal,
    setShowDeleteStoreModal,
    deleteStoreRef
  );
  useOutsideClick(
    showDeleteProductModal,
    setShowDeleteProductModal,
    deleteProductRef
  );
  useEscapeKeydownClose(showStoreMenu, setShowStoreMenu);
  useEscapeKeydownClose(showDeleteStoreModal, setShowDeleteStoreModal);
  useEscapeKeydownClose(showDeleteProductModal, setShowDeleteProductModal);

  const storeQuery = useQuery<StoreInterface>(
    ['stores', 'store', router.query.id],
    async () => {
      if (!router.query.id) return;
      const response = await fetch(`/api/stores/${router.query.id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch the store.');
      }
      const data = await response.json();
      return data.store;
    },
    {
      initialData: () => {
        return queryClient
          .getQueryData<StoreInterface[]>('stores')
          ?.find(s => s._id === router.query.id);
      },
      initialDataUpdatedAt: () =>
        queryClient.getQueryState(['stores'])?.dataUpdatedAt,
      onSuccess: data => {
        if (data) {
          setStoreStatus(getStoreStatus(data.openDate, data.closeDate));
        }
      },
      staleTime: 1000 * 60 * 10,
      enabled: enableStoreQuery,
    }
  );

  const deleteStoreMutation = useMutation(
    async (id: string) => {
      setEnableStoreQuery(false);
      const response = await fetch(`/api/stores/delete?id=${router.query.id}`, {
        method: 'post',
        body: JSON.stringify({ id }),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        setEnableStoreQuery(true);
        throw new Error('Failed to delete the store.');
      }

      const data = await response.json();
      return data;
    },
    {
      onMutate: async id => {
        await queryClient.cancelQueries(['stores', 'store', router.query.id]);
        const previousStores = queryClient.getQueryData<StoreInterface[]>([
          'stores',
        ]);
        const updatedStores = previousStores?.filter(s => s._id !== id);
        queryClient.setQueryData(['stores'], updatedStores);
        return previousStores;
      },
      onError: (_error, _id, context) => {
        // TODO: trigger a notification
        queryClient.setQueryData(['stores'], context);
      },
      onSettled: async () => {
        queryClient.invalidateQueries(['stores']);
      },
      onSuccess: () => {
        router.push(`/?deleteStore=true`);
      },
    }
  );

  const addNoteMutation = useMutation(
    async (note: Note) => {
      if (!storeQuery.data) return;
      const prevNotes = storeQuery.data.notes || [];

      const response = await fetch(`/api/stores/update?id=${router.query.id}`, {
        method: 'post',
        body: JSON.stringify({ notes: [...prevNotes, note] }),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to create the note.');
      }

      const data = await response.json();
      return data.store;
    },
    {
      onMutate: async newNote => {
        await queryClient.cancelQueries(['stores', 'store', router.query.id]);
        const previousNotes = storeQuery.data?.notes || [];
        queryClient.setQueryData(['stores', 'store', router.query.id], {
          ...storeQuery.data,
          notes: [...previousNotes, newNote],
        });
        return { previousNotes, newNote };
      },
      onError: () => {
        // TODO: trigger a notification that the mutation failed.
        queryClient.setQueryData(
          ['stores', 'store', router.query.id],
          storeQuery.data
        );
      },
      onSettled: () => {
        queryClient.invalidateQueries('stores');
      },
    }
  );

  const updateNoteMutation = useMutation(
    async (note: Note) => {
      const notes = storeQuery.data?.notes.map(n => {
        if (n.id === note.id) {
          return note;
        } else {
          return n;
        }
      });

      const response = await fetch(`/api/stores/update?id=${router.query.id}`, {
        method: 'post',
        body: JSON.stringify({ notes }),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to update the note.');
      }

      const data = await response.json();
      return data.store;
    },
    {
      onMutate: async updatedNote => {
        await queryClient.cancelQueries(['stores', 'store', router.query.id]);
        const previousNotes = storeQuery.data?.notes;
        const updatedNotes = previousNotes?.map(n =>
          n.id === updatedNote.id ? updatedNote : n
        );
        queryClient.setQueryData(['stores', 'store', router.query.id], {
          ...storeQuery.data,
          notes: updatedNotes,
        });
        return { previousNotes, updatedNote };
      },
      onError: () => {
        // TODO: trigger a notification
        queryClient.setQueryData(
          ['stores', 'store', router.query.id],
          storeQuery.data
        );
      },
      onSettled: () => {
        queryClient.invalidateQueries('stores');
      },
    }
  );

  const deleteNoteMutation = useMutation(
    async (id: string) => {
      const notes = storeQuery.data?.notes.filter(n => n.id !== id);

      const response = await fetch(`/api/stores/update?id=${router.query.id}`, {
        method: 'post',
        body: JSON.stringify({ notes }),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to delete the note.');
      }

      const data = await response.json();
      return data.store;
    },
    {
      onMutate: async id => {
        await queryClient.cancelQueries(['stores', 'store', router.query.id]);
        const previousNotes = storeQuery.data?.notes;
        const updatedNotes = previousNotes?.filter(n => n.id !== id);
        queryClient.setQueryData(['stores', 'store', router.query.id], {
          ...storeQuery.data,
          notes: updatedNotes,
        });
        return { previousNotes };
      },
      onError: () => {
        // TODO: trigger a notification?
        queryClient.setQueryData(
          ['stores', 'store', router.query.id],
          storeQuery.data
        );
      },
      onSettled: () => {
        queryClient.invalidateQueries('stores');
      },
    }
  );

  React.useEffect(() => {
    if (storeQuery.data) {
      setStoreStatus(
        getStoreStatus(storeQuery.data.openDate, storeQuery.data.closeDate)
      );
    }
  }, [storeQuery.data]);

  const handleDeleteStoreMenuClick = () => {
    setShowStoreMenu(false);
    setShowDeleteStoreModal(true);
  };

  const handleDeleteStoreClick = () => {
    const id = getQueryParameter(router.query.id);
    if (!id) throw Error('A store ID is required to delete a store.');
    deleteStoreMutation.mutate(id);
  };

  if (loading || !session) return <div />;

  return (
    <Layout title={`${storeQuery.data?.name} | Macaport Dashboard`}>
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
              <div className="actions-row">
                <Link href="/">
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
                    Back to stores
                  </a>
                </Link>

                <div className="store-menu-container">
                  <button
                    type="button"
                    onClick={() => setShowStoreMenu(!showStoreMenu)}
                    className="store-menu-button"
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
                    ref={storeMenuRef}
                    className={`menu${showStoreMenu ? ' show' : ''}`}
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
                      Print unfulfilled orders
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setShowCsvModal(true);
                        setShowStoreMenu(false);
                      }}
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
                          d="M17 16v2a2 2 0 01-2 2H5a2 2 0 01-2-2v-7a2 2 0 012-2h2m3-4H9a2 2 0 00-2 2v7a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-1m-1 4l-3 3m0 0l-3-3m3 3V3"
                        />
                      </svg>
                      Download orders to csv
                    </button>

                    <Link href={`/stores/update?id=${router.query.id}`}>
                      <a className="menu-link">
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
                            d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                          />
                        </svg>
                        Edit store
                      </a>
                    </Link>

                    <button
                      type="button"
                      onClick={handleDeleteStoreMenuClick}
                      className="delete-button"
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
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                      Delete store
                    </button>
                  </div>
                </div>
              </div>

              <div className="store-header">
                <div className="store-name-status">
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

              <div className="main-content">
                <FetchingSpinner isLoading={storeQuery.isFetching} />

                <div>
                  <h3 className="section-title">Store details</h3>
                  <div className="detail-grid">
                    <div>
                      <div className="detail-item">
                        <div className="label">Open date</div>
                        <div className="value">
                          {format(
                            new Date(storeQuery.data.openDate),
                            "MMM. dd, yyyy 'at' h:mmaa"
                          )}
                        </div>
                      </div>

                      <div className="detail-item">
                        <div className="label">Close date</div>
                        <div className="value">
                          {storeQuery.data.closeDate
                            ? format(
                                new Date(storeQuery.data.closeDate),
                                "MMM. dd, yyyy 'at' h:mmaa"
                              )
                            : 'Permanently Open'}
                        </div>
                      </div>

                      <div className="detail-item">
                        <div className="label">Primary shipping</div>
                        <div className="value">
                          {storeQuery.data.hasPrimaryShippingLocation ? (
                            <>
                              {storeQuery.data.primaryShippingLocation.name}{' '}
                              <br />
                              {
                                storeQuery.data.primaryShippingLocation.street
                              }{' '}
                              <br />
                              {storeQuery.data.primaryShippingLocation
                                .street2 ? (
                                <>
                                  {
                                    storeQuery.data.primaryShippingLocation
                                      .street2
                                  }{' '}
                                  <br />
                                </>
                              ) : null}
                              {storeQuery.data.primaryShippingLocation.city}
                              {storeQuery.data.primaryShippingLocation.state &&
                                `, ${storeQuery.data.primaryShippingLocation.state}`}{' '}
                              {storeQuery.data.primaryShippingLocation.zipcode}
                            </>
                          ) : (
                            'None'
                          )}
                        </div>
                      </div>

                      <div className="detail-item">
                        <div className="label">Direct shipping</div>
                        <div className="value">
                          {storeQuery.data.allowDirectShipping ? 'Yes' : 'No'}
                        </div>
                      </div>

                      <div className="detail-item">
                        <div className="label">Name</div>
                        <div className="value">
                          {storeQuery.data.contact.firstName}{' '}
                          {storeQuery.data.contact.lastName}
                        </div>
                      </div>

                      <div className="detail-item">
                        <div className="label">Email</div>
                        <div className="value">
                          <a href={`mailto:${storeQuery.data.contact.email}`}>
                            {storeQuery.data.contact.email}
                          </a>
                        </div>
                      </div>

                      <div className="detail-item">
                        <div className="label">Phone</div>
                        <div className="value">
                          {formatPhoneNumber(storeQuery.data.contact.phone)}
                        </div>
                      </div>
                    </div>

                    <div>
                      <div className="detail-item">
                        <div className="label">Require group</div>
                        <div className="value capitalize">
                          {storeQuery.data.requireGroupSelection
                            ? storeQuery.data.groupTerm
                            : 'No'}
                        </div>
                      </div>

                      {storeQuery.data.requireGroupSelection && (
                        <div className="detail-item">
                          <div className="label capitalize">
                            {`${storeQuery.data.groupTerm}s`}
                          </div>
                          <div className="value">
                            <ul>
                              {storeQuery.data.groups.map((g, i) => (
                                <li key={i}>{g}</li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="store-products" id="products">
                    <StoreProducts
                      products={storeQuery.data.products}
                      storeId={storeQuery.data._id}
                    />
                    {(!storeQuery.data.products ||
                      storeQuery.data.products.length < 1) && (
                      <div className="empty empty-products">
                        This store has no products.
                      </div>
                    )}
                  </div>
                </div>

                <div className="store-orders" id="orders">
                  <h3>Store orders</h3>
                  {storeQuery.data.orders ? (
                    <OrdersTable
                      store={storeQuery.data}
                      orders={storeQuery.data.orders}
                    />
                  ) : (
                    <div className="empty empty-orders">
                      This store has no orders.
                    </div>
                  )}
                </div>

                <Notes
                  label="Store"
                  notes={storeQuery.data.notes}
                  addNote={addNoteMutation}
                  updateNote={updateNoteMutation}
                  deleteNote={deleteNoteMutation}
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

      {showDeleteStoreModal && (
        <DeleteModalStyles>
          <div ref={deleteStoreRef} className="modal">
            <div>
              <h3>Delete store</h3>
              <p>Are you sure you want to delete {storeQuery.data?.name}?</p>
            </div>
            <div className="buttons">
              <button
                type="button"
                className="secondary-button"
                onClick={() => setShowDeleteStoreModal(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="primary-button"
                onClick={handleDeleteStoreClick}
              >
                Delete the store
              </button>
            </div>
            <DeleteMutationSpinner isLoading={deleteStoreMutation.isLoading} />
          </div>
        </DeleteModalStyles>
      )}

      {showCsvModal && (
        <CSVDownloadModal
          containerRef={csvModalRef}
          store={storeQuery.data}
          showModal={showCsvModal}
          setShowModal={setShowCsvModal}
        />
      )}

      <div className="printable-orders" aria-hidden="true">
        {storeQuery?.data?.orders?.map(o => {
          if (o.orderStatus === 'Unfulfilled') {
            const options = {
              includesName: o.items.some(i => i.customName),
              includesNumber: o.items.some(i => i.customNumber),
            };
            return (
              <PrintableOrder
                key={o.orderId}
                order={o}
                store={storeQuery.data}
                options={options}
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
    max-width: 75rem;
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
      color: #1c5eb9;

      svg {
        color: #1c5eb9;
      }
    }
  }

  .store-menu-container {
    display: flex;
    justify-content: flex-end;
    width: 25%;

    .menu {
      top: 5.5rem;
      right: 0;
    }
  }

  .store-menu-button {
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

  .menu-link,
  .delete-button {
    padding: 0.75rem 1.5rem 0.75rem 0;
    width: 100%;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    background-color: transparent;
    border: none;
    font-size: 0.875rem;
    font-weight: 400;
    color: #1f2937;
    text-align: left;
    cursor: pointer;

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

  .menu-link {
    border-bottom: 1px solid #e5e7eb;
  }

  .delete-button:hover {
    color: #991b1b;

    svg {
      color: #991b1b;
    }
  }

  .store-header {
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

  .store-name-status {
    display: flex;
    align-items: center;
    gap: 1rem;
  }

  .store-status {
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

    ul {
      margin: 0;
      padding: 0;
      list-style: none;
    }

    li {
      margin: 0 0 0.25rem;
    }

    a:hover {
      color: #1c5eb9;
      text-decoration: underline;
    }
  }

  .store-orders,
  .store-products {
    margin: 4.5rem 0 0;
  }

  .error {
    font-size: 1.125rem;
    font-weight: 500;
    color: #1f2937;
  }

  .contact-info {
    display: flex;
  }

  .empty {
    margin: 2rem 0 0;
    font-size: 1rem;
    font-weight: 500;
    color: #89909d;
  }

  .capitalize {
    text-transform: capitalize;
  }

  @media print {
    display: none;
  }
`;

const DeleteModalStyles = styled.div`
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
    border-radius: 0.5rem;
    box-shadow: 0 25px 50px -12px rgb(0 0 0 / 0.25);

    h3 {
      margin: 0 0 0.75rem;
      font-size: 1.25rem;
      font-weight: 600;
      color: #111827;
    }

    p {
      margin: 0 0 1.5rem;
      font-size: 1rem;
      color: #4b5563;
      line-height: 1.5;
    }

    .buttons {
      margin: 1.25rem 0 0;
      display: flex;
      justify-content: flex-end;
      align-items: center;
      gap: 0.625rem;
    }

    .primary-button,
    .secondary-button {
      font-size: 0.875rem;
      font-weight: 500;
      cursor: pointer;
    }

    .primary-button {
      padding: 0.5rem 1.25rem;
      color: #b91c1c;
      background-color: #fee2e2;
      border: 1px solid #fdcfcf;
      box-shadow: inset 0 1px 1px #fff;
      border-radius: 0.25rem;

      &:hover {
        color: #a81919;
        border-color: #fcbcbc;
        box-shadow: inset 0 1px 1px #fff, rgba(0, 0, 0, 0) 0px 0px 0px 0px,
          rgba(0, 0, 0, 0) 0px 0px 0px 0px, rgba(0, 0, 0, 0.05) 0px 1px 2px 0px;
      }

      &:focus {
        outline: 2px solid transparent;
        outline-offset: 2px;
      }

      &:focus-visible {
        text-decoration: underline;
      }
    }

    .secondary-button {
      color: #4b5563;
      background-color: transparent;
      border: none;

      &:hover {
        color: #1f2937;
        text-decoration: underline;
      }

      &:focus {
        outline: 2px solid transparent;
        outline-offset: 2px;
      }

      &:focus-visible {
        text-decoration: underline;
      }
    }
  }
`;

const FetchingSpinner = styled(LoadingSpinner)`
  position: absolute;
  top: 2rem;
  right: 0;
`;

const DeleteMutationSpinner = styled(LoadingSpinner)`
  position: absolute;
  top: 1.25rem;
  right: 1.25rem;
`;
