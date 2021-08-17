import { useRouter } from 'next/router';
import Link from 'next/link';
import { useQuery, useQueryClient } from 'react-query';
import { useSession } from '../../../hooks/useSession';
import { Store } from '../../../interfaces';
import styled from 'styled-components';
import Layout from '../../../components/Layout';
import { formatToMoney } from '../../../utils';

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
                  <div className="prod-sizes">
                    {product.sizes.map(s => (
                      <div key={s.id} className="prod-size">
                        <div>{s.label}</div>
                        <div>{formatToMoney(s.price)}</div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="section">
                  <h4>Colors</h4>
                  {product.colors.map(c => (
                    <div key={c.id} className="prod-color">
                      <div className="color-details">
                        <div className="color-label">
                          <div className="label">Label</div>
                          <div className="value">{c.label}</div>
                        </div>
                        <div className="color-hex">
                          <div className="label">Hex</div>
                          <div className="value">
                            <span />
                            {c.hex}
                          </div>
                        </div>
                      </div>
                      <div className="color-imgs">
                        <div className="primary-img">
                          <img
                            src={c.primaryImage}
                            alt={`${c.label} primary`}
                          />
                        </div>
                        <div className="secondary-imgs">
                          <div className="label">Secondary Images</div>
                          <div className="value">
                            {c.secondaryImages.map((s, i) => (
                              <div key={i} className="secondary-img">
                                <img
                                  src={s}
                                  alt={`${c.label} secondary ${i}`}
                                />
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
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
  .prod-detail,
  .prod-size {
    color: #4b5563;
  }

  .prod-details {
    padding-left: 1.125rem;
  }

  .prod-detail {
    margin: 0.5rem 0 0;
    color: #4b5563;
  }

  .prod-sizes {
    max-width: 16rem;
    width: 100%;
  }

  .prod-size {
    padding: 0.75rem 0;
    display: flex;
    justify-content: space-between;
    border-bottom: 1px solid #e5e7eb;

    &:last-of-type {
      border-bottom: none;
    }
  }

  .prod-color {
    padding: 1rem 0;
    max-width: 38rem;
    width: 100%;
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 1.5rem;
    border-bottom: 1px solid #e5e7eb;

    &:first-of-type {
      border-top: 1px solid #e5e7eb;
    }
  }

  .color-details {
    width: 58%;
  }

  .color-imgs {
    display: flex;
    justify-content: space-between;
    width: 42%;
  }

  .primary-img {
    padding: 0.25rem;
    width: 3.25rem;
    background-color: #fff;
    border: 1px solid #e5e7eb;
    border-radius: 0.25rem;
    box-shadow: rgba(0, 0, 0, 0) 0px 0px 0px 0px,
      rgba(0, 0, 0, 0) 0px 0px 0px 0px, rgba(0, 0, 0, 0.05) 0px 1px 2px 0px;

    img {
      width: 100%;
    }
  }

  .color-details {
    display: flex;
  }

  .color-label,
  .color-hex {
    width: 50%;
  }

  .color-hex span {
    margin: 0 0.5rem 0 0;
    display: block;
    height: 1rem;
    width: 1rem;
    border: 1px solid #d1d5db;
    border-radius: 9999px;
  }

  .secondary-imgs .value {
    display: flex;
    gap: 0.5rem;
  }

  .secondary-img {
    width: 2rem;

    img {
      width: 100%;
    }
  }

  .label {
    margin: 0 0 0.375rem;
    font-size: 0.875rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: #6b7280;
  }

  .value {
    display: flex;
    align-items: center;
    color: #374151;
  }
`;
