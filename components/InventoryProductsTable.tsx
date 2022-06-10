import React from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { useQuery } from 'react-query';
import styled from 'styled-components';
import { format } from 'date-fns';
import { InventoryProduct, InventorySku } from '../interfaces';
import { fetchPaginatedInventoryProducts } from '../queries/inventory-products';
import TableLoadingSpinner from './TableLoadingSpinner';
import LoadingSpinner from './LoadingSpinner';
import Pagination from './Pagination';
import PageNavigationButtons from './PageNavigationButtons';

interface InventoryProductsQuery {
  inventoryProducts: InventoryProduct[];
  count: number;
}

function getTotalAvailableSkus(skus: InventorySku[]) {
  return skus.reduce(
    (available, currSku) => (currSku.inventory > 0 ? available + 1 : available),
    0
  );
}

export default function InventoryProductsTable() {
  const router = useRouter();
  const pageSize = 10;
  const [currentPage, setCurrentPage] = React.useState<number>();
  const { data, isLoading, isFetching } = useQuery<InventoryProductsQuery>(
    ['inventory-products', currentPage, pageSize],
    () => fetchPaginatedInventoryProducts(currentPage, pageSize),
    {
      staleTime: 1000 * 60 * 10,
      enabled: currentPage ? true : false,
      keepPreviousData: true,
    }
  );

  React.useEffect(() => {
    if (
      router.isReady &&
      (!router.query.page || isNaN(Number(router.query.page)))
    ) {
      router.push('/inventory-products?page=1');
      setCurrentPage(1);
    } else if (!currentPage) {
      setCurrentPage(Number(router.query.page));
    } else if (currentPage && currentPage !== Number(router.query.page)) {
      router.push(`/inventory-products?page=${currentPage}`);
    }
  }, [router.query.page, currentPage]);

  return (
    <InventoryProductsTableStyles>
      {isLoading && <TableLoadingSpinner />}
      {data?.inventoryProducts && (
        <div className="container">
          <PageNavigationButtons />
          <div className="header">
            <div className="row">
              <h2>Inventory Products</h2>
              <LoadingSpinner isLoading={isFetching} />
            </div>
            <Link href="/inventory-products/create">
              <a className="link-button">
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
                Create inventory product
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
                {data.inventoryProducts.length < 1 ? (
                  <tr>
                    <td>There are currently 0 inventory products</td>
                  </tr>
                ) : (
                  <>
                    {data.inventoryProducts.map(product => (
                      <tr key={product._id}>
                        <td>
                          <Link
                            href={`/inventory-products/${product.inventoryProductId}`}
                          >
                            <a>
                              <div
                                className="product-name"
                                title={product.name}
                              >
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
          {currentPage && (
            <Pagination
              currentPage={currentPage}
              setCurrentPage={setCurrentPage}
              pageSize={pageSize}
              count={data.count}
              isFetching={isFetching}
            />
          )}
        </div>
      )}
    </InventoryProductsTableStyles>
  );
}

const InventoryProductsTableStyles = styled.div`
  h2 {
    margin: 0 0.75rem 0 0;
    font-size: 1.25rem;
    font-weight: 600;
    color: #111827;
  }

  .container {
    margin: 0 auto;
    padding: 3rem 0 6rem;
    max-width: 74rem;
    width: 100%;
  }

  .header {
    margin: 0 0 1.5rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .row {
    display: flex;
    justify-content: space-between;
  }

  .link-button {
    padding: 0.5rem 1rem;
    display: inline-flex;
    align-items: center;
    font-size: 0.875rem;
    font-weight: 500;
    color: #111827;
    background-color: #fff;
    border: 1px solid #e5e7eb;
    border-radius: 0.375rem;
    box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05);

    &:hover {
      color: #000;
      border-color: #d1d5db;
    }

    svg {
      margin: 0 0.375rem 0 0;
      height: 0.875rem;
      width: 0.875rem;
    }
  }

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
