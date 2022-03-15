import React from 'react';
import Link from 'next/link';
import styled from 'styled-components';
import { format } from 'date-fns';
import { InventoryProduct, InventorySku } from '../interfaces';

function getTotalAvailableSkus(skus: InventorySku[]) {
  return skus.reduce(
    (available, currSku) => (currSku.inventory > 0 ? available + 1 : available),
    0
  );
}

type Props = {
  inventoryProducts: InventoryProduct[];
};

export default function InventoryProductsTable({ inventoryProducts }: Props) {
  return (
    <InventoryProductsTableStyles>
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
                <td>There are currently 0 inventory products</td>
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
                          <div className="product-name" title={product.name}>
                            {product.name}
                          </div>
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
    </InventoryProductsTableStyles>
  );
}

const InventoryProductsTableStyles = styled.div`
  .table-container {
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
    color: #374151;

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
        color: #1c44b9;
      }
    }

    .product-name {
      margin: 0 0 0.1875rem;
      max-width: 22rem;
      width: 100%;
      font-size: 0.875rem;
      font-weight: 500;
      color: #000;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .product-id {
      font-family: 'Dank Mono', 'Menlo', monospace;
      font-size: 0.875rem;
      font-weight: 700;
      color: #6b7280;
    }
  }
`;
