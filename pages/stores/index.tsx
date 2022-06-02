import styled from 'styled-components';
import { useQuery } from 'react-query';
import { fetchAllStores } from '../../queries/stores';
import Layout from '../../components/Layout';
import StoresTable from '../../components/StoresTable';
import TableLoadingSpinner from '../../components/TableLoadingSpinner';
import PageNavigationButtons from '../../components/PageNavigationButtons';

export default function Stores() {
  const query = useQuery(['stores'], fetchAllStores, {
    staleTime: 1000 * 60 * 10,
  });

  return (
    <Layout title="Stores | Macaport Dashboard">
      <StoresStyles>
        {query.isLoading && <TableLoadingSpinner />}
        {query.data && (
          <div className="container">
            <PageNavigationButtons />
            <div className="section">
              <div className="header">
                <h2>All stores</h2>
              </div>
              <StoresTable stores={query.data} />
            </div>
          </div>
        )}
      </StoresStyles>
    </Layout>
  );
}

const StoresStyles = styled.div`
  .container {
    margin: 0 auto;
    padding: 3rem 0 6rem;
    max-width: 74rem;
    width: 100%;
  }

  .header {
    margin: 0 0 1.25rem;
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
  }

  h2 {
    margin: 0;
    font-size: 1.25rem;
    font-weight: 600;
    color: #111827;
  }
`;
