import React from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import styled from 'styled-components';
import { Store } from '../../interfaces';
import { useStoreMutations } from '../../hooks/useStoreMutations';
import useDragNDrop from '../../hooks/useDragNDrop';
import StoreProductMenu from './StoreProductMenu';

type Props = {
  store: Store;
};

export default function StoreProducts({ store }: Props) {
  const router = useRouter();
  const { updateStoreProducts } = useStoreMutations({ store });
  const dnd = useDragNDrop(
    store.products,
    'product',
    updateStoreProducts.mutate
  );

  return (
    <StoreProductsStyles>
      <div className="products-container">
        <div className="products-header">
          <h3>Store products</h3>
          {store.products?.length > 0 && (
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
                Add another product
              </a>
            </Link>
          )}
        </div>

        {store.products?.length > 0 ? (
          <div className="products">
            {dnd.list.map((product, index) => (
              <div
                key={product.id}
                draggable={dnd.dragging}
                onDragStart={e => dnd.handleDragStart(e, index)}
                onDragEnter={
                  dnd.dragging ? e => dnd.handleDragEnter(e, index) : undefined
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
                <Link href={`/stores/${store._id}/product?pid=${product.id}`}>
                  <a className="product-name">
                    {product.name} ({product.merchandiseCode})
                  </a>
                </Link>

                <StoreProductMenu
                  storeId={store._id}
                  productId={product.id}
                  inventoryProductId={product.inventoryProductId}
                />
              </div>
            ))}
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
    </StoreProductsStyles>
  );
}

const StoreProductsStyles = styled.div`
  margin: 4.5rem 0 0;

  .products-container {
    max-width: 40rem;
  }

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

  .products {
    background-color: #fff;
    border-radius: 0.375rem;
    box-shadow: rgba(0, 0, 0, 0) 0px 0px 0px 0px,
      rgba(0, 0, 0, 0) 0px 0px 0px 0px, rgba(0, 0, 0, 0.1) 0px 1px 3px 0px,
      rgba(0, 0, 0, 0.06) 0px 1px 2px 0px;
  }

  .product {
    padding: 0 1rem;
    position: relative;
    display: grid;
    grid-template-columns: 2.5rem 1fr 3rem;
    align-items: center;
    border-top: 1px solid #e5e7eb;

    &:first-of-type {
      border-top: none;
    }

    .drag-button {
      height: 1.5rem;
      width: 2rem;
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

  .product-name {
    padding: 1rem 0.5rem;
    font-size: 0.9375rem;
    font-weight: 500;
    color: #374151;

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

  .empty {
    margin: 2rem 0 0;
    font-size: 1rem;
    font-weight: 500;
    color: #89909d;

    a {
      color: #1955a8;
      text-decoration: underline;
    }
  }
`;
