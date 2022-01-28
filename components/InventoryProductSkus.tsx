import React from 'react';
import { useRouter } from 'next/router';
import styled from 'styled-components';
import { useMutation, useQueryClient } from 'react-query';
import { InventoryProduct, InventorySku } from '../interfaces';
import useDragNDrop from '../hooks/useDragNDrop';

type Props = {
  inventoryProduct: InventoryProduct;
};

export default function InventoryProductSkus({ inventoryProduct }: Props) {
  const queryClient = useQueryClient();
  const router = useRouter();

  const updateOrderMutation = useMutation(async (dndSkus: InventorySku[]) => {
    const response = await fetch(`/api/inventory-products/update`, {
      method: 'post',
      body: JSON.stringify({
        id: inventoryProduct._id,
        update: { skus: dndSkus },
      }),
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to update the inventory order.');
    }

    const data = await response.json();
    return data.inventoryProduct;
  });

  const dnd = useDragNDrop(
    inventoryProduct.skus,
    'sku',
    updateOrderMutation.mutate
  );

  const updateActiveStatus = useMutation(
    async (skuId: string) => {
      if (!inventoryProduct) {
        throw new Error('No inventory product found.');
      }

      const updatedSkus = inventoryProduct.skus.map(s => {
        if (s.id === skuId) {
          return { ...s, active: !s.active };
        }
        return s;
      });

      const { _id, ...update }: InventoryProduct = {
        ...inventoryProduct,
        skus: updatedSkus,
      };

      const response = await fetch(`/api/inventory-products/update`, {
        method: 'post',
        body: JSON.stringify({ id: inventoryProduct._id, update }),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to updated the inventory product sku.');
      }

      const data = await response.json();
      return data.inventoryProduct;
    },
    {
      onMutate: async skuId => {
        if (!inventoryProduct) {
          throw new Error('No inventory product found.');
        }
        const updatedSkus = inventoryProduct.skus.map(s => {
          if (s.id === skuId) {
            return { ...s, active: !s.active };
          }
          return s;
        });

        const update: InventoryProduct = {
          ...inventoryProduct,
          skus: updatedSkus,
        };
        await queryClient.cancelQueries([
          'inventory-products',
          'inventory-product',
          router.query.id,
        ]);
        queryClient.setQueryData(
          ['inventory-products', 'inventory-product', router.query.id],
          update
        );
      },
      onError: () => {
        queryClient.setQueryData(
          ['inventory-products', 'inventory-product', router.query.id],
          inventoryProduct
        );
      },
      onSettled: () => {
        queryClient.invalidateQueries(['inventory-products']);
        queryClient.invalidateQueries(['stores']);
      },
    }
  );

  return (
    <InventoryProductSkusStyles>
      <h3>Inventory Product Skus</h3>
      <div className="skus">
        <div className="sku header">
          <div />
          <div>ID</div>
          <div>Size</div>
          <div>Color</div>
          <div className="text-center">Inventory</div>
          <div className="text-center">Status</div>
        </div>
        {dnd.list.map((s, i) => (
          <div
            key={s.id}
            draggable={dnd.dragging}
            onDragStart={e => dnd.handleDragStart(e, i)}
            onDragEnter={
              dnd.dragging ? e => dnd.handleDragEnter(e, i) : undefined
            }
            onDragOver={e => e.preventDefault()}
            onDrop={dnd.handleDrop}
            className={dnd.dragging ? dnd.getStyles(i) : 'sku'}
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
            <div className="sku-id">{s.id}</div>
            <div>{s.size.label}</div>
            <div className="color">
              <Color hex={s.color.hex} />
              {s.color.label} - {s.color.hex}
            </div>
            <div
              className={`text-center${s.inventory < 6 ? ' running-low' : ''}`}
            >
              {s.inventory}
            </div>
            <div className="product-status text-center">
              <button
                type="button"
                onClick={() => updateActiveStatus.mutate(s.id)}
                role="switch"
                aria-checked={s.active}
                className={`toggle-button ${s.active ? 'on' : 'off'}`}
              >
                <span className="sr-only">
                  {s.active ? (
                    <>
                      Turn {s.active && 'off'}
                      {s.active && !s.active && 'on'}
                    </>
                  ) : (
                    'Button disabled'
                  )}
                </span>
                <span aria-hidden="true" className="span1" />
                <span
                  aria-hidden="true"
                  className={`span2 ${s.active ? 'on' : 'off'}`}
                />
                <span
                  aria-hidden="true"
                  className={`span3 ${s.active ? 'on' : 'off'}`}
                />
              </button>
            </div>
          </div>
        ))}
      </div>
    </InventoryProductSkusStyles>
  );
}

const InventoryProductSkusStyles = styled.div`
  .skus {
    padding: 0.25rem;
    background-color: #fff;
    box-shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1);
    border-radius: 0.25rem;
  }

  .sku {
    padding: 0.75rem 2rem 0.75rem 1.5rem;
    display: grid;
    grid-template-columns: 4rem 1.25fr 0.75fr 0.75fr 12rem 5rem;
    align-items: center;
    font-size: 0.875rem;
    font-weight: 500;
    color: #374151;
    border-bottom: 1px solid #e5e7eb;

    &.header {
      padding: 0.75rem 2rem;
      background-color: #f3f4f6;
      border-top: 1px solid #e5e7eb;
      font-size: 0.75rem;
      font-weight: 600;
      color: #4b5563;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    &:last-of-type {
      border-bottom: none;
    }
  }

  .drag-button {
    display: flex;
    width: 2rem;
    flex-direction: column;
    justify-content: center;
    align-items: center;
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

  .sku-id {
    font-family: 'Dank Mono', 'Menlo', monospace;
    font-size: 0.9375rem;
    font-weight: 700;
  }

  .color {
    display: flex;
    align-items: center;
  }

  .running-low {
    color: #991b1b;
  }

  .product-status {
    position: relative;
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .toggle-button {
    position: relative;
    padding: 0;
    flex-shrink: 0;
    display: inline-flex;
    justify-content: center;
    align-items: center;
    width: 2.5rem;
    height: 1.25rem;
    border: none;
    border-radius: 9999px;
    cursor: pointer;

    &:focus {
      outline: 2px solid transparent;
      outline-offset: 2px;
    }

    &:focus-visible {
      box-shadow: rgb(255, 255, 255) 0px 0px 0px 2px, #1c5eb9 0px 0px 0px 4px,
        rgba(0, 0, 0, 0) 0px 0px 0px 0px;
    }

    .span1 {
      position: absolute;
      width: 100%;
      height: 100%;
      background-color: #fff;
      border-radius: 0.375rem;
      pointer-events: none;
    }

    .span2 {
      position: absolute;
      margin-left: auto;
      margin-right: auto;
      width: 2.25rem;
      height: 1rem;
      border-radius: 9999px;
      pointer-events: none;
      transition-duration: 0.2s;
      transition-property: background-color, border-color, color, fill, stroke;
      transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);

      &.on {
        background-color: #26ae7c;
      }

      &.off {
        background-color: #e5e7eb;
      }
    }

    .span3 {
      position: absolute;
      left: 0;
      display: inline-block;
      width: 1.25rem;
      height: 1.25rem;
      background-color: #fff;
      border: 1px solid #e5e7eb;
      border-radius: 9999px;
      box-shadow: rgb(255, 255, 255) 0px 0px 0px 0px,
        rgba(59, 130, 246, 0.5) 0px 0px 0px 0px,
        rgba(0, 0, 0, 0.1) 0px 1px 3px 0px, rgba(0, 0, 0, 0.06) 0px 1px 2px 0px;
      pointer-events: none;
      transition-duration: 0.2s;
      transition-property: transform;
      transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);

      &.on {
        transform: translateX(1.25rem);
      }

      &.off {
        transform: translateX(0rem);
      }
    }
  }
`;

function Color({ hex }: { hex: string }) {
  return <ColorStyle hex={hex} />;
}

const ColorStyle = styled.span<{ hex: string }>`
  margin: 0 0.875rem 0 0;
  display: flex;
  height: 0.75rem;
  width: 0.75rem;
  border-radius: 9999px;
  background-color: ${props => props.hex};
  box-shadow: rgb(255, 255, 255) 0px 0px 0px 0px,
    rgba(17, 24, 39, 0.1) 0px 0px 0px 1px, rgba(0, 0, 0, 0.1) 0px 4px 6px -1px,
    rgba(0, 0, 0, 0.1) 0px 2px 4px -1px;
`;
