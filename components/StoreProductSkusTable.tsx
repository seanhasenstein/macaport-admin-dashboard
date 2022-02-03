import React from 'react';
import styled from 'styled-components';
import { ProductSku, StoreProduct } from '../interfaces';
import { useStoreProductMutations } from '../hooks/useStoreProductMutations';
import useDragNDrop from '../hooks/useDragNDrop';
import StoreProductSkusTableMenu from './StoreProductSkusTableMenu';
import { formatToMoney } from '../utils';

type Props = {
  storeId: string | undefined;
  storeProduct: StoreProduct;
  productSkus: ProductSku[];
  inventoryProductId: string;
};

export default function StoreProductSkusTable({
  storeId,
  storeProduct,
  productSkus,
  inventoryProductId,
}: Props) {
  const { updateProductSkusOrder, updateSkuStatus } = useStoreProductMutations({
    storeProduct,
  });
  const dnd = useDragNDrop(productSkus, 'sku', updateProductSkusOrder.mutate);

  if (!storeId) {
    throw new Error('No store ID provided.');
  }

  return (
    <StoreProductSkusTableStyles>
      <h3>Store product skus</h3>
      <div className="skus">
        <div className="sku header">
          <div />
          <div>ID</div>
          <div>Size</div>
          <div>Color</div>
          <div>Price</div>
          <div className="text-center">Inventory</div>
          <div className="text-center">Status</div>
          <div className="text-right">Menu</div>
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
            <div>
              <div className="product-name">{storeProduct.name}</div>
              <div className="sku-id">{s.id}</div>
            </div>
            <div>{s.size.label}</div>
            <div className="color">
              <Color hex={s.color.hex} />
              {s.color.label}
            </div>
            <div>{formatToMoney(s.size.price)}</div>
            <div
              className={`text-center ${
                s.inventory && s.inventory < 3 ? ' running-low' : ''
              }`}
            >
              {s.inventory}
            </div>
            <div className="product-status text-center">
              <button
                type="button"
                onClick={() =>
                  updateSkuStatus.mutate({
                    storeId,
                    storeProductId: s.storeProductId,
                    productSkuId: s.id,
                    updatedProductSku: { ...s, active: !s.active },
                  })
                }
                disabled={!s.inventorySkuActive}
                role="switch"
                aria-checked={s.inventorySkuActive && s.active}
                className={`toggle-button ${
                  s.inventorySkuActive && s.active ? 'on' : 'off'
                }`}
              >
                <span className="sr-only">
                  {s.inventorySkuActive ? (
                    <>
                      Turn {s.inventorySkuActive && s.active && 'off'}
                      {s.inventorySkuActive && !s.active && 'on'}
                    </>
                  ) : (
                    'Button disabled'
                  )}
                </span>
                <span aria-hidden="true" className="span1" />
                <span
                  aria-hidden="true"
                  className={`span2 ${
                    s.inventorySkuActive && s.active ? 'on' : 'off'
                  }`}
                />
                <span
                  aria-hidden="true"
                  className={`span3 ${
                    s.inventorySkuActive && s.active ? 'on' : 'off'
                  }`}
                />
              </button>
              {!s.inventorySkuActive && (
                <span className="locked">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                </span>
              )}
            </div>
            <StoreProductSkusTableMenu
              inventoryProductId={inventoryProductId}
            />
          </div>
        ))}
      </div>
    </StoreProductSkusTableStyles>
  );
}

const StoreProductSkusTableStyles = styled.div`
  margin: 3.5rem 0 0;

  .skus {
    background-color: #fff;
    border-top: 1px solid #e5e7eb;
    box-shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1);
    border-radius: 0.375rem;
  }

  .sku {
    padding: 0.75rem 2rem 0.75rem 1.5rem;
    display: grid;
    grid-template-columns: 4rem 1.25fr 0.75fr 0.75fr 0.25fr 12rem 3rem 7rem;
    align-items: center;
    font-size: 0.875rem;
    font-weight: 500;
    color: #374151;
    border-bottom: 1px solid #e5e7eb;

    &.header {
      padding: 0.75rem 2rem 0.75rem 1.5rem;
      background-color: #f3f4f6;
      font-size: 0.75rem;
      font-weight: 600;
      color: #4b5563;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      border-radius: 0.375rem 0.375rem 0 0;
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

  .product-name {
    margin: 0 0 0.1875rem;
    font-size: 0.9375rem;
    font-weight: 500;
    color: #000;
  }

  .sku-id {
    font-family: 'Dank Mono', 'Menlo', monospace;
    font-size: 0.875rem;
    font-weight: 700;
    color: #6b7280;
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

    .locked svg {
      margin: 0 0 0 1rem;
      position: absolute;
      right: -1rem;
      top: 0.3125rem;
      height: 0.75rem;
      width: 0.75rem;
      color: #374151;
    }
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
      box-shadow: rgb(255, 255, 255) 0px 0px 0px 2px, #1c44b9 0px 0px 0px 4px,
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

  .text-center {
    text-align: center;
  }

  .text-right {
    text-align: right;
  }
`;

function Color({ hex }: { hex: string }) {
  return <ColorStyle hex={hex} title={hex} />;
}

const ColorStyle = styled.span<{ hex: string }>`
  margin: 0.1875rem 0.6875rem 0 0;
  display: flex;
  background-color: ${props => props.hex};
  height: 0.9375rem;
  width: 0.9375rem;
  border-radius: 9999px;
  border: 1px solid rgba(0, 0, 0, 0.25);
  box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05);
`;
