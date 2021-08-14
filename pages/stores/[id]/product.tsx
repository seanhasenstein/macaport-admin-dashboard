import { useRouter } from 'next/router';
import Link from 'next/link';
import { useQuery, useQueryClient } from 'react-query';
import { useSession } from '../../../hooks/useSession';
import { Store } from '../../../interfaces';
import styled from 'styled-components';
import Layout from '../../../components/Layout';

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
    <Layout>
      {isLoading && <div>Loading...</div>}
      {isError && error instanceof Error && <div>Error: {error.message}</div>}
      {product && (
        <ProductStyles>
          <div className="title">
            <div className="details">
              <h2>Product - {product.name}</h2>
            </div>
            <div className="action-buttons">
              <Link href={`TODO`}>
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
              <h3>Product Details</h3>
              <p>TODO: This page needs to be finished...</p>
              <pre>{JSON.stringify(product, null, 2)}</pre>
            </div>
          </div>
        </ProductStyles>
      )}
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
`;
