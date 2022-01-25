import React from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import styled from 'styled-components';
import useActiveNavTab from '../../../../hooks/useActiveNavTab';
import useOutsideClick from '../../../../hooks/useOutsideClick';
import useEscapeKeydownClose from '../../../../hooks/useEscapeKeydownClose';
import { useSession } from '../../../../hooks/useSession';
import { StoreProduct } from '../../../../interfaces';
import { getQueryParameter } from '../../../../utils';
import Layout from '../../../../components/Layout';
import Sizes from '../../../../components/Product/Sizes';
import Colors from '../../../../components/Product/Colors';
import StoreProductSkusTable from '../../../../components/StoreProductSkusTable';
import LoadingSpinner from '../../../../components/LoadingSpinner';
import Notification from '../../../../components/Notification';

const navValues = ['details', 'skus', 'sizes', 'colors'];
type NavValue = typeof navValues[number];

export default function Product() {
  const [enableProductQuery, setEnableProductQuery] = React.useState(true);
  const [session, loading] = useSession({ required: true });
  const router = useRouter();
  const queryClient = useQueryClient();
  const { activeNav, setActiveNav } = useActiveNavTab(
    navValues,
    `/stores/${router.query.id}/product?pid=${router.query.pid}&`
  );
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
  } = useQuery(
    ['stores', 'store', 'product', router.query.pid],
    async () => {
      if (!router.query.id || !router.query.pid) return;
      // const response = await fetch(`/api/stores/${router.query.id}`);
      const response = await fetch(
        `/api/store-products/${router.query.id}?pid=${router.query.pid}`
      );

      if (!response.ok) throw new Error('Failed to fetch the store product.');

      const data: { storeProduct: StoreProduct } = await response.json();
      // const product = store.products.find(p => p.id === router.query.pid);

      // if (!product) throw new Error('No product found.');

      return data.storeProduct;
    },
    {
      // initialData: () => {
      //   // TODO: update store query to hydrate storeProducts with inventory etc.
      //   if (!router.query.id) return;
      //   const stores = queryClient.getQueryData<Store[]>(['stores']);
      //   const store = stores?.find((s: Store) => s._id === router.query.id);
      //   const product = store?.products.find(p => p.id === router.query.pid);
      //   if (store && product) {
      //     return { product, products: store.products, store };
      //   }
      // },
      // initialDataUpdatedAt: () =>
      //   queryClient.getQueryState('stores')?.dataUpdatedAt,
      staleTime: 1000 * 60 * 10,
      enabled: enableProductQuery,
    }
  );

  const deleteProductMutation = useMutation(
    async (id: string | undefined) => {
      if (!id) {
        setShowDeleteProductModal(false);
        throw new Error('No store product id provided.');
      }
      setEnableProductQuery(false);
      const response = await fetch(`/api/store-products/delete`, {
        method: 'post',
        body: JSON.stringify({ storeId: router.query.id, storeProductId: id }),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        setEnableProductQuery(true);
        throw new Error('Failed to delete the product.');
      }

      const data = await response.json();
      return data.store;
    },
    {
      // onMutate: async id => {
      //   await queryClient.cancelQueries(['stores', 'store', router.query.id]);
      //   const updatedProducts = data?.products.filter(p => p.id !== id);
      //   const updatedStore = { ...data?.store, products: updatedProducts };
      //   queryClient.setQueryData(
      //     ['stores', 'store', router.query.id],
      //     updatedStore
      //   );
      // },
      // onError: () => {
      //   // TODO: trigger a notafication
      //   queryClient.setQueryData(
      //     ['stores', 'store', router.query.id],
      //     data?.store
      //   );
      // },
      onSettled: () => {
        queryClient.invalidateQueries('stores');
      },
      onSuccess: () => {
        router.push(
          `/stores/${router.query.id}?active=products&deleteProduct=true`
        );
      },
    }
  );

  const handleNavClick = (value: NavValue) => {
    setActiveNav(value);
    router.push(
      `/stores/${router.query.id}/product?pid=${router.query.pid}&active=${value}`,
      undefined,
      {
        shallow: true,
      }
    );
  };

  const handleDeleteProductMenuClick = () => {
    setShowProductMenu(false);
    setShowDeleteProductModal(true);
  };

  const handleDeleteProductClick = () => {
    deleteProductMutation.mutate(getQueryParameter(router.query.pid));
  };

  if (loading || !session) return <div />;

  return (
    <Layout title="Product | Macaport Dashboard">
      <ProductStyles>
        <div className="container">
          {isLoading && <LoadingSpinner isLoading={isLoading} />}
          {isError && error instanceof Error && <div>Error: {error}</div>}
          {storeProduct && (
            <>
              <Link href={`/stores/${router.query.id}?active=products`}>
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
                      Edit Product
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
                    Delete Product
                  </button>
                </div>
              </div>
              <div className="product-header">
                <h2>{storeProduct.name}</h2>
                <p className="prod-id">{storeProduct.id}</p>
              </div>

              <div className="product-nav">
                <button
                  type="button"
                  onClick={() => handleNavClick('details')}
                  className={activeNav === 'details' ? 'active' : ''}
                >
                  <span>Details</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleNavClick('skus')}
                  className={activeNav === 'skus' ? 'active' : ''}
                >
                  <span>Skus</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleNavClick('sizes')}
                  className={activeNav === 'sizes' ? 'active' : ''}
                >
                  <span>Sizes</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleNavClick('colors')}
                  className={activeNav === 'colors' ? 'active' : ''}
                >
                  <span>Colors</span>
                </button>
              </div>

              <div className="body">
                <FetchingSpinner isLoading={isFetching} />

                {activeNav === 'details' && (
                  <>
                    {storeProduct.description && (
                      <div className="detail-item">
                        <h4>Product Description</h4>
                        <p>{storeProduct.description}</p>
                      </div>
                    )}
                    <div className="row">
                      {storeProduct.tag && (
                        <div className="detail-item">
                          <h4>Tag</h4>
                          <p className="prod-tag">{storeProduct.tag}</p>
                        </div>
                      )}
                      <div className="detail-item">
                        <h4>Custom names</h4>
                        <p>{storeProduct.includeCustomName ? 'Yes' : 'No'}</p>
                      </div>
                      <div className="detail-item">
                        <h4>Custom numbers</h4>
                        <p>{storeProduct.includeCustomNumber ? 'Yes' : 'No'}</p>
                      </div>
                    </div>
                    {storeProduct.details && storeProduct.details.length > 0 && (
                      <div className="detail-item">
                        <h4>Details</h4>
                        <ul>
                          {storeProduct.details.map((d, i) => (
                            <li key={i}>{d}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </>
                )}

                {activeNav === 'skus' && (
                  <StoreProductSkusTable
                    storeId={getQueryParameter(router.query.id)}
                    storeProduct={storeProduct}
                    productSkus={storeProduct.productSkus}
                    inventoryProductId={storeProduct.inventoryProductId}
                  />
                )}

                {activeNav === 'sizes' && (
                  <>
                    <h3>Product Sizes</h3>
                    {router.query.id ? (
                      <Sizes
                        sizes={storeProduct.sizes}
                        storeId={
                          Array.isArray(router.query.id)
                            ? router.query.id[0]
                            : router.query.id
                        }
                        product={storeProduct}
                      />
                    ) : (
                      <div>A store ID is required.</div>
                    )}
                  </>
                )}

                {activeNav === 'colors' && (
                  <>
                    <h3>Product Colors</h3>
                    {router.query.id ? (
                      <Colors
                        storeId={
                          Array.isArray(router.query.id)
                            ? router.query.id[0]
                            : router.query.id
                        }
                        product={storeProduct}
                      />
                    ) : (
                      <div>A store ID is required.</div>
                    )}
                  </>
                )}
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
              <h3>Delete store</h3>
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
                Delete the store
              </button>
            </div>
            <DeleteMutationSpinner
              isLoading={deleteProductMutation.isLoading}
            />
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
    margin: 0 auto;
    padding: 3rem 0 0;
    max-width: 75rem;
    width: 100%;
  }

  .product-menu-container {
    position: absolute;
    top: 2rem;
    right: 2rem;
    display: flex;
    justify-content: flex-end;
    width: 25%;

    .menu {
      top: 2.25rem;
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
    padding: 3rem 0 2.25rem;

    p {
      margin: 0.25rem 0 0;
      font-family: 'Dank Mono', 'Menlo', monospace;
      font-size: 1.125rem;
      color: #6b7280;
    }
  }

  .product-nav {
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
        background-color: #1c5eb9;
        color: #fff;

        &:focus {
          outline: 2px solid transparent;
          outline-offset: 2px;
        }

        &:focus-visible {
          box-shadow: rgb(255, 255, 255) 0px 0px 0px 2px,
            #1c5eb9 0px 0px 0px 4px, rgba(0, 0, 0, 0) 0px 0px 0px 0px;
        }
      }
    }
  }

  .body {
    position: relative;
    padding: 3.5rem 0;
  }

  .row {
    display: flex;
    gap: 8rem;
  }

  .detail-item {
    margin: 0 0 3.5rem;
  }

  ul {
    padding-left: 1.125rem;
  }

  li {
    margin: 0.5rem 0 0;
    color: #4b5563;
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
      box-shadow: rgb(255, 255, 255) 0px 0px 0px 2px, #1c5eb9 0px 0px 0px 4px,
        rgba(0, 0, 0, 0) 0px 0px 0px 0px;
    }
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
