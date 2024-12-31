import React from 'react';
import { useQuery } from 'react-query';
import styled from 'styled-components';
import { MagnifyingGlassIcon } from '@heroicons/react/20/solid';

import PageNavButtons from './PageNavButtons';
import ShippingMenu from './ShippingMenu';
import SearchModal from './modals/SearchModal';
import ShippingPriceModal from './modals/ShippingPriceModal';

import useShippingDetailsMutation from '../hooks/useShippingDetailsMutation';
import { fetchShippingData } from '../queries/fetchShippingData';

export default function TopPageNav() {
  const [showMenu, setShowMenu] = React.useState(false);
  const [showSearchModal, setShowSearchModal] = React.useState(false);
  const [showShippingModal, setShowShippingModal] = React.useState(false);

  const {
    data: shippingData,
    // isLoading, todo: handle loading
    // isError, todo: handle error
  } = useQuery(['shipping'], fetchShippingData);

  const { updateShippingDetails } = useShippingDetailsMutation(shippingData);

  const openSearchModal = () => setShowSearchModal(true);
  const closeSearchModal = () => setShowSearchModal(false);

  React.useEffect(() => {
    if (updateShippingDetails.isSuccess) {
      setTimeout(() => {
        updateShippingDetails.reset();
      }, 5000);
    }
  }, [updateShippingDetails]);

  return (
    <>
      <TopPageNavStyles>
        <PageNavButtons />
        <div>
          <button
            type="button"
            onClick={openSearchModal}
            className="search-modal-button"
          >
            <MagnifyingGlassIcon className="magnifying-glass-icon" />
            Search
          </button>
        </div>
        {shippingData ? (
          <ShippingMenu
            showMenu={showMenu}
            setShowMenu={setShowMenu}
            shipping={shippingData}
            setShowShippingModal={setShowShippingModal}
            successfulMutation={updateShippingDetails.isSuccess}
          />
        ) : null}
      </TopPageNavStyles>
      {showShippingModal && shippingData ? (
        <ShippingPriceModal
          initialValues={shippingData}
          showModal={showShippingModal}
          setShowModal={setShowShippingModal}
          updateShippingDetails={updateShippingDetails}
          onSuccess={() => {
            setShowMenu(true);
          }}
        />
      ) : null}
      <SearchModal isOpen={showSearchModal} closeModal={closeSearchModal} />
    </>
  );
}

const TopPageNavStyles = styled.div`
  margin: 0 0 3.5rem;
  display: flex;
  justify-content: space-between;
  gap: 0.75rem;
  position: relative;
  .search-modal-button {
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
