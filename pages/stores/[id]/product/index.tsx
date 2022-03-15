import React from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import styled from 'styled-components';
import { getQueryParameter } from '../../../../utils';
import { useSession } from '../../../../hooks/useSession';
import { useStoreProductQuery } from '../../../../hooks/useStoreProductQuery';
import { useStoreProductMutations } from '../../../../hooks/useStoreProductMutations';
import useOutsideClick from '../../../../hooks/useOutsideClick';
import useEscapeKeydownClose from '../../../../hooks/useEscapeKeydownClose';
import Layout from '../../../../components/Layout';
import Colors from '../../../../components/Product/Colors';
import StoreProductSkusTable from '../../../../components/StoreProductSkusTable';
import Notes from '../../../../components/Notes';
import LoadingSpinner from '../../../../components/LoadingSpinner';
import Notification from '../../../../components/Notification';

export default function Product() {
  const [session, loading] = useSession({ required: true });
  const router = useRouter();
  const productMenuRef = React.useRef<HTMLDivElement>(null);
  const deleteProductModalRef = React.useRef<HTMLDivElement>(null);
  const [showProductMenu, setShowProductMenu] = React.useState<boolean>(false);
  const [showDeleteProductModal, setShowDeleteProductModal] =
    React.useState(false);
  useOutsideClick(showProductMenu, setShowProductMenu, productMenuRef);
  useOutsideClick(
    showDeleteProductModal,
    setShowDeleteProductModal,
    deleteProductModalRef
  );
  useEscapeKeydownClose(showProductMenu, setShowProductMenu);
  useEscapeKeydownClose(showDeleteProductModal, setShowDeleteProductModal);
  const {
    isLoading,
    isFetching,
    isError,
    error,
    data: storeProduct,
  } = useStoreProductQuery();
  const { deleteProduct, addNote, updateNote, deleteNote } =
    useStoreProductMutations({ storeProduct });

  const handleDeleteProductMenuClick = () => {
    setShowProductMenu(false);
    setShowDeleteProductModal(true);
  };

  const handleDeleteProductClick = () => {
    deleteProduct.mutate(getQueryParameter(router.query.pid));
  };

  if (loading || !session) return <div />;

  return (
    <Layout title="Store Product | Macaport Dashboard">
      <ProductStyles>
        <div className="container">
          {isLoading && <LoadingSpinner isLoading={isLoading} />}
          {isError && error instanceof Error && <div>Error: {error}</div>}
          {storeProduct && (
            <>
              <div className="actions-row">
                <Link href={`/stores/${router.query.id}`}>
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
                <div className="product-menu-container">
                  <button
                    type="button"
                    onClick={() => setShowProductMenu(!showProductMenu)}
                    className="product-menu-button"
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
                    ref={productMenuRef}
                    className={`menu${showProductMenu ? ' show' : ''}`}
                  >
                    <Link
                      href={`/stores/${router.query.id}/product/update?pid=${router.query.pid}`}
                    >
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
                        Edit store product
                      </a>
                    </Link>
                    <button
                      type="button"
                      onClick={handleDeleteProductMenuClick}
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
                      Delete store product
                    </button>
                  </div>
                </div>
              </div>

              <div className="product-header">
                <h2>{storeProduct.name}</h2>
                <p>{storeProduct.id}</p>
              </div>

              <div className="main-content">
                <FetchingSpinner isLoading={isFetching} />

                <div>
                  <h3 className="section-title">Store product details</h3>
                  <div className="details-grid">
                    <div>
                      <div className="detail-item">
                        <div className="label">Merchandise code</div>
                        <div className="value">
                          {storeProduct.merchandiseCode}
                        </div>
                      </div>

                      {storeProduct.description && (
                        <div className="detail-item">
                          <div className="label">Product description</div>
                          <div className="value">
                            {storeProduct.description}
                          </div>
                        </div>
                      )}

                      {storeProduct.tag && (
                        <div className="detail-item">
                          <div className="label">Tag</div>
                          <div className="value">{storeProduct.tag}</div>
                        </div>
                      )}

                      {storeProduct.details && storeProduct.details.length > 0 && (
                        <div className="detail-item">
                          <div className="label">Details</div>
                          <div className="value">
                            <ul>
                              {storeProduct.details.map((d, i) => (
                                <li key={i}>{d}</li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      )}
                    </div>
                    <div>
                      <div className="detail-item">
                        <div className="label">Custom names</div>
                        <div className="value">
                          {storeProduct.includeCustomName ? 'Yes' : 'No'}
                        </div>
                      </div>

                      <div className="detail-item">
                        <div className="label">Custom numbers</div>
                        <div className="value">
                          {storeProduct.includeCustomNumber ? 'Yes' : 'No'}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <StoreProductSkusTable
                  storeId={getQueryParameter(router.query.id)}
                  storeProduct={storeProduct}
                  productSkus={storeProduct.productSkus}
                  inventoryProductId={storeProduct.inventoryProductId}
                />

                <div className="product-colors-section">
                  <h3>Product colors</h3>
                  {router.query.id ? (
                    <Colors product={storeProduct} />
                  ) : (
                    <div>A store ID is required.</div>
                  )}
                </div>

                <Notes
                  label="Store product"
                  notes={storeProduct.notes}
                  addNote={addNote}
                  updateNote={updateNote}
                  deleteNote={deleteNote}
                />
              </div>
            </>
          )}
        </div>
      </ProductStyles>

      <Notification
        query="updateProduct"
        heading="Product successfully updated"
        callbackUrl={`/stores/${router.query.id}/product?pid=${router.query.pid}`}
      />

      {showDeleteProductModal && (
        <DeleteModalStyles>
          <div ref={deleteProductModalRef} className="modal">
            <div>
              <h3>Delete product</h3>
              <p>Are you sure you want to delete {storeProduct?.name}?</p>
            </div>

            <div className="buttons">
              <button
                type="button"
                className="secondary-button"
                onClick={() => setShowDeleteProductModal(false)}
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

            <DeleteMutationSpinner isLoading={deleteProduct.isLoading} />
          </div>
        </DeleteModalStyles>
      )}
    </Layout>
  );
}

const ProductStyles = styled.div`
  position: relative;

  h2 {
    margin: 0;
    font-size: 1.5rem;
    font-weight: 600;
    color: #111827;
  }

  h3 {
    margin: 0 0 1.25rem;
    font-size: 1.125rem;
    font-weight: 600;
    color: #111827;
  }

  h4 {
    margin: 0 0 1rem;
    font-size: 1.125rem;
    font-weight: 600;
    color: #111827;
  }

  p {
    margin: 0;
    color: #4b5563;
    line-height: 1.65;
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

  .product-menu-container {
    display: flex;
    justify-content: flex-end;
    width: 25%;

    .menu {
      top: 5.25rem;
      right: 0;
    }
  }

  .product-menu-button {
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
    padding: 0.75rem 2rem 0.75rem 0;
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
      color: #111827;

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

  .product-header {
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

  .main-content {
    position: relative;
    padding: 3.5rem 0;
  }

  .section-title {
    margin: 0 0 0.875rem;
    padding: 0 0 0.75rem;
    border-bottom: 1px solid #dcdfe4;
  }

  .details-grid {
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

    ul {
      margin: 0;
      padding: 0;
      list-style: none;
    }

    li {
      margin: 0 0 0.25rem;
    }
  }

  .edit-product-link {
    position: absolute;
    top: 1.75rem;
    right: 1.75rem;
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
      box-shadow: rgb(255, 255, 255) 0px 0px 0px 2px, #1c44b9 0px 0px 0px 4px,
        rgba(0, 0, 0, 0) 0px 0px 0px 0px;
    }
  }

  .product-colors-section {
    margin: 4rem 0 0;
  }
`;

const DeleteModalStyles = styled.div`
  padding: 10rem 0 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  position: absolute;
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
