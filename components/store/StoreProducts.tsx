import React from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import styled from 'styled-components';
import { Store } from '../../interfaces';
import { useStoreMutations } from '../../hooks/useStoreMutations';
import useDragNDrop from '../../hooks/useDragNDrop';
import StoreProductMenu from './StoreProductMenu';
import { getActiveProductColors } from '../../utils/storeProductColors';

type Props = {
  store: Store;
};

export default function StoreProducts({ store }: Props) {
  const router = useRouter();
  const { updateStoreProductsOrder } = useStoreMutations({ store });
  const dnd = useDragNDrop(
    store.products,
    'product',
    updateStoreProductsOrder.mutate
  );

  return (
    <StoreProductsStyles>
      <div className="products-container">
        <div className="products-header">
          <h3>Store products</h3>
          <Link href={`/stores/${router.query.id}/product/add`}>
            <a className="add-product-link">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
                  clipRule="evenodd"
                />
              </svg>
              Add a store product
            </a>
          </Link>
        </div>

        <div className="products-table">
          <div className="products-header-labels">
            <div className="product-header-item">Order</div>
            <div className="product-header-item">Image</div>
            <div className="product-details">
              <div className="product-header-item">Name</div>
              <div className="product-header-item">Merch. Code</div>
              <div className="product-header-item">Artwork ID</div>
            </div>
            <div className="product-header-item">Menu</div>
          </div>

          {store.products?.length > 0 ? (
            <div className="products">
              {dnd.list.map((product, index) => {
                const activeColors = getActiveProductColors(product);
                const firstActiveColorWithPrimaryImg = activeColors.find(
                  activeColor =>
                    product.productSkus.find(
                      prodSku =>
                        prodSku.color.id === activeColor.id &&
                        prodSku.active &&
                        prodSku.inventorySkuActive
                    )
                );

                return (
                  <div
                    key={product.id}
                    draggable={dnd.dragging}
                    onDragStart={e => dnd.handleDragStart(e, index)}
                    onDragEnter={
                      dnd.dragging
                        ? e => dnd.handleDragEnter(e, index)
                        : undefined
                    }
                    onDragOver={e => e.preventDefault()}
                    onDrop={dnd.handleDrop}
                    className={dnd.dragging ? dnd.getStyles(index) : 'product'}
                  >
                    <button
                      type="button"
                      onMouseDown={dnd.handleMouseDown}
                      onMouseUp={dnd.handleMouseUp}
                      className="drag-button"
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
                          d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z"
                        />
                      </svg>
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
                          d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z"
                        />
                      </svg>
                    </button>
                    <div className="product-primary-img">
                      {firstActiveColorWithPrimaryImg ? (
                        <img
                          src={firstActiveColorWithPrimaryImg.primaryImage}
                          alt={product.name}
                        />
                      ) : (
                        <div className="no-img">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={1.5}
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"
                            />
                          </svg>
                        </div>
                      )}
                    </div>
                    <div className="product-item">
                      <div>
                        <div className="product-name">
                          <Link
                            href={`/stores/${store._id}/product?pid=${product.id}`}
                          >
                            <a className="primary-link">{product.name}</a>
                          </Link>
                        </div>
                        <div className="product-colors">
                          {activeColors.length > 0 ? (
                            <>
                              {activeColors.map(color => (
                                <ProductColor
                                  key={color.id}
                                  hex={color.hex}
                                  title={color.hex}
                                />
                              ))}
                            </>
                          ) : (
                            <div className="no-active-colors">
                              No active colors
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="secondary-item merch-code">
                        <span className="mobile-label">Merch. Code:</span>
                        {product.merchandiseCode}
                      </div>
                      <div className="secondary-item artwork-id">
                        <span className="mobile-label">Artwork ID:</span>
                        {product.artworkId || ''}
                      </div>
                    </div>

                    <StoreProductMenu
                      storeId={store._id}
                      productId={product.id}
                      inventoryProductId={product.inventoryProductId}
                    />
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="empty">
              This store has no products.{' '}
              <Link href={`/stores/${store._id}/product/add`}>
                <a>Add a product</a>
              </Link>
              .
            </div>
          )}
        </div>
      </div>
    </StoreProductsStyles>
  );
}

const StoreProductsStyles = styled.div`
  margin: 5rem 0 0;

  .products-header {
    margin: 0 0 1.5rem;
    display: flex;
    justify-content: space-between;

    h3 {
      margin: 0;
    }
  }

  .add-product-link {
    padding: 0.6875rem 1rem;
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: 0.875rem;
    font-weight: 500;
    color: #1f2937;
    line-height: 1;
    background-color: #fff;
    border: 1px solid #d1d5db;
    border-radius: 0.3125rem;
    box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05);
    cursor: pointer;

    svg {
      margin: 0 0.5rem 0 0;
      height: 0.875rem;
      width: 0.875rem;
      color: #4b5563;
    }

    &:hover {
      color: #000;
      border-color: #c6cbd2;
      box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.1);
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

  .products-table {
    margin: 2rem 0 0;
    border: 1px solid #d1d5db;
    border-radius: 0.375rem;
    box-shadow: rgba(0, 0, 0, 0) 0px 0px 0px 0px,
      rgba(0, 0, 0, 0) 0px 0px 0px 0px, rgba(0, 0, 0, 0.1) 0px 1px 3px 0px,
      rgba(0, 0, 0, 0.06) 0px 1px 2px 0px;
  }

  .products-header-labels,
  .product {
    padding-right: 2rem;
    padding-left: 2rem;
    display: grid;
    grid-template-columns: 5rem 5rem 1fr 3rem;
    align-items: center;
  }

  .product-details,
  .product-item {
    display: grid;
    grid-template-columns: 1fr 10rem 15rem;
    align-items: center;
  }

  .products-header-labels {
    padding-top: 1rem;
    padding-bottom: 1rem;
    background-color: #e8eaee;
    border-bottom: 1px solid #d1d5db;
    border-radius: 0.375rem 0.375rem 0 0;
  }

  .product-header-item {
    font-size: 0.75rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.0375em;
    color: #374151;
  }

  .products {
    background-color: #fff;
    border-radius: 0 0 0.375rem 0.375rem;
  }

  .product {
    padding-top: 1.125rem;
    padding-bottom: 1.125rem;
    position: relative;
    border-top: 1px solid #e5e7eb;

    &:first-of-type {
      border-top: none;
    }

    .drag-button {
      height: 1.5rem;
      width: 2.75rem;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      background-color: transparent;
      border: none;
      cursor: grab;
      color: #9ca3af;

      &:hover {
        color: #111827;
      }

      &:active {
        cursor: grabbing;
      }

      svg {
        height: 1.125rem;
        width: 1.125rem;

        &:last-of-type {
          margin-top: -0.75rem;
        }
      }
    }
  }

  .product-primary-img {
    padding: 0.25rem 0.3125rem;
    width: 2.5rem;
    display: flex;
    justify-content: center;
    align-items: center;
    border: 1px solid #e5e7eb;
    border-radius: 0.1875rem;
    box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05);

    img {
      width: 100%;
    }

    .no-img {
      padding: 0.625rem 0.25rem 0.375rem;

      svg {
        height: 1.125rem;
        width: 1.125rem;
        color: #4b5563;
      }
    }
  }

  .product-item {
    .primary-link {
      margin-right: 1rem;
      display: block;
      font-size: 0.9375rem;
      font-weight: 600;
      color: #111827;
      line-height: 1.35;

      &:hover {
        text-decoration: underline;
      }

      &:focus {
        outline: 2px solid transparent;
        outline-offset: 2px;
      }

      &:focus-visible {
        text-decoration: underline;
        color: #1955a8;
      }
    }

    .secondary-item {
      font-size: 0.875rem;
      font-weight: 500;
      color: #4b5563;
    }
  }

  .product-colors {
    margin: 0.375rem 0 0;
    display: flex;
    gap: 0.3125rem;
  }

  .no-active-colors {
    margin: 0.125rem 0 0;
    padding: 0.25rem 0.875rem;
    background-color: #f9fafb;
    font-size: 0.8125rem;
    font-weight: 500;
    color: #374151;
    border: 1px solid #e5e7eb;
    border-radius: 9999px;
  }

  .mobile-label {
    display: none;
  }

  .empty {
    padding: 1.5rem 2rem;
    background-color: #fff;
    font-size: 1rem;
    font-weight: 500;
    color: #4b5563;
    border-radius: 0 0 0.375rem 0.375rem;

    a {
      color: #1955a8;
      text-decoration: underline;
    }
  }

  @media (max-width: 1024px) {
    .products-header-labels {
      display: none;
    }

    .products {
      border-radius: 0.375rem;
    }

    .product-item {
      display: grid;
      grid-template-columns: unset;
      grid-template-areas:
        'productName productName'
        'merchCode artworkId';
      align-items: flex-start;
    }

    .product-name {
      grid-area: productName;
    }

    .merch-code,
    .artwork-id {
      margin: 0.5rem 0 0;
      display: flex;
    }

    .merch-code {
      margin-right: 1rem;
      grid-area: merchCode;
    }

    .artwork-id {
      grid-area: artworkId;
    }

    .mobile-label {
      margin: 0 0.5rem 0 0;
      display: block;
    }
  }
`;

const ProductColor = styled.div<{ hex: string }>`
  background-color: ${props => props.hex};
  height: 1rem;
  width: 1rem;
  border-radius: 9999px;
  border: 1px solid rgba(0, 0, 0, 0.25);
  box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05);
`;
