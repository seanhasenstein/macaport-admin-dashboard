import React from 'react';
import { useRouter } from 'next/router';
import styled from 'styled-components';
import { useQuery } from 'react-query';
import { fetchPaginatedStores } from '../../queries/stores';
import Layout from '../../components/Layout';
import StoresTable from '../../components/StoresTable';
import TableLoadingSpinner from '../../components/TableLoadingSpinner';
import PageNavigationButtons from '../../components/PageNavigationButtons';
import Pagination from '../../components/Pagination';

export default function Stores() {
  const router = useRouter();
  const [currentPage, setCurrentPage] = React.useState<number>();
  const [pageSize] = React.useState(10);

  const query = useQuery(
    ['stores', currentPage, pageSize],
    () => fetchPaginatedStores(currentPage, pageSize),
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
      router.push('/stores?page=1');
      setCurrentPage(1);
    } else if (!currentPage) {
      setCurrentPage(Number(router.query.page));
    } else if (currentPage && currentPage !== Number(router.query.page)) {
      router.push(`/stores?page=${currentPage}`);
    }
  }, [router.query.page, currentPage]);

  return (
    <Layout title="Stores | Macaport Dashboard">
      <StoresStyles>
        {query.isLoading && <TableLoadingSpinner />}
        {query.data && (
          <div className="container">
            <PageNavigationButtons />
            <div className="header">
              <h2>All stores</h2>
            </div>
            <StoresTable stores={query.data.stores} />
            {currentPage && (
              <Pagination
                currentPage={currentPage}
                setCurrentPage={setCurrentPage}
                pageSize={pageSize}
                count={query.data.count}
              />
            )}
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
