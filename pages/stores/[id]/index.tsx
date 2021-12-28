import React from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import styled from 'styled-components';
import { format } from 'date-fns';
import useActiveNavTab from '../../../hooks/useActiveNavTab';
import { useSession } from '../../../hooks/useSession';
import { Store as StoreInterface, Note } from '../../../interfaces';
import { formatPhoneNumber, getStoreStatus } from '../../../utils';
import Layout from '../../../components/Layout';
import Notes from '../../../components/Notes';
import StoreProducts from '../../../components/StoreProducts';
import OrdersTable from '../../../components/OrdersTable';
import LoadingSpinner from '../../../components/LoadingSpinner';

const navValues = ['details', 'products', 'orders', 'notes'];
type NavValue = typeof navValues[number];
type StoreStatus = 'upcoming' | 'open' | 'closed';

export default function Store() {
  const [session, loading] = useSession({ required: true });
  const router = useRouter();
  const { activeNav, setActiveNav } = useActiveNavTab(
    navValues,
    `/stores/${router.query.id}?`
  );
  const queryClient = useQueryClient();

  const [storeStatus, setStoreStatus] = React.useState<StoreStatus>();
  const [productIdToDelete, setProductIdToDelete] = React.useState<string>();
  const [showDeleteProductModal, setShowDeleteProductModal] =
    React.useState(false);

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
        queryClient.getQueryState('stores')?.dataUpdatedAt,
      onSuccess: data => {
        if (data) {
          setStoreStatus(getStoreStatus(data.openDate, data.closeDate));
        }
      },
      staleTime: 1000 * 60 * 10,
    }
  );

  const deleteProductMutation = useMutation(
    async (id: string | undefined) => {
      if (!id) {
        setShowDeleteProductModal(false);
        throw new Error('No product id was provided.');
      }
      const filteredProducts = storeQuery.data?.products.filter(
        p => p.id !== id
      );

      const response = await fetch(`/api/stores/update?id=${router.query.id}`, {
        method: 'post',
        body: JSON.stringify({ products: filteredProducts }),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to delete the product.');
      }

      const data = await response.json();
      return data.store;
    },
    {
      onMutate: async id => {
        await queryClient.cancelQueries(['stores', 'store', router.query.id]);
        const updatedProducts = storeQuery.data?.products.filter(
          p => p.id !== id
        );
        const updatedStore = { ...storeQuery.data, products: updatedProducts };
        queryClient.setQueryData(
          ['stores', 'store', router.query.id],
          updatedStore
        );
      },
      onError: () => {
        // TODO: trigger a notafication
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

  const handleCancelDeleteProductClick = () => {
    setShowDeleteProductModal(false);
    setProductIdToDelete(undefined);
  };

  const handleDeleteProductClick = () => {
    deleteProductMutation.mutate(productIdToDelete);
    setShowDeleteProductModal(false);
    setProductIdToDelete(undefined);
  };

  React.useEffect(() => {
    if (storeQuery.data) {
      setStoreStatus(
        getStoreStatus(storeQuery.data.openDate, storeQuery.data.closeDate)
      );
    }
  }, [storeQuery.data]);

  const handleNavClick = (value: NavValue) => {
    setActiveNav(value);
    router.push(`/stores/${router.query.id}?active=${value}`, undefined, {
      shallow: true,
    });
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
              <Link href={`/stores/update?id=${router.query.id}`}>
                <a className="edit-store-link">Edit Store</a>
              </Link>
              <div className="store-header">
                <h2>{storeQuery.data.name}</h2>
                <p>{storeQuery.data.storeId}</p>
              </div>

              <div className="store-nav">
                <button
                  type="button"
                  onClick={() => handleNavClick('details')}
                  className={activeNav === 'details' ? 'active' : ''}
                >
                  <span>Details</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleNavClick('products')}
                  className={activeNav === 'products' ? 'active' : ''}
                >
                  <span>Products</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleNavClick('orders')}
                  className={activeNav === 'orders' ? 'active' : ''}
                >
                  <span>Orders</span>
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
                <FetchingSpinner isLoading={storeQuery.isFetching} />
                {activeNav === 'details' && (
                  <>
                    <h3>Store Details</h3>
                    <div className="store-details">
                      <div className="section">
                        <div className="info-item">
                          <div className="label">Status</div>
                          <div className="value">
                            <div className="store-status">
                              <span className={storeStatus}>
                                <div className="dot" />
                                {storeStatus === 'upcoming'
                                  ? 'Upcoming'
                                  : storeStatus === 'open'
                                  ? 'Open'
                                  : 'Closed'}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="info-item">
                          <div className="label">Open Date</div>
                          <div className="value">
                            {format(
                              new Date(storeQuery.data.openDate),
                              'LLL dd, yyyy, h:mm a'
                            )}
                          </div>
                        </div>
                        <div className="info-item">
                          <div className="label">Close Date</div>
                          <div className="value">
                            {storeQuery.data.closeDate
                              ? format(
                                  new Date(storeQuery.data.closeDate),
                                  'LLL dd, yyyy, h:mm a'
                                )
                              : 'Open Permanently'}
                          </div>
                        </div>
                      </div>

                      <div className="section">
                        <div className="info-item">
                          <div className="label">Primary Shipping Address</div>
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
                                {storeQuery.data.primaryShippingLocation
                                  .state &&
                                  `, ${storeQuery.data.primaryShippingLocation.state}`}{' '}
                                {
                                  storeQuery.data.primaryShippingLocation
                                    .zipcode
                                }
                              </>
                            ) : (
                              'None'
                            )}
                          </div>
                        </div>
                        <div className="info-item">
                          <div className="label">Allows Direct Shipping</div>
                          <div className="value">
                            {storeQuery.data.allowDirectShipping ? 'Yes' : 'No'}
                          </div>
                        </div>
                        <div className="info-item">
                          <div className="label">Require group at checkout</div>
                          <div className="value capitalize">
                            {storeQuery.data.requireGroupSelection
                              ? storeQuery.data.groupTerm
                              : 'No'}
                          </div>
                        </div>
                      </div>
                      <div className="section">
                        {storeQuery.data.category === 'client' ? (
                          <>
                            <div className="info-item">
                              <div className="label">Name</div>
                              <div className="value">
                                {storeQuery.data.contact.firstName}{' '}
                                {storeQuery.data.contact.lastName}
                              </div>
                            </div>
                            <div className="info-item">
                              <div className="label">Email</div>
                              <div className="value">
                                <a
                                  href={`mailto:${storeQuery.data.contact.email}`}
                                >
                                  {storeQuery.data.contact.email}
                                </a>
                              </div>
                            </div>
                            <div className="info-item">
                              <div className="label">Phone</div>
                              <div className="value">
                                {formatPhoneNumber(
                                  storeQuery.data.contact.phone
                                )}
                              </div>
                            </div>
                          </>
                        ) : storeQuery.data.category === 'macaport' ? (
                          <div className="info-item">
                            <div className="label">Category</div>
                            <div className="value">Macaport Store</div>
                          </div>
                        ) : null}
                      </div>
                    </div>
                  </>
                )}

                {activeNav === 'products' && (
                  <div className="section" id="products">
                    <div>
                      <StoreProducts
                        products={storeQuery.data.products}
                        storeId={storeQuery.data._id}
                        setProductIdToDelete={setProductIdToDelete}
                        setShowDeleteProductModal={setShowDeleteProductModal}
                      />
                      {(!storeQuery.data.products ||
                        storeQuery.data.products.length < 1) && (
                        <div className="empty empty-products">
                          This store has no products.
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {activeNav === 'orders' && (
                  <div className="section orders" id="orders">
                    <h3>Store Orders</h3>
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
                )}

                {activeNav === 'notes' && (
                  <Notes
                    label="Store"
                    notes={storeQuery.data.notes}
                    addNote={addNoteMutation}
                    updateNote={updateNoteMutation}
                    deleteNote={deleteNoteMutation}
                  />
                )}
              </div>
            </>
          )}
        </div>
      </StoreStyles>
      {showDeleteProductModal && (
        <DeleteProductModalStyles>
          <div className="modal">
            <div>
              <h3>Delete Product</h3>
              <p>Are you sure you want to delete this product?</p>
            </div>
            <div className="buttons">
              <button
                type="button"
                className="secondary-button"
                onClick={handleCancelDeleteProductClick}
              >
                Cancel
              </button>
              <button
                type="button"
                className="primary-button"
                onClick={handleDeleteProductClick}
              >
                Delete the product
              </button>
            </div>
          </div>
        </DeleteProductModalStyles>
      )}
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
    margin: 0 auto;
    padding: 3rem 0 0;
    max-width: 70rem;
    width: 100%;
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

  .edit-store-link {
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

  .store-header {
    margin: 3rem 0 2.25rem;

    p {
      margin: 0.25rem 0 0;
      color: #6b7280;
    }
  }

  .store-nav {
    padding: 0.625rem 0;
    display: flex;
    align-items: center;
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

    a {
      font-size: 0.875rem;
      font-weight: 500;
      color: #374151;
    }
  }

  .body {
    position: relative;
    padding: 3.5rem 0;
  }

  .store-details {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
  }

  .store-status {
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

      &.closed {
        background-color: #fee2e2;
        border: 1px solid #fecaca;
        box-shadow: inset 0 1px 1px #fff;
        color: #991b1b;

        .dot {
          background-color: #ef4444;
          border: 2px solid #fca5a5;
        }
      }

      &.open {
        background-color: #d1fae5;
        border: 1px solid #a7f3d0;
        box-shadow: inset 0 1px 1px #fff;
        color: #065f46;

        .dot {
          background-color: #10b981;
          border: 2px solid #6ee7b7;
        }
      }

      &.upcoming {
        background-color: #fef3c7;
        border: 1px solid #fef08a;
        box-shadow: inset 0 1px 1px #fff;
        color: #92400e;

        .dot {
          background-color: #f59e0b;
          border: 2px solid #fcd34d;
        }
      }
    }
  }

  .error {
    font-size: 1.125rem;
    font-weight: 500;
    color: #1f2937;
  }

  .contact-info {
    display: flex;
  }

  .info-item {
    padding: 1.25rem 0;
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
    margin: 0 0 0.5rem;
    font-size: 0.8125rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.0375em;
    color: #89909d;
  }

  .value {
    color: #111827;
    line-height: 1.5;

    a:hover {
      text-decoration: underline;
      color: #2c33bb;
    }
  }

  .menu-button {
    margin-left: auto;
    padding: 1rem 0.5rem;
    display: flex;
    justify-content: center;
    align-items: center;
    background-color: transparent;
    border: none;
    color: #6b7280;
    cursor: pointer;

    &:hover {
      color: #111827;
    }

    svg {
      height: 1rem;
      width: 1rem;
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
  .edit-button,
  .delete-button {
    padding: 0.75rem 2rem 0.75rem 0;
    width: 100%;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    background-color: transparent;
    border: none;
    font-size: 0.875rem;
    font-weight: 400;
    color: #111827;
    text-align: left;
    cursor: pointer;

    &:hover {
      color: #4338ca;

      svg {
        color: #4338ca;
      }
    }

    svg {
      height: 1rem;
      width: 1rem;
      color: #9ca3af;
    }
  }

  .edit-button,
  .menu-link {
    border-bottom: 1px solid #e5e7eb;
  }

  .delete-button:hover {
    color: #b91c1c;

    svg {
      color: #b91c1c;
    }
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
`;

const DeleteProductModalStyles = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 9999;

  .modal {
    position: relative;
    padding: 2.5rem 3rem 2rem;
    max-width: 26rem;
    width: 100%;
    text-align: left;
    background-color: #fff;
    border-radius: 0.25rem;
    box-shadow: rgba(0, 0, 0, 0) 0px 0px 0px 0px,
      rgba(0, 0, 0, 0) 0px 0px 0px 0px, rgba(0, 0, 0, 0.1) 0px 20px 25px -5px,
      rgba(0, 0, 0, 0.04) 0px 10px 10px -5px;

    h3 {
      margin: 0 0 1.125rem;
      font-size: 1.25rem;
      font-weight: 500;
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
