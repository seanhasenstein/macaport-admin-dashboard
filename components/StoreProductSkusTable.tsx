import React from 'react';
import { useRouter } from 'next/router';
import { useMutation, useQueryClient } from 'react-query';
import styled from 'styled-components';
import { ProductSku, StoreProduct } from '../interfaces';
import StoreProductSkusTableMenu from './StoreProductSkusTableMenu';

type Props = {
  storeId: string | undefined;
  storeProduct: StoreProduct;
  productSkus: ProductSku[];
  inventoryProductId: string;
};

type UpdateActiveStatusProps = {
  storeId: string;
  storeProductId: string;
  productSkuId: string;
  updatedProductSku: ProductSku;
};

export default function StoreProductSkusTable({
  storeId,
  storeProduct,
  productSkus,
  inventoryProductId,
}: Props) {
  const router = useRouter();
  const queryClient = useQueryClient();

  const updateActiveStatus = useMutation(
    async ({
      storeId,
      storeProductId,
      productSkuId,
      updatedProductSku,
    }: UpdateActiveStatusProps) => {
      const response = await fetch(
        '/api/store-products/update-sku-active-status',
        {
          method: 'post',
          body: JSON.stringify({
            storeId,
            storeProductId,
            productSkuId,
            updatedProductSku,
          }),
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to update productSku.active');
      }

      const data = await response.json();
      return data;
    },
    {
      onMutate: async ({ productSkuId, updatedProductSku }) => {
        await queryClient.cancelQueries([
          'stores',
          'store',
          'product',
          router.query.pid,
        ]);

        const updatedProductSkus = storeProduct.productSkus.map(ps => {
          if (ps.id === productSkuId) {
            return updatedProductSku;
          }
          return ps;
        });

        const updatedProduct = {
          ...storeProduct,
          productSkus: updatedProductSkus,
        };

        queryClient.setQueryData(
          ['stores', 'store', 'product', router.query.pid],
          updatedProduct
        );
      },
      onError: () => {
        // TODO: trigger a notification to announce the error and fallback
        queryClient.setQueryData(
          ['stores', 'store', 'product', router.query.pid],
          storeProduct
        );
      },
      onSettled: () => {
        queryClient.invalidateQueries(['stores']);
      },
    }
  );

  if (!storeId) {
    throw new Error('No store ID provided.');
  }

  return (
    <StoreProductSkusTableStyles>
      <h3>Store Product Skus</h3>
      <div className="skus">
        <div className="sku header">
          <div>Product Sku ID</div>
          <div>Size</div>
          <div>Color</div>
          <div className="text-center">Inventory</div>
          <div className="text-center">Status</div>
          <div className="text-right">Menu</div>
        </div>
        {productSkus.map(s => (
          <div key={s.id} className="sku">
            <div className="sku-id">{s.id}</div>
            <div>{s.size.label}</div>
            <div className="color">
              <Color hex={s.color.hex} />
              {s.color.label}
            </div>
            <div
              className={`text-center ${
                s.inventory && s.inventory < 6 ? ' running-low' : ''
              }`}
            >
              {s.inventory}
            </div>
            <div className="product-status text-center">
              <button
                type="button"
                onClick={() =>
                  updateActiveStatus.mutate({
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
  .skus {
    padding: 0.25rem;
    background-color: #fff;
    box-shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1);
    border-radius: 0.25rem;
  }

  .sku {
    padding: 0.75rem 2rem;
    display: grid;
    grid-template-columns: 1.25fr 0.75fr 0.75fr 12rem 3rem 7rem;
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

  .sku-id {
    font-family: 'Dank Mono', 'Menlo', monospace;
    font-size: 1rem;
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

  .text-center {
    text-align: center;
  }

  .text-right {
    text-align: right;
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
