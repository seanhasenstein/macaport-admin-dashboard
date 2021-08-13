import { useRouter } from 'next/router';
import Link from 'next/link';
import { useQuery } from 'react-query';
import styled from 'styled-components';
import { useSession } from '../../../hooks/useSession';
import Layout from '../../../components/Layout';
import { Sku } from '../../../interfaces';

export default function Product() {
  const [session, sessionLoading] = useSession({ required: true });
  const router = useRouter();

  const {
    isLoading,
    isError,
    data: product,
    error,
  } = useQuery(['product', router.query.id], async () => {
    if (!router.query.id) return;

    const response = await fetch(`/api/stores/products/${router.query.id}`);

    if (!response.ok) {
      throw new Error('Failed to get the product');
    }

    const data = await response.json();
    return data.product;
  });

  if (sessionLoading || !session) return <div />;
  if (isLoading) return <div>Loading...</div>;
  if (isError) return <div>Error: {error}</div>;

  return (
    <Layout>
      <ProductStyles>
        {product && (
          <>
            <div className="title">
              <div className="details">
                <h2>{product.name}</h2>
                {/* <div className="product-status">
                  <span className={productStatus}>
                    <div className="dot" />
                    {productStatus === 'default'
                      ? ''
                      : 'Archived'}
                  </span>
                </div> */}
              </div>
              <div className="action-buttons">
                <Link href={`#`}>
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
                    Edit Product
                  </a>
                </Link>
              </div>
            </div>
            <div className="main-content">
              <div className="wrapper">
                <h3>Product - {router.query.id}.</h3>
                {/* <pre>{JSON.stringify(product, null, 2)}</pre> */}
                <div>
                  <div>....product.id: {product.id}</div>
                  {product.skus.map((s: Sku) => (
                    <div key={s.id}>
                      <div>sku.productId{s.productId}</div>
                    </div>
                  ))}
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

  /* .store-status {
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
  } */

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
