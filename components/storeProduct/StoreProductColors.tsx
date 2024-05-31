import React from 'react';
import { useRouter } from 'next/router';
import styled from 'styled-components';

import { useStoreProductMutations } from '../../hooks/useStoreProductMutations';
import useDragNDrop from '../../hooks/useDragNDrop';

import { getStoreProductColorsWithPrimaryImages } from '../../utils/storeProductColors';
import { formatToMoney } from '../../utils';

import StoreProductSecondaryImages from './StoreProductSecondaryImages';

import { Color, StoreProduct } from '../../interfaces';

type Props = {
  product: StoreProduct;
  storeId: string | undefined;
};

export default function StoreProductColors({ product, storeId }: Props) {
  const router = useRouter();

  const [activeColors, setActiveColors] = React.useState<Color[]>([]);

  const { updateColorsOrder, updateSkuStatus } = useStoreProductMutations({
    storeProduct: product,
  });

  const dnd = useDragNDrop(
    activeColors,
    'prod-color',
    updateColorsOrder.mutate
  );

  React.useEffect(() => {
    const updatedActiveColors = getStoreProductColorsWithPrimaryImages(product);
    setActiveColors(updatedActiveColors);
  }, [product]);

  if (!storeId) {
    throw new Error('No store ID provided.');
  }

  return (
    <StoreProductColorStyles>
      <h3>Product colors</h3>
      {router.query.id ? (
        <>
          {dnd.list.length > 0 ? (
            <div className="colors-container">
              {dnd.list.map((color, index) => (
                <div
                  key={color.id}
                  draggable={dnd.dragging}
                  onDragStart={e => dnd.handleDragStart(e, index)}
                  onDragEnter={
                    dnd.dragging
                      ? e => dnd.handleDragEnter(e, index)
                      : undefined
                  }
                  onDragOver={e => e.preventDefault()}
                  onDrop={dnd.handleDrop}
                  className={dnd.dragging ? dnd.getStyles(index) : 'prod-color'}
                >
                  {dnd.list.length > 1 && (
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
                  )}
                  <div className="full-width">
                    <div className="color-details-row">
                      <div className="color-details">
                        <div className="color-item">
                          <div className="color-label">Label</div>
                          <div className="color-value">{color.label}</div>
                        </div>
                        <div className="color-item">
                          <div className="color-label">Hex</div>
                          <div className="color-value">
                            <ColorSpan hex={color.hex} />
                            {color.hex}
                          </div>
                        </div>
                      </div>
                      <div className="color-imgs">
                        <div className="primary-img">
                          <div className="color-label">Primary Image</div>
                          {color.primaryImage ? (
                            <div className="color-value">
                              <img
                                src={color.primaryImage}
                                alt={`${color.label} primary`}
                              />
                            </div>
                          ) : null}
                        </div>
                        <div className="secondary-imgs">
                          <div className="color-label">Secondary Images</div>
                          <StoreProductSecondaryImages
                            color={color}
                            product={product}
                          />
                        </div>
                      </div>
                    </div>
                    <div className="color-sizes">
                      <div className="color-sizes-header">
                        <div>Size</div>
                        <div className="text-center">Price</div>
                        <div className="text-center">Inventory</div>
                        <div className="text-center">Active status</div>
                      </div>
                      <div className="sizes">
                        {product.productSkus.map(sku => {
                          if (sku.color.id === color.id) {
                            return (
                              <div key={sku.id} className="size">
                                <div>{sku.size.label}</div>
                                <div className="text-center">
                                  {formatToMoney(sku.size.price)}
                                </div>
                                <div className="text-center">
                                  {sku.inventory}
                                </div>
                                <div className="status">
                                  <div className="product-status text-center">
                                    <button
                                      type="button"
                                      onClick={() =>
                                        updateSkuStatus.mutate({
                                          storeId,
                                          storeProductId: sku.storeProductId,
                                          productSkuId: sku.id,
                                          updatedProductSku: {
                                            ...sku,
                                            active: !sku.active,
                                          },
                                        })
                                      }
                                      disabled={!sku.inventorySkuActive}
                                      role="switch"
                                      aria-checked={
                                        sku.inventorySkuActive && sku.active
                                      }
                                      className={`toggle-button ${
                                        sku.inventorySkuActive && sku.active
                                          ? 'on'
                                          : 'off'
                                      }`}
                                    >
                                      <span className="sr-only">
                                        {sku.inventorySkuActive ? (
                                          <>
                                            Turn{' '}
                                            {sku.inventorySkuActive &&
                                              sku.active &&
                                              'off'}
                                            {sku.inventorySkuActive &&
                                              !sku.active &&
                                              'on'}
                                          </>
                                        ) : (
                                          'Button disabled'
                                        )}
                                      </span>
                                      <span
                                        aria-hidden="true"
                                        className="span1"
                                      />
                                      <span
                                        aria-hidden="true"
                                        className={`span2 ${
                                          sku.inventorySkuActive && sku.active
                                            ? 'on'
                                            : 'off'
                                        }`}
                                      />
                                      <span
                                        aria-hidden="true"
                                        className={`span3 ${
                                          sku.inventorySkuActive && sku.active
                                            ? 'on'
                                            : 'off'
                                        }`}
                                      />
                                    </button>
                                    {!sku.inventorySkuActive && (
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
                                </div>
                              </div>
                            );
                          }
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="no-active-colors">
              This product currently has no active colors.
            </div>
          )}
        </>
      ) : (
        <div>A store ID is required.</div>
      )}
    </StoreProductColorStyles>
  );
}

const StoreProductColorStyles = styled.div`
  margin: 4rem 0 6rem;

  .prod-color {
    margin: 0 0 3rem;
    padding: 1.75rem 2rem 2rem;
    max-width: 74rem;
    width: 100%;
    display: flex;
    align-items: center;
    gap: 2rem;
    background: #fafafa;
    border: 1px solid #d1d5db;
    border-radius: 0.25rem;
    box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05);
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

  .full-width {
    width: 100%;
  }

  .color-details-row {
    display: flex;
    justify-content: space-between;
  }

  .color-details {
    width: 40%;
  }

  .color-imgs {
    display: flex;
    justify-content: space-between;
    width: 60%;
  }

  .primary-img {
    width: 30%;
  }

  .secondary-imgs {
    width: 55%;
  }

  .primary-img {
    .color-value {
      padding: 0.25rem 0.5rem;
      width: 2.75rem;
      background-color: #fff;
      border: 1px solid #e5e7eb;
      border-radius: 0.25rem;
      box-shadow: rgba(0, 0, 0, 0) 0px 0px 0px 0px,
        rgba(0, 0, 0, 0) 0px 0px 0px 0px, rgba(0, 0, 0, 0.05) 0px 1px 2px 0px;
    }

    img {
      width: 100%;
    }
  }

  .color-details {
    display: flex;
  }

  .color-item {
    width: 50%;
  }

  .color-label {
    margin: 0 0 0.5rem;
    font-size: 0.75rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.075em;
    color: #3f3f46;
  }

  .color-value {
    display: flex;
    align-items: center;
    font-size: 0.875rem;
    color: #1f2937;
  }

  .no-active-colors {
    font-size: 1rem;
    font-weight: 500;
    color: #6b7280;
  }

  .color-sizes {
    margin: 1.5rem 0 0;
    border: 1px solid #d1d5db;
    background-color: #fff;
    border-radius: 0.25rem;
    box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05);

    .color-sizes-header {
      padding: 0.5rem 1.5rem;
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      font-size: 0.75rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.075em;
      color: #3f3f46;
      background-color: #e5e7eb;
      border-radius: 0.25rem 0.25rem 0 0;
      border-bottom: 1px solid #d1d5db;
    }

    .size {
      padding: 0.375rem 1.5rem;
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      border-bottom: 1px solid #e5e7eb;
      font-size: 0.875rem;
      color: #1f2937;

      &:last-of-type {
        border-bottom: none;
      }
    }

    .status {
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
          box-shadow: rgb(255, 255, 255) 0px 0px 0px 2px,
            #1c44b9 0px 0px 0px 4px, rgba(0, 0, 0, 0) 0px 0px 0px 0px;
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
          transition-property: background-color, border-color, color, fill,
            stroke;
          transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);

          &.on {
            background-color: #26ae7c;
            border: 1px solid #1f8e65;
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
            rgba(0, 0, 0, 0.1) 0px 1px 3px 0px,
            rgba(0, 0, 0, 0.06) 0px 1px 2px 0px;
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
    }
  }
`;

type ColorProps = {
  hex: string;
};

function ColorSpan(props: ColorProps) {
  return <ColorSpanStyles {...props} />;
}

const ColorSpanStyles = styled.span<ColorProps>`
  margin: 0 0.5rem 0 0;
  display: flex;
  background-color: ${props => props.hex};
  height: 1rem;
  width: 1rem;
  border-radius: 9999px;
  border: 1px solid rgba(0, 0, 0, 0.25);
  box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05);
`;
