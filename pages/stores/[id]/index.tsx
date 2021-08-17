import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import styled from 'styled-components';
import { format } from 'date-fns';
import { useSession } from '../../../hooks/useSession';
import { Store as StoreInterface, Note } from '../../../interfaces';
import { createId, formatPhoneNumber, getStoreStatus } from '../../../utils';
import Layout from '../../../components/Layout';
import StoreProductMenu from '../../../components/StoreProductMenu';
import Notes from '../../../components/Notes';
import OrdersTable from '../../../components/OrdersTable';

type StoreStatus = 'upcoming' | 'open' | 'closed';

export default function Store() {
  const [session, loading] = useSession({ required: true });
  const router = useRouter();
  const [storeStatus, setStoreStatus] = React.useState<StoreStatus>();
  const [showMenu, setShowMenu] = React.useState<string | undefined>(undefined);
  const [productIdToDelete, setProductIdToDelete] = React.useState<string>();
  const [showDeleteProductModal, setShowDeleteProductModal] =
    React.useState(false);
  const queryClient = useQueryClient();

  const {
    isLoading,
    isError,
    error,
    data: store,
  } = useQuery<StoreInterface>(
    ['store', router.query.id],
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
      staleTime: 600000,
    }
  );

  const deleteProductMutation = useMutation(
    async (id: string | undefined) => {
      if (id === undefined) {
        setShowDeleteProductModal(false);
        throw new Error('No product id was provided.');
      }
      const filteredProducts = store?.products.filter(p => p.id !== id);

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
      onSuccess: () => {
        queryClient.invalidateQueries('stores', { exact: true });
        queryClient.invalidateQueries(['store', router.query.id]);
        setProductIdToDelete(undefined);
        setShowDeleteProductModal(false);
      },
    }
  );

  const addNoteMutation = useMutation(
    async (text: string) => {
      if (!store) return;

      const note: Note = {
        id: createId('note'),
        text,
        createdAt: `${new Date()}`,
      };
      const prevNotes = store.notes || [];
      const updatedNotes = [...prevNotes, note];
      const response = await fetch(`/api/stores/update?id=${router.query.id}`, {
        method: 'post',
        body: JSON.stringify({ notes: updatedNotes }),
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
      onSuccess: data => {
        queryClient.invalidateQueries('stores', { exact: true });
        queryClient.invalidateQueries(['store', data._id]);
      },
    }
  );

  const updateNoteMutation = useMutation(
    async (note: Note) => {
      const notes = store?.notes.map(n => {
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
      onSuccess: data => {
        queryClient.invalidateQueries('stores', { exact: true });
        queryClient.invalidateQueries(['store', data._id]);
      },
    }
  );

  const deleteNoteMutation = useMutation(
    async (id: string) => {
      const notes = store?.notes.filter(n => n.id !== id);

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
      onSuccess: data => {
        queryClient.invalidateQueries('stores', { exact: true });
        queryClient.invalidateQueries(['store', data._id]);
      },
    }
  );

  const handleDeleteProductMenuClick = (id: string) => {
    setShowMenu(undefined);
    setProductIdToDelete(id);
    setShowDeleteProductModal(true);
  };

  const handleCancelDeleteProductClick = () => {
    setShowDeleteProductModal(false);
    setProductIdToDelete(undefined);
  };

  const handleProductMenuClick = (id: string) => {
    if (id === showMenu) {
      setShowMenu(undefined);
    } else {
      setShowMenu(id);
    }
  };

  React.useEffect(() => {
    if (store) {
      setStoreStatus(getStoreStatus(store.openDate, store.closeDate));
    }
  }, [store]);

  if (loading || !session) return <div />;

  return (
    <Layout>
      <StoreStyles>
        {isLoading && (
          <>
            <div className="title">
              <div className="details">
                <h2>Store</h2>
              </div>
            </div>
            <div className="main-content">
              <div className="wrapper">
                <div>Loading store...</div>
              </div>
            </div>
          </>
        )}
        {isError && error instanceof Error && (
          <>
            <div className="title">
              <div className="details">
                <h2>Store Error!</h2>
              </div>
            </div>
            <div className="main-content">
              <div className="wrapper">
                <div>Error: {error.message}</div>
              </div>
            </div>
          </>
        )}
        {store && (
          <>
            <div className="title">
              <div className="details">
                <h2>{store.name}</h2>
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
              <div className="action-buttons">
                <Link href={`/stores/update?id=${store._id}`}>
                  <a className="edit-store-link">
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
                    Edit Store
                  </a>
                </Link>
              </div>
            </div>
            <div className="main-content">
              <div className="wrapper">
                <h3>Store Details</h3>
                <div className="contact-info">
                  <div className="item">
                    <div className="label">Store Id</div>
                    <div className="data">{store._id}</div>
                  </div>
                  {store.category === 'client' ? (
                    <>
                      <div className="item">
                        <div className="label">Name</div>
                        <div className="data">
                          {store.contact.firstName} {store.contact.lastName}
                        </div>
                      </div>
                      <div className="item">
                        <div className="label">Email</div>
                        <div className="data">{store.contact.email}</div>
                      </div>
                      <div className="item">
                        <div className="label">Phone</div>
                        <div className="data">
                          {formatPhoneNumber(store.contact.phone)}
                        </div>
                      </div>
                    </>
                  ) : store.category === 'macaport' ? (
                    <div className="item">
                      <div className="label">Category</div>
                      <div className="data">Macaport Store</div>
                    </div>
                  ) : null}
                </div>
                <div className="grid-cols-2 section">
                  <div>
                    <h4>Store Dates</h4>
                    <div className="info-item">
                      <div className="label">Status</div>
                      <div className="data">
                        {storeStatus === 'upcoming'
                          ? 'Upcoming'
                          : storeStatus === 'open'
                          ? 'Open'
                          : 'Closed'}
                      </div>
                    </div>
                    <div className="info-item">
                      <div className="label">Open Date</div>
                      <div className="data">
                        {format(
                          new Date(store.openDate),
                          'LLL dd, yyyy, h:mm a'
                        )}
                      </div>
                    </div>
                    <div className="info-item">
                      <div className="label">Close Date</div>
                      <div className="data">
                        {store.closeDate
                          ? format(
                              new Date(store.closeDate),
                              'LLL dd, yyyy, h:mm a'
                            )
                          : 'Open Permanently'}
                      </div>
                    </div>
                  </div>
                  <div>
                    <h4>Shipping Details</h4>
                    <div className="info-item">
                      <div className="label">Primary Shipping Address</div>
                      <div className="data">
                        {store.hasPrimaryShippingLocation ? (
                          <>
                            {store.primaryShippingLocation.name} <br />
                            {store.primaryShippingLocation.street} <br />
                            {store.primaryShippingLocation.street2 ? (
                              <>
                                {store.primaryShippingLocation.street2} <br />
                              </>
                            ) : null}
                            {store.primaryShippingLocation.city},{' '}
                            {store.primaryShippingLocation.state}{' '}
                            {store.primaryShippingLocation.zipcode}
                          </>
                        ) : (
                          'None'
                        )}
                      </div>
                    </div>
                    <div className="info-item">
                      <div className="label">Allows Direct Shipping</div>
                      <div className="data">
                        {store.allowDirectShipping ? 'Yes' : 'No'}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="products section" id="products">
                  <div className="row">
                    <h4>Store Products</h4>
                    <Link href={`/stores/${router.query.id}/product/add`}>
                      <a className="add-product-link">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z"
                            clipRule="evenodd"
                          />
                        </svg>
                        Add a product
                      </a>
                    </Link>
                  </div>
                  <div>
                    {store.products ? (
                      <>
                        {store.products.length < 1 ? (
                          <div className="empty empty-products">
                            This store has no products.
                          </div>
                        ) : (
                          <>
                            {store.products.map(p => (
                              <div key={p.id} className="product">
                                <Link
                                  href={`/stores/${router.query.id}/product?prodId=${p.id}`}
                                  key={p.id}
                                >
                                  <a className="product-name">{p.name}</a>
                                </Link>
                                <button
                                  type="button"
                                  className="menu-button"
                                  onClick={() => handleProductMenuClick(p.id)}
                                >
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 20 20"
                                    fill="currentColor"
                                  >
                                    <path d="M6 10a2 2 0 11-4 0 2 2 0 014 0zM12 10a2 2 0 11-4 0 2 2 0 014 0zM16 12a2 2 0 100-4 2 2 0 000 4z" />
                                  </svg>
                                </button>
                                <StoreProductMenu
                                  storeId={store._id}
                                  productId={p.id}
                                  showMenu={showMenu}
                                  setShowMenu={setShowMenu}
                                  handleDeleteButtonClick={
                                    handleDeleteProductMenuClick
                                  }
                                />
                              </div>
                            ))}
                          </>
                        )}
                      </>
                    ) : (
                      <div className=" empty-products">
                        This store has no products.
                      </div>
                    )}
                  </div>
                </div>
                <div className="section orders">
                  <h4>Store Orders</h4>
                  {store.orders ? (
                    <OrdersTable orders={store.orders} />
                  ) : (
                    <div className=" empty-products">
                      This store has no orders.
                    </div>
                  )}
                </div>
                <Notes
                  label="Store"
                  notes={store.notes}
                  addNote={addNoteMutation.mutate}
                  updateNote={updateNoteMutation.mutate}
                  deleteNote={deleteNoteMutation.mutate}
                />
              </div>
            </div>
          </>
        )}
      </StoreStyles>
      {showDeleteProductModal && (
        <DeleteProductModalStyles>
          <div className="modal">
            <div>
              <h3>Delete Product</h3>
              <p>
                Are you sure you want to delete this product? This can&apos;t be
                undone.
              </p>
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
                onClick={() => deleteProductMutation.mutate(productIdToDelete)}
              >
                Delete Product
              </button>
            </div>
          </div>
        </DeleteProductModalStyles>
      )}
    </Layout>
  );
}

const DeleteProductModalStyles = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: rgba(0, 0, 0, 0.5);

  .modal {
    margin: -12rem 0 0;
    padding: 1.375rem 1.75rem;
    max-width: 24rem;
    background-color: #fff;
    border-radius: 0.375rem;

    h3 {
      margin: 0 0 0.75rem;
      font-size: 1.125rem;
      font-weight: 600;
      color: #111827;
    }

    p {
      margin: 0;
      font-size: 0.9375rem;
      color: #374151;
      line-height: 1.5;
    }

    .buttons {
      margin: 1.25rem 0 0;
      display: flex;
      justify-content: flex-end;
      gap: 0.5rem;
    }

    .primary-button,
    .secondary-button {
      padding: 0.25rem 0.625rem;
      border-radius: 0.25rem;
      font-size: 0.875rem;
      font-weight: 500;
      cursor: pointer;
    }

    .primary-button {
      background-color: #b91c1c;
      border: 1px solid transparent;
      color: #fff1f2;
      box-shadow: rgba(0, 0, 0, 0) 0px 0px 0px 0px,
        rgba(0, 0, 0, 0) 0px 0px 0px 0px, rgba(0, 0, 0, 0.2) 0px 1px 2px 0px;

      &:hover {
        color: #fff;
        background-color: #a81919;
      }
    }

    .secondary-button {
      background-color: #fff;
      border: 1px solid #d1d5db;
      color: #374151;
      box-shadow: rgba(0, 0, 0, 0) 0px 0px 0px 0px,
        rgba(0, 0, 0, 0) 0px 0px 0px 0px, rgba(0, 0, 0, 0.05) 0px 1px 2px 0px;

      &:hover {
        color: #111827;
        background-color: #f9fafb;
      }
    }
  }
`;

const StoreStyles = styled.div`
  h2 {
    margin: 0;
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

  .title {
    padding: 1.625rem 2.5rem;
    min-height: 5.875rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 1px solid #e5e7eb;
  }

  .details {
    display: flex;
    align-items: center;
    gap: 1.25rem;
  }

  .store-status {
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
        margin: 0 0.5rem 0 0;
        height: 0.625rem;
        width: 0.625rem;
        border-radius: 9999px;
        background-color: #374151;
      }

      &.closed {
        background-color: #fef2f2;
        border-color: #fee2e2;
        color: #991b1b;

        .dot {
          background-color: #ef4444;
          border: 2px solid #fecaca;
        }
      }

      &.open {
        background-color: #ecfdf5;
        border-color: #d1fae5;
        color: #065f46;

        .dot {
          background-color: #10b981;
          border: 2px solid #a7f3d0;
        }
      }

      &.upcoming {
        background-color: #fffbeb;
        border-color: #fef3c7;
        color: #92400e;

        .dot {
          background-color: #f59e0b;
          border: 2px solid #fde68a;
        }
      }
    }
  }

  .action-buttons {
    display: flex;
    gap: 1rem;

    a {
      padding: 0.625rem 1.25rem;
      display: flex;
      justify-content: center;
      align-items: center;
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
    }

    svg {
      margin: 0 0.375rem 0 0;
      height: 1.125rem;
      width: 1.125rem;
      color: #9ca3af;
    }
  }

  .main-content {
    padding: 3.5rem 3rem;
    position: relative;
  }

  .wrapper {
    width: 100%;
  }

  .section {
    padding: 3.5rem 0;

    &.products {
      padding-bottom: 0;
    }
  }

  .error {
    font-size: 1.125rem;
    font-weight: 500;
    color: #1f2937;
  }

  .contact-info {
    padding: 2rem 0;
    display: flex;
    border-bottom: 1px solid #e5e7eb;

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
    line-height: 1.5;
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

  /* NOTE/PRODUCT STYLES */

  .add-product-link {
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

    svg {
      margin: 0 0.375rem 0 0;
      height: 1.125rem;
      width: 1.125rem;
      color: #9ca3af;
    }
  }

  .menu-button {
    margin-left: auto;
    padding: 0.125rem;
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
    padding: 0.125rem 0.5rem;
    position: absolute;
    right: 0;
    top: 3rem;
    display: none;
    flex-direction: column;
    align-items: flex-start;
    background-color: #fff;
    border: 1px solid #e5e7eb;
    border-radius: 0.25rem;
    box-shadow: rgba(0, 0, 0, 0) 0px 0px 0px 0px,
      rgba(0, 0, 0, 0) 0px 0px 0px 0px, rgba(0, 0, 0, 0.1) 0px 10px 15px -3px,
      rgba(0, 0, 0, 0.02) 0px 4px 6px -2px;

    &.show {
      display: flex;
      z-index: 100;
    }
  }

  .menu-link,
  .edit-button,
  .delete-button {
    padding: 0.75rem 2rem 0.75rem 0.25rem;
    width: 100%;
    display: flex;
    align-items: center;
    gap: 0.375rem;
    background-color: transparent;
    border: none;
    font-size: 0.875rem;
    font-weight: 500;
    color: #6b7280;
    text-align: left;
    cursor: pointer;

    &:hover {
      color: #111827;

      svg {
        color: #9ca3af;
      }
    }

    svg {
      height: 0.9375rem;
      width: 0.9375rem;
      color: #d1d5db;
    }
  }

  .edit-button,
  .menu-link {
    border-bottom: 1px solid #e5e7eb;
  }

  .delete-button:hover {
    color: #b91c1c;

    svg {
      color: #e3bebe;
    }
  }

  /* PRODUCT STYLES */
  .empty-products {
    padding-bottom: 3rem;
  }

  .product {
    position: relative;
    display: grid;
    grid-template-columns: 1fr 3rem;
    align-items: center;
    border-top: 1px solid #e5e7eb;

    &:hover {
      background-color: #f9fafb;
    }
  }

  .row {
    margin: 0 0 1.5rem;
    display: flex;
    justify-content: space-between;
    align-items: center;

    h4 {
      margin: 0;
    }
  }

  .product-name {
    padding: 1rem 0.5rem;
    font-size: 0.9375rem;
    font-weight: 500;
    color: #374151;
  }

  .menu-button {
    padding: 1rem 0.5rem;
  }

  /* ORDERS STYLES */
  .orders {
    border-top: 1px solid #e5e7eb;
  }
`;
