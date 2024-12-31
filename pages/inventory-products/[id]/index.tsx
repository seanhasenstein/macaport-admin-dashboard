import React from 'react';
import { useRouter } from 'next/router';
import styled from 'styled-components';

import { getQueryParameter } from '../../../utils';

import { useInventoryProductQuery } from '../../../hooks/useInventoryProductQuery';

import Layout from '../../../components/Layout';
import InventoryProductSkus from '../../../components/inventoryProduct/InventoryProductSkus';
import TopPageNav from '../../../components/TopPageNav';
import InventoryModal from '../../../components/inventoryProduct/InventoryModal';
import InventoryProductMenu from '../../../components/inventoryProduct/InventoryProductMenu';
import InventoryProductDetails from '../../../components/inventoryProduct/InventoryProductDetails';
import LoadingSpinner from '../../../components/LoadingSpinner';

export default function InventoryProduct() {
  const router = useRouter();
  const [showInventoryModal, setShowInventoryModal] = React.useState(false);
  const invProdQuery = useInventoryProductQuery(
    getQueryParameter(router.query.id)
  );

  return (
    <Layout title="Inventory Product | Macaport Dashboard" requiresAuth={true}>
      <InventoryProductStyles>
        <div className="container">
          {invProdQuery.isLoading && (
            <LoadingSpinner isLoading={invProdQuery.isLoading} />
          )}
          {invProdQuery.isError && invProdQuery.error instanceof Error && (
            <div>Error: {invProdQuery.error}</div>
          )}
          {invProdQuery.data && (
            <>
              <TopPageNav />
              <div className="header">
                <div>
                  <div className="category">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path d="M7 3a1 1 0 000 2h6a1 1 0 100-2H7zM4 7a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zM2 11a2 2 0 012-2h12a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2v-4z" />
                    </svg>
                    <div>Inventory Product</div>
                  </div>
                  <div>
                    <h2>{invProdQuery.data.name}</h2>
                    <p>{invProdQuery.data.inventoryProductId}</p>
                  </div>
                </div>
                <InventoryProductMenu
                  setShowInventoryModal={setShowInventoryModal}
                />
              </div>
              <div className="main-content">
                <FetchingSpinner isLoading={invProdQuery.isFetching} />
                <InventoryProductDetails inventoryProduct={invProdQuery.data} />
                <InventoryProductSkus
                  productName={invProdQuery.data.name}
                  inventoryProduct={invProdQuery.data}
                  setShowInventoryModal={setShowInventoryModal}
                />
              </div>
            </>
          )}
        </div>
      </InventoryProductStyles>

      {showInventoryModal && invProdQuery.data && (
        <InventoryModal
          product={invProdQuery.data}
          showModal={showInventoryModal}
          setShowModal={setShowInventoryModal}
        />
      )}
    </Layout>
  );
}

const InventoryProductStyles = styled.div`
  position: relative;

  h2 {
    margin: 0;
    font-size: 1.5rem;
    font-weight: 600;
    color: #111827;
  }

  h3 {
    margin: 0 0 1.25rem;
    font-size: 1.25rem;
    font-weight: 600;
    color: #111827;
  }

  h4 {
    margin: 0 0 1rem;
    font-size: 1.125rem;
    font-weight: 600;
    color: #111827;
  }

  .container {
    position: relative;
    margin: 0 auto;
    padding: 3rem 0 0;
    max-width: 74rem;
    width: 100%;
  }

  .header {
    margin: 3.5rem 0 0;
    display: flex;
    justify-content: space-between;
    align-items: center;

    .category {
      margin: 0 0 1rem;
      display: flex;
      align-items: center;
      gap: 0.5rem;
      color: #374151;
      font-size: 0.875rem;
      font-weight: 500;
      text-transform: uppercase;
      letter-spacing: 0.025em;

      svg {
        height: 0.9375rem;
        width: 0.9375rem;
        color: #9ca3af;
      }
    }

    p {
      margin: 0.25rem 0 0;
      font-size: 1rem;
      font-weight: 500;
      color: #6b7280;
    }
  }

  .main-content {
    position: relative;
    padding: 3.5rem 0;
  }
`;

const FetchingSpinner = styled(LoadingSpinner)`
  position: absolute;
  top: 2rem;
  right: 0;
`;
