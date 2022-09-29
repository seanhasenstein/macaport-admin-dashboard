import styled from 'styled-components';
import useHomeStoresQuery from '../hooks/useHomeStoresQuery';
import Layout from '../components/Layout';
import PageNavButtons from '../components/PageNavButtons';
import StoresTable from '../components/storesTable/StoresTable';
import TableLoadingSpinner from '../components/TableLoadingSpinner';

export default function Index() {
  const query = useHomeStoresQuery();

  return (
    <Layout
      loading={query.isLoading}
      requiresAuth={true}
      title="Dashboard home"
    >
      <IndexStyles>
        {query.isLoading && <TableLoadingSpinner />}
        {query.data && (
          <div className="container">
            <PageNavButtons />
            <StoresTable stores={query.data} tableLabel="Dashboard home" />
          </div>
        )}
      </IndexStyles>
    </Layout>
  );
}

const IndexStyles = styled.div`
  position: relative;

  .container {
    margin: 0 auto;
    padding: 3rem 0 6rem;
    max-width: 74rem;
    width: 100%;
  }
`;
