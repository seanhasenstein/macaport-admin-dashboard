import React from 'react';
import Link from 'next/link';
import { useQuery } from 'react-query';
import styled from 'styled-components';
import { format } from 'date-fns';
import { InventoryProduct, InventorySku } from '../interfaces';
import LoadingSpinner from './LoadingSpinner';

function getTotalAvailableSkus(skus: InventorySku[]) {
  return skus.reduce(
    (available, currSku) => (currSku.inventory > 0 ? available + 1 : available),
    0
  );
}

export default function InventoryProductTable() {
  const {
    isLoading,
    isFetching,
    isError,
    error,
    data: inventoryProducts,
  } = useQuery<InventoryProduct[]>(
    ['inventory-products'],
    async () => {
      const response = await fetch('/api/inventory-products/');

      if (!response.ok) {
        throw new Error('Failed to fetch the inventory products.');
      }

      const data = await response.json();
      return data.inventoryProducts;
    },
    { staleTime: 1000 * 60 * 10 }
  );

  return (
    <InventoryProductStyles>
      {isLoading && (
        <InventoryProductLoadingSpinner isLoading={isLoading || isFetching} />
      )}
      {isError && error instanceof Error && <div>Error: {error.message}</div>}
      {inventoryProducts && (
        <div className="container">
          <div className="header-row">
            <h2>Inventory Products</h2>
            <Link href={`/inventory-products/create`}>
              <a className="create-product-link">
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
                Create an inventory product
              </a>
            </Link>
          </div>
          <div className="table-container" id="inventory-products">
            <table>
              <thead>
                <tr>
                  <th>Product Name</th>
                  <th>Code</th>
                  <th className="text-center">Sizes</th>
                  <th className="text-center">Colors</th>
                  <th className="text-center">Total Skus</th>
                  <th className="text-center">Skus In Stock</th>
                  <th>Last updated</th>
                </tr>
              </thead>
              <tbody>
                {inventoryProducts.length < 1 ? (
                  <tr>
                    <td>There are currently no inventory products</td>
                  </tr>
                ) : (
                  <>
                    {inventoryProducts.map(product => (
                      <tr key={product._id}>
                        <td>
                          <Link
                            href={`/inventory-products/${product.inventoryProductId}`}
                          >
                            <a>
                              <div className="product-name">{product.name}</div>
                              <div className="product-id">
                                {product.inventoryProductId}
                              </div>
                            </a>
                          </Link>
                        </td>
                        <td>{product.merchandiseCode}</td>
                        <td className="text-center">{product.sizes.length}</td>
                        <td className="text-center">{product.colors.length}</td>
                        <td className="text-center">{product.skus.length}</td>
                        <td className="text-center">
                          {getTotalAvailableSkus(product.skus)}
                        </td>
                        <td className="product-dates">
                          {format(
                            new Date(product.updatedAt),
                            'MMM. dd, yyyy h:mmaa'
                          )}
                        </td>
                      </tr>
                    ))}
                  </>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </InventoryProductStyles>
  );
}

const InventoryProductStyles = styled.div`
  position: relative;

  h2 {
    margin: 0;
    font-size: 1.375rem;
    font-weight: 600;
    color: #111827;
  }

  .container {
    margin: 0 auto;
    padding: 5rem 2rem;
    max-width: 75rem;
    width: 100%;
  }

  .header-row {
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
  }

  .create-product-link {
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
      box-shadow: rgb(255, 255, 255) 0px 0px 0px 2px, #1c5eb9 0px 0px 0px 4px,
        rgba(0, 0, 0, 0) 0px 0px 0px 0px;
    }
  }

  .table-container {
    margin: 2rem 0 0;
    width: 100%;
    background-color: #fff;
    border-width: 1px 1px 0 1px;
    border-style: solid;
    border-color: #e5e7eb;
    border-radius: 0.25rem;
    box-shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1);
  }

  table {
    width: 100%;
    border-collapse: collapse;
  }

  th,
  td {
    border-bottom: 1px solid #e5e7eb;

    &:first-of-type {
      padding-left: 1.75rem;
    }

    &:last-of-type {
      padding-right: 1.75rem;
    }

    &.text-center {
      text-align: center;
    }
  }

  tr:last-of-type td {
    border-bottom: none;
  }

  th {
    padding: 1rem;
    background-color: #f3f4f6;
    font-size: 0.75rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.0375em;
    color: #4b5563;
    text-align: left;
  }

  tr {
    &:first-of-type {
      th:first-of-type {
        border-radius: 0.25rem 0 0 0;
      }
      th:last-of-type {
        border-radius: 0 0.25rem 0 0;
      }
    }
  }

  td {
    padding: 1rem 1rem;
    font-size: 0.875rem;
    font-weight: 500;
    color: #111827;

    a {
      &:hover .product-name {
        text-decoration: underline;
      }

      &:focus {
        outline: 2px solid transparent;
        outline-offset: 2px;
      }

      &:focus-visible .product-name {
        text-decoration: underline;
        color: #1c5eb9;
      }
    }

    .product-name {
      margin: 0 0 0.1875rem;
      font-size: 0.9375rem;
      font-weight: 500;
      color: #000;
    }

    .product-id {
      font-family: 'Dank Mono', 'Menlo', monospace;
      font-size: 0.875rem;
      font-weight: 700;
      color: #6b7280;
    }
  }
`;

const InventoryProductLoadingSpinner = styled(LoadingSpinner)`
  position: absolute;
  top: 2rem;
  right: 2rem;
`;
