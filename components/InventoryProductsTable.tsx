import React from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { useQuery } from 'react-query';
import styled from 'styled-components';
import { format } from 'date-fns';
import { CheckCircleIcon } from '@heroicons/react/20/solid';

import TableLoadingSpinner from './TableLoadingSpinner';
import LoadingSpinner from './LoadingSpinner';
import Pagination from './Pagination';
import PageNavButtons from './PageNavButtons';
import Table from './common/Table';
import InventoryProductTableMenu from './inventoryProduct/InventoryProductTableMenu';
import EditSizeChartModal from './modals/EditSizeChartModal';
import ViewSizeChartModal from './modals/ViewSizeChartModal';
import Notification from './Notification';

import { fetchPaginatedInventoryProducts } from '../queries/inventory-products';

import { InventoryProduct, InventorySku, Size } from '../interfaces';

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
  const [showEditSizeChartModal, setShowEditSizeChartModal] =
    React.useState(false);
  const [showViewSizeChartModal, setShowViewSizeChartModal] =
    React.useState(false);
  const [selectedProduct, setSelectedProduct] =
    React.useState<InventoryProduct>();

  const handleSizeChartClick = ({
    mode,
    inventoryProduct,
  }: {
    mode: 'view' | 'edit';
    inventoryProduct: InventoryProduct;
  }) => {
    if (mode === 'edit') {
      setShowEditSizeChartModal(true);
    } else if (mode === 'view') {
      setShowViewSizeChartModal(true);
    }
    setSelectedProduct(inventoryProduct);
  };

  const closeEditSizeChartModal = () => {
    setShowEditSizeChartModal(false);
    setSelectedProduct(undefined);
  };

  const closeViewSizeChartModal = () => {
    setShowViewSizeChartModal(false);
    setSelectedProduct(undefined);
  };

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
          <PageNavButtons />
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
          <Table id="inventory-products">
            <table>
              <thead>
                <tr>
                  <th>Product Name</th>
                  <th className="text-center">Sizes</th>
                  <th className="text-center">Colors</th>
                  <th className="text-center">Total Skus</th>
                  <th className="text-center">Skus In Stock</th>
                  <th className="text-center">Size Chart</th>
                  <th>Last updated</th>
                  <th />
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
                          <div className="product-name" title={product.name}>
                            <Link
                              href={`/inventory-products/${product.inventoryProductId}`}
                            >
                              <a>{product.name}</a>
                            </Link>
                          </div>
                          <div className="merch-code">
                            {product.merchandiseCode}
                          </div>
                        </td>
                        <td className="text-center">{product.sizes.length}</td>
                        <td className="text-center">{product.colors.length}</td>
                        <td className="text-center">{product.skus.length}</td>
                        <td className="text-center">
                          {getTotalAvailableSkus(product.skus)}
                        </td>
                        <td className="text-center">
                          <div className="has-size-chart">
                            {product.sizeChart?.length ? (
                              <CheckCircleIcon className="check-circle-icon" />
                            ) : (
                              ''
                            )}
                          </div>
                        </td>
                        <td className="product-dates">
                          {format(
                            new Date(product.updatedAt),
                            'MMM. dd, yyyy h:mmaa'
                          )}
                        </td>
                        <td>
                          <InventoryProductTableMenu
                            sizeChart={product.sizeChart}
                            handleSizeChartClick={mode =>
                              handleSizeChartClick({
                                inventoryProduct: product,
                                mode,
                              })
                            }
                          />
                        </td>
                      </tr>
                    ))}
                  </>
                )}
              </tbody>
            </table>
          </Table>
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
      <EditSizeChartModal
        isOpen={showEditSizeChartModal}
        closeModal={closeEditSizeChartModal}
        inventoryProduct={selectedProduct}
      />
      {selectedProduct && (
        <ViewSizeChartModal
          isOpen={showViewSizeChartModal}
          closeModal={closeViewSizeChartModal}
          productName={selectedProduct?.name || ''}
          productSizes={selectedProduct.sizes as Size[]}
          sizeChart={selectedProduct?.sizeChart}
        />
      )}
      <Notification
        query="sizeChart"
        heading="Size chart saved"
        callbackUrl="/inventory-products?page=1"
        durationVisible={3000}
      />
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
    margin: 3.5rem 0 1.5rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .row {
    display: flex;
    justify-content: space-between;
  }

  .link-button {
    padding: 0.625rem 1.25rem;
    display: inline-flex;
    align-items: center;
    font-size: 0.875rem;
    font-weight: 500;
    color: #111827;
    background-color: #fff;
    border: 1px solid #dcdfe4;
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

  .product-name {
    margin: 0 0 0.1875rem;
    max-width: 22rem;
    width: 100%;
    font-size: 0.875rem;
    font-weight: 600;
    color: #000;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .merch-code {
    font-size: 0.875rem;
    font-weight: 500;
    color: #6b7280;
  }

  .has-size-chart {
    .check-circle-icon {
      height: 1.125rem;
      width: 1.125rem;
      color: #047857;
    }
  }
`;
