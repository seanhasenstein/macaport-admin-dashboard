import React from 'react';
import styled from 'styled-components';
import { MagnifyingGlassIcon } from '@heroicons/react/20/solid';

import Layout from '../components/Layout';
import PageNavButtons from '../components/PageNavButtons';
import StoresTable from '../components/storesTable/StoresTable';
import TableLoadingSpinner from '../components/TableLoadingSpinner';
import HomepageMenu from '../components/home/HomepageMenu';
import ShippingPriceModal from '../components/home/ShippingPriceModal';

import useShippingDetailsMutation from '../hooks/useShippingDetailsMutation';
import useHomepageData from '../hooks/useHomepageData';
import SearchModal from '../components/modals/SearchModal';

export default function Index() {
  const query = useHomepageData();

  const [showMenu, setShowMenu] = React.useState(false);
  const [showShippingModal, setShowShippingModal] = React.useState(false);
  const [showSearchModal, setShowSearchModal] = React.useState(false);

  const { updateShippingDetails } = useShippingDetailsMutation(query.data);

  const openSearchModal = () => setShowSearchModal(true);
  const closeSearchModal = () => setShowSearchModal(false);

  return (
    <Layout
      loading={query.isLoading}
      requiresAuth={true}
      title="Dashboard home"
    >
      <IndexStyles>
        {(query.isLoading || query.isFetching) && <TableLoadingSpinner />}
        {query.data && !query.isFetching && (
          <>
            <div className="container">
              <div className="homepage-actions">
                <PageNavButtons />
                <div className="order-search">
                  <button
                    type="button"
                    onClick={openSearchModal}
                    className="order-search-modal-button"
                  >
                    <MagnifyingGlassIcon className="magnifying-glass-icon" />
                    Search
                  </button>
                </div>
                <HomepageMenu
                  showMenu={showMenu}
                  setShowMenu={setShowMenu}
                  shipping={query.data.shipping}
                  setShowShippingModal={setShowShippingModal}
                  successfulMutation={updateShippingDetails.isSuccess}
                />
              </div>
              <StoresTable
                stores={query.data.stores}
                tableLabel="Dashboard home"
              />
            </div>
            {showShippingModal ? (
              <ShippingPriceModal
                initialValues={query.data.shipping}
                homepageStores={query.data.stores}
                showModal={showShippingModal}
                setShowModal={setShowShippingModal}
                updateShippingDetails={updateShippingDetails}
                onSuccess={() => {
                  setShowMenu(true);
                }}
              />
            ) : null}
          </>
        )}
      </IndexStyles>
      <SearchModal isOpen={showSearchModal} closeModal={closeSearchModal} />
    </Layout>
  );
}

const IndexStyles = styled.div`
  position: relative;

  .container {
    position: relative;
    margin: 0 auto;
    padding: 3rem 0 6rem;
    max-width: 74rem;
    width: 100%;
  }

  .homepage-actions {
    margin: 0 0 3.5rem;
    display: flex;
    justify-content: space-between;
    gap: 0.75rem;
  }

  .order-search-modal-button {
    padding: 0;
    height: 2.8125rem; // 45px
    width: 9rem;
    display: flex;
    justify-content: center;
    align-items: center;
    background-color: #fff;
    border: 1px solid #e5e7eb;
    border-radius: 0.375rem;
    box-shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1);
    font-size: 0.875rem;
    font-weight: 500;
    color: #111827;
    cursor: pointer;
    letter-spacing: -0.015em;
    transition: all 100ms linear;
    .magnifying-glass-icon {
      margin-right: 0.3125rem;
      height: 1.0625rem;
      width: 1.0625rem;
      color: #9ca3af;
      transition: all 100ms linear;
    }
    &:hover {
      background-color: #eef2f9;
      color: #0e1829;
      border-color: #d1dcef;
      .magnifying-glass-icon {
        color: #7a99d0;
      }
    }
  }
`;
