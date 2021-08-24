import { useRouter } from 'next/router';
import Link from 'next/link';
import { useQuery, useQueryClient } from 'react-query';
import styled from 'styled-components';
import { useSession } from '../../../../hooks/useSession';
import { Store } from '../../../../interfaces';
import Layout from '../../../../components/Layout';
import Sizes from '../../../../components/Product/Sizes';
import Colors from '../../../../components/Product/Colors';

export default function Product() {
  const [session, loading] = useSession({ required: true });
  const router = useRouter();
  const queryClient = useQueryClient();

  const {
    isLoading,
    isError,
    error,
    data: product,
  } = useQuery(
    ['product', router.query.prodId],
    async () => {
      if (!router.query.id || !router.query.prodId) return;
      const response = await fetch(`/api/stores/${router.query.id}`);

      if (!response.ok) throw new Error('Failed to fetch the store.');

      const { store }: { store: Store } = await response.json();
      const product = store.products.find(p => p.id === router.query.prodId);

      if (!product) throw new Error('No product found.');

      return product;
    },
    {
      initialData: () => {
        if (!router.query.id) return;
        const stores = queryClient.getQueryData<Store[]>(['stores']);
        const store = stores?.find((s: Store) => s._id === router.query.id);
        return store?.products.find(p => p.id === router.query.prodId);
      },
      initialDataUpdatedAt: () =>
        queryClient.getQueryState('stores')?.dataUpdatedAt,
      staleTime: 600000,
    }
  );

  if (loading || !session) return <div />;

  return (
    <Layout title="Product | Macaport Dashboard">
      <ProductStyles>
        {isLoading && (
          <>
            <div className="title">
              <h2>Product</h2>
            </div>
            <div className="main-content">
              <div>Loading Product...</div>
            </div>
          </>
        )}
        {isError && error instanceof Error && (
          <>
            <div className="title">
              <h2>Product Error!</h2>
            </div>
            <div className="main-content">
              <div>Error: {error.message}</div>
            </div>
          </>
        )}
        {product && (
          <>
            <div className="title">
              <div className="details">
                <h2>Product</h2>
              </div>
              <div className="action-buttons">
                <Link
                  href={`/stores/${router.query.id}/product/update?prodId=${router.query.prodId}`}
                >
                  <a className="edit-product-link">
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
                    Edit Product
                  </a>
                </Link>
              </div>
            </div>
            <div className="main-content">
              <div className="wrapper">
                <h3>{product.name}</h3>
                <div className="prod-id">{product.id}</div>
                {product.description && (
                  <div className="section">
                    <h4>Description</h4>
                    <div className="prod-description">
                      {product.description}
                    </div>
                  </div>
                )}
                {product.tag && (
                  <div className="section">
                    <h4>Tag</h4>
                    <div className="prod-tag">{product.tag}</div>
                  </div>
                )}
                {product.details && product.details.length > 0 && (
                  <div className="section">
                    <h4>Details</h4>
                    <ul className="prod-details">
                      {product.details.map((d, i) => (
                        <li key={i} className="prod-detail">
                          {d}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                <div className="section">
                  <h4>Sizes</h4>
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
                </div>
                <div className="section">
                  <h4>Colors</h4>
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
                </div>
              </div>
            </div>
          </>
        )}
      </ProductStyles>
    </Layout>
  );
}

const ProductStyles = styled.div`
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
    margin: 4em 0 0;
  }

  .prod-id {
    margin: 0.375rem 0 0;
    color: #6b7280;
  }

  .prod-description,
  .prod-tag,
  .prod-detail {
    color: #4b5563;
  }

  .prod-details {
    padding-left: 1.125rem;
  }

  .prod-detail {
    margin: 0.5rem 0 0;
    color: #4b5563;
  }
`;
