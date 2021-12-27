import React from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { useQuery, useQueryClient } from 'react-query';
import styled from 'styled-components';
import useActiveNavTab from '../../../../hooks/useActiveNavTab';
import { useSession } from '../../../../hooks/useSession';
import { Store } from '../../../../interfaces';
import Layout from '../../../../components/Layout';
import Sizes from '../../../../components/Product/Sizes';
import Colors from '../../../../components/Product/Colors';
import LoadingSpinner from '../../../../components/LoadingSpinner';

const navValues = ['details', 'sizes', 'colors'];
type NavValue = typeof navValues[number];

export default function Product() {
  const [session, loading] = useSession({ required: true });
  const router = useRouter();
  const { activeNav, setActiveNav } = useActiveNavTab(
    navValues,
    `/stores/${router.query.id}/product?pid=${router.query.pid}&`
  );
  const queryClient = useQueryClient();

  const {
    isLoading,
    isFetching,
    isError,
    error,
    data: product,
  } = useQuery(
    ['stores', 'store', 'product', router.query.pid],
    async () => {
      if (!router.query.id || !router.query.pid) return;
      const response = await fetch(`/api/stores/${router.query.id}`);

      if (!response.ok) throw new Error('Failed to fetch the store.');

      const { store }: { store: Store } = await response.json();
      const product = store.products.find(p => p.id === router.query.pid);

      if (!product) throw new Error('No product found.');

      return product;
    },
    {
      initialData: () => {
        if (!router.query.id) return;
        const stores = queryClient.getQueryData<Store[]>(['stores']);
        const store = stores?.find((s: Store) => s._id === router.query.id);
        return store?.products.find(p => p.id === router.query.pid);
      },
      initialDataUpdatedAt: () =>
        queryClient.getQueryState('stores')?.dataUpdatedAt,
      staleTime: 1000 * 60 * 10,
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

  if (loading || !session) return <div />;

  return (
    <Layout title="Product | Macaport Dashboard">
      <ProductStyles>
        <div className="container">
          {isLoading && <LoadingSpinner isLoading={isLoading} />}
          {isError && error instanceof Error && <div>Error: {error}</div>}
          {product && (
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
              <Link
                href={`/stores/${router.query.id}/product/update?pid=${router.query.pid}`}
              >
                <a className="edit-product-link">Edit Product</a>
              </Link>
              <div className="product-header">
                <h2>{product.name}</h2>
                <p className="prod-id">{product.id}</p>
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
                    {product.description && (
                      <div className="detail-item">
                        <h4>Product Description</h4>
                        <p>{product.description}</p>
                      </div>
                    )}
                    <div className="row">
                      {product.tag && (
                        <div className="detail-item">
                          <h4>Tag</h4>
                          <p className="prod-tag">{product.tag}</p>
                        </div>
                      )}
                      <div className="detail-item">
                        <h4>Custom names</h4>
                        <p>{product.includeCustomName ? 'Yes' : 'No'}</p>
                      </div>
                      <div className="detail-item">
                        <h4>Custom numbers</h4>
                        <p>{product.includeCustomNumber ? 'Yes' : 'No'}</p>
                      </div>
                    </div>
                    {product.details && product.details.length > 0 && (
                      <div className="detail-item">
                        <h4>Details</h4>
                        <ul>
                          {product.details.map((d, i) => (
                            <li key={i}>{d}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </>
                )}

                {activeNav === 'sizes' && (
                  <>
                    <h3>Product Sizes</h3>
                    {router.query.id ? (
                      <Sizes
                        sizes={product.sizes}
                        storeId={
                          Array.isArray(router.query.id)
                            ? router.query.id[0]
                            : router.query.id
                        }
                        product={product}
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
                        product={product}
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
    max-width: 70rem;
    width: 100%;
  }

  .product-header {
    padding: 3rem 0 2.25rem;

    p {
      margin: 0.25rem 0 0;
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
        background-color: #2c33bb;
        color: #fff;
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
      color: #2c33bb;

      svg {
        color: #2c33bb;
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
      box-shadow: rgb(255, 255, 255) 0px 0px 0px 2px,
        rgb(99, 102, 241) 0px 0px 0px 4px, rgba(0, 0, 0, 0) 0px 0px 0px 0px;
    }
  }
`;

const FetchingSpinner = styled(LoadingSpinner)`
  position: absolute;
  top: 2rem;
  right: 0;
`;
