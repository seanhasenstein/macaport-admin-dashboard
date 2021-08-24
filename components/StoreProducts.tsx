import React from 'react';
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
        queryClient.invalidateQueries(['store', storeId]),
          queryClient.invalidateQueries('stores', { exact: true });
      },
    }
  );

  const {
    list,
    dragging,
    handleDragStart,
    handleDragEnter,
    handleDrop,
    getStyles,
    handleMouseDown,
    handleMouseUp,
  } = useDragNDrop(products, 'product', updateProductMutation.mutate);

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
      {list.map((product, index) => (
        <div
          key={product.id}
          draggable={dragging}
          onDragStart={e => handleDragStart(e, index)}
          onDragEnter={dragging ? e => handleDragEnter(e, index) : undefined}
          onDragOver={e => e.preventDefault()}
          onDrop={handleDrop}
          className={dragging ? getStyles(index) : 'product'}
        >
          <button
            type="button"
            onMouseDown={handleMouseDown}
            onMouseUp={handleMouseUp}
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
          <Link href={`/stores/${storeId}/product?prodId=${product.id}`}>
            <a className="product-name">{product.name}</a>
          </Link>
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
      ))}
    </StoreProductsStyles>
  );
}

const StoreProductsStyles = styled.div`
  .product {
    position: relative;
    display: grid;
    grid-template-columns: 2.5rem 1fr 3rem;
    align-items: center;
    border-top: 1px solid #e5e7eb;

    &:first-of-type {
      border-top: none;
    }

    &:hover {
      background-color: #f9fafb;
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
  }

  .menu-button {
    padding: 1rem 0.5rem;
    margin-left: auto;
    padding: 0.125rem;
    display: flex;
    justify-content: center;
    align-items: center;
    background-color: transparent;
    background-color: red;
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
`;
