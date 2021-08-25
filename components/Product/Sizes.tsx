import { useMutation, useQueryClient } from 'react-query';
import styled from 'styled-components';
import useDragNDrop from '../../hooks/useDragNDrop';
import { formatToMoney } from '../../utils';
import { Store, Product, Size } from '../../interfaces';

type Props = {
  sizes: Size[];
  storeId: string;
  product: Product;
};

export default function Sizes({ sizes, storeId, product }: Props) {
  const queryClient = useQueryClient();

  const sizesMutation = useMutation(
    async (sizes: Size[]) => {
      const response = await fetch(
        `/api/stores/update-product?id=${storeId}&prodId=${product.id}`,
        {
          method: 'post',
          body: JSON.stringify({ ...product, sizes }),
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
      if (!response.ok) {
        throw new Error('Failed to update the sizes.');
      }
      const { store }: { store: Store } = await response.json();
      const updatedProduct = store.products.find(p => p.id === product.id);
      return updatedProduct?.sizes;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['product', product.id]);
        queryClient.invalidateQueries('stores', { exact: true });
        queryClient.invalidateQueries(['store', storeId]);
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
  } = useDragNDrop(sizes, 'prod-size', sizesMutation.mutate);

  return (
    <SizesStyles>
      {list.map((s, index) => (
        <div
          key={s.id}
          draggable={dragging}
          onDragStart={e => handleDragStart(e, index)}
          onDragEnter={dragging ? e => handleDragEnter(e, index) : undefined}
          onDragOver={e => e.preventDefault()}
          onDrop={handleDrop}
          className={dragging ? getStyles(index) : 'prod-size'}
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
          <div>{s.label}</div>
          <div className="size-price">{formatToMoney(s.price)}</div>
        </div>
      ))}
    </SizesStyles>
  );
}

const SizesStyles = styled.div`
  max-width: 30rem;
  width: 100%;

  .prod-sizes {
    max-width: 16rem;
    width: 100%;
  }

  .prod-size {
    padding: 0.75rem 0;
    display: grid;
    grid-template-columns: 2.5rem 1fr 0.5fr;
    align-items: center;
    border-bottom: 1px solid #e5e7eb;
    color: #4b5563;

    &:last-of-type {
      border-bottom: none;
    }
  }

  .size-price {
    text-align: right;
  }

  .drag-button {
    display: flex;
    flex-direction: column;
    background-color: transparent;
    border: none;
    color: #9ca3af;

    &:hover {
      color: #111827;
      cursor: grab;
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
`;
