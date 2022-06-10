import { useSession } from '../hooks/useSession';
import { useQuery, useQueryClient } from 'react-query';
import styled from 'styled-components';
import { fetchHomepageStores } from '../queries/stores';
import Layout from '../components/Layout';
import PageNavigationButtons from '../components/PageNavigationButtons';
import StoresTable from '../components/StoresTable';
import TableLoadingSpinner from '../components/TableLoadingSpinner';

export default function Index() {
  const queryClient = useQueryClient();
  const [session, loading] = useSession({ required: true });
  const query = useQuery(['stores', 'homepage'], fetchHomepageStores, {
    onSuccess: data => {
      data.forEach(store => {
        queryClient.setQueryData(['stores', 'store', store._id], store);
      });
    },
    staleTime: 1000 * 60 * 10,
  });

  if (loading || !session)
    return <div className="sr-only">Verifying authentication</div>;

  return (
    <Layout title="Macaport Dashboard Home">
      <IndexStyles>
        {query.isLoading && <TableLoadingSpinner />}
        {query.data && (
          <div className="container">
            <PageNavigationButtons />
            <div className="header">
              <h2>Dashboard home</h2>
            </div>
            <StoresTable stores={query.data} />
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

  .header {
    margin: 0 0 1.5rem;
  }

  h2 {
    margin: 0;
    font-size: 1.25rem;
    font-weight: 600;
    color: #111827;
  }
`;
