import React from 'react';
import styled from 'styled-components';

import Layout from '../components/Layout';
import StoresTable from '../components/storesTable/StoresTable';
import TableLoadingSpinner from '../components/TableLoadingSpinner';
import TopPageNav from '../components/TopPageNav';

import useHomepageData from '../hooks/useHomepageData';

export default function Index() {
  const query = useHomepageData();

  return (
    <Layout
      loading={query.isLoading}
      requiresAuth={true}
      title="Dashboard home"
    >
      <IndexStyles>
        {(query.isLoading || query.isFetching) && <TableLoadingSpinner />}
        {query.data && !query.isFetching && (
          <div className="container">
            <TopPageNav />
            <StoresTable
              stores={query.data.stores}
              tableLabel="Dashboard home"
            />
          </div>
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
`;
