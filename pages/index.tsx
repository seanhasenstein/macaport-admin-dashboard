import React from 'react';
import styled from 'styled-components';
import useHomepageData from '../hooks/useHomepageData';
import Layout from '../components/Layout';
import PageNavButtons from '../components/PageNavButtons';
import StoresTable from '../components/storesTable/StoresTable';
import TableLoadingSpinner from '../components/TableLoadingSpinner';
import HomepageMenu from '../components/home/HomepageMenu';
import ShippingPriceModal from '../components/home/ShippingPriceModal';

export default function Index() {
  const query = useHomepageData();
  const [showShippingModal, setShowShippingModal] = React.useState(false);

  return (
    <Layout
      loading={query.isLoading}
      requiresAuth={true}
      title="Dashboard home"
    >
      <IndexStyles>
        {query.isLoading && <TableLoadingSpinner />}
        {query.data && (
          <>
            <div className="container">
              <div className="homepage-actions">
                <PageNavButtons />
                <HomepageMenu
                  shipping={query.data.shipping}
                  setShowShippingModal={setShowShippingModal}
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
                showModal={showShippingModal}
                setShowModal={setShowShippingModal}
              />
            ) : null}
          </>
        )}
      </IndexStyles>
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
    gap: 2rem;
  }
`;
