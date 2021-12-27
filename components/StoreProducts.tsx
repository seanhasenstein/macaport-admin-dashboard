import React from 'react';
import { useRouter } from 'next/router';
import { useMutation, useQueryClient } from 'react-query';
import Link from 'next/link';
import styled from 'styled-components';
import { Product } from '../interfaces';
import useDragNDrop from '../hooks/useDragNDrop';
import StoreProductMenu from './StoreProductMenu';

type Props = {
  products: Product[];
  storeId: string;
  setProductIdToDelete: React.Dispatch<
    React.SetStateAction<string | undefined>
  >;
  setShowDeleteProductModal: React.Dispatch<React.SetStateAction<boolean>>;
};

export default function StoreProducts({
  products,
  storeId,
  setProductIdToDelete,
  setShowDeleteProductModal,
}: Props) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [showMenu, setShowMenu] = React.useState<string | undefined>(undefined);

  const updateProductMutation = useMutation(
    async (updatedProducts: Product[]) => {
      const response = await fetch(`/api/stores/update?id=${storeId}`, {
        method: 'post',
        body: JSON.stringify({ products: updatedProducts }),
        headers: {
          'Content-Type': 'application/json',
        },
      });
      if (!response.ok) {
        throw new Error('Failed to update the products.');
      }
      const data = await response.json();
      return data.store;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries('stores');
      },
    }
  );

  const dnd = useDragNDrop(products, 'product', updateProductMutation.mutate);

  const handleProductMenuClick = (id: string) => {
    if (id === showMenu) {
      setShowMenu(undefined);
    } else {
      setShowMenu(id);
    }
  };

  const handleDeleteProductMenuClick = (id: string) => {
    setShowMenu(undefined);
    setProductIdToDelete(id);
    setShowDeleteProductModal(true);
  };

  return (
    <StoreProductsStyles>
      <div className="product-header">
        <h3>Store Products</h3>
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
            Add a product
          </a>
        </Link>
      </div>
      {products?.length > 0 && (
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
              <Link href={`/stores/${storeId}/product?pid=${product.id}`}>
                <a className="product-name">{product.name}</a>
              </Link>
              <div className="product-menu-container">
                <button
                  type="button"
                  className="menu-button"
                  onClick={() => handleProductMenuClick(product.id)}
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
                  storeId={storeId}
                  productId={product.id}
                  showMenu={showMenu}
                  setShowMenu={setShowMenu}
                  handleDeleteButtonClick={handleDeleteProductMenuClick}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </StoreProductsStyles>
  );
}

const StoreProductsStyles = styled.div`
  max-width: 40rem;

  .product-header {
    margin: 0 0 1.5rem;
    display: flex;
    justify-content: space-between;
    align-items: flex-end;

    h3 {
      margin: 0;
    }
  }

  .add-product-link {
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: 0.875rem;
    font-weight: 500;
    color: #4338ca;
    line-height: 1;
    cursor: pointer;

    svg {
      margin: 0 0.375rem 0 0;
      height: 0.875rem;
      width: 0.875rem;
    }

    &:hover {
      color: #3730a3;
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
      display: flex;
      flex-direction: column;
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
  }

  .menu-button {
    padding: 1rem 0.5rem;
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
    right: 1rem;
    top: 2.5rem;
  }
`;
