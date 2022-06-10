import React from 'react';
import styled from 'styled-components';
import { InventoryProduct } from '../../interfaces';
import { useInventoryProductMutations } from '../../hooks/useInventoryProductMutations';
import useDragNDrop from '../../hooks/useDragNDrop';

type Props = {
  productName: string;
  inventoryProduct: InventoryProduct;
  setShowInventoryModal: React.Dispatch<React.SetStateAction<boolean>>;
};

export default function InventoryProductSkus({
  productName,
  inventoryProduct,
  setShowInventoryModal,
}: Props) {
  const { updateSkuActiveStatus, updateSkuOrder } =
    useInventoryProductMutations(inventoryProduct);

  const dnd = useDragNDrop(inventoryProduct.skus, 'sku', updateSkuOrder.mutate);

  return (
    <InventoryProductSkusStyles>
      <div className="header-row">
        <h3>Inventory product skus</h3>
        <button
          type="button"
          onClick={() => setShowInventoryModal(true)}
          className="update-inventory-button"
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
              d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"
            />
          </svg>
          Update inventory
        </button>
      </div>
      <div className="skus">
        <div className="sku-row skus-header">
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
            className={dnd.dragging ? dnd.getStyles(i) : 'sku-row'}
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
              <div className="product-name">{productName}</div>
              <div className="sku-id">{s.id}</div>
            </div>
            <div>{s.size.label}</div>
            <div className="color">
              <Color hex={s.color.hex} />
              {s.color.label}
            </div>
            <div
              className={`text-center${s.inventory < 3 ? ' running-low' : ''}`}
            >
              {s.inventory}
            </div>
            <div className="product-status text-center">
              <button
                type="button"
                onClick={() => updateSkuActiveStatus.mutate(s.id)}
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
  margin: 3.5rem 0 0;

  .header-row {
    display: flex;
    justify-content: space-between;
    align-items: flex-end;

    h3 {
      margin: 0;
    }
  }

  .update-inventory-button {
    padding: 0.6875rem 1rem;
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: 0.875rem;
    font-weight: 500;
    color: #1f2937;
    line-height: 1;
    background-color: transparent;
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

  .skus {
    margin: 2rem 0 0;
    background-color: #fff;
    border: 1px solid #e5e7eb;
    border-radius: 0.375rem;
    box-shadow: rgba(0, 0, 0, 0) 0px 0px 0px 0px,
      rgba(0, 0, 0, 0) 0px 0px 0px 0px, rgba(0, 0, 0, 0.05) 0px 1px 2px 0px;
  }

  .sku-row {
    padding: 0.75rem 2rem 0.75rem 1.5rem;
    display: grid;
    grid-template-columns: 4rem 1.25fr 0.75fr 0.75fr 12rem 5rem;
    align-items: center;
    font-size: 0.875rem;
    font-weight: 500;
    color: #374151;
    border-bottom: 1px solid #e5e7eb;

    &.skus-header {
      background-color: #f3f4f6;
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
`;

function Color({ hex }: { hex: string }) {
  return <ColorStyle hex={hex} title={hex} />;
}

const ColorStyle = styled.span<{ hex: string }>`
  margin: 0 0.6875rem 0 0;
  display: flex;
  background-color: ${props => props.hex};
  height: 1rem;
  width: 1rem;
  border-radius: 9999px;
  border: 1px solid rgba(0, 0, 0, 0.25);
  box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05);
`;
