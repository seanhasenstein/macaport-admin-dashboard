import Link from 'next/link';
import { useQuery } from 'react-query';
import styled from 'styled-components';
import { InventoryProduct } from '../../interfaces';
import { fetchInventoryProducts } from '../../queries/inventory-producs';
import Layout from '../../components/Layout';
import InventoryProductsTable from '../../components/InventoryProductsTable';
import TableLoadingSpinner from '../../components/TableLoadingSpinner';

export default function InventoryProducts() {
  const { data, isLoading } = useQuery<InventoryProduct[]>(
    ['inventory-products'],
    fetchInventoryProducts,
    { staleTime: 1000 * 60 * 10 }
  );

  return (
    <Layout title="Inventory Products | Macaport Dashboard">
      <InventoryProductsStyles>
        {isLoading && <TableLoadingSpinner />}
        {data && (
          <div className="container">
            <div className="header">
              <h2>Inventory Products</h2>
              <Link href={`/inventory-products/create`}>
                <a className="create-link">
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
            <InventoryProductsTable inventoryProducts={data} />
          </div>
        )}
      </InventoryProductsStyles>
    </Layout>
  );
}

const InventoryProductsStyles = styled.div`
  h2 {
    margin: 0;
    font-size: 1.25rem;
    font-weight: 600;
    color: #111827;
  }

  .container {
    margin: 0 auto;
    padding: 5rem 0;
    max-width: 74rem;
    width: 100%;
  }

  .header {
    margin: 0 0 1.5rem;
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
  }

  .create-link {
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
      box-shadow: rgb(255, 255, 255) 0px 0px 0px 2px, #1c44b9 0px 0px 0px 4px,
        rgba(0, 0, 0, 0) 0px 0px 0px 0px;
    }
  }
`;
