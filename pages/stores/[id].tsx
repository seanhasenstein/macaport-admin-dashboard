import { useRouter } from 'next/router';
import { useQuery } from 'react-query';
import styled from 'styled-components';
import Layout from '../../components/Layout';
import { Store as StoreInterface } from '../../interfaces';

const StoreStyles = styled.div`
  .title {
    padding: 1.625rem 2.5rem;
    border-bottom: 1px solid #e5e7eb;
  }

  h2 {
    margin: 0;
    font-size: 1.375rem;
    font-weight: 600;
    color: #111827;
  }

  h3 {
    margin: 0 0 1.5rem;
    font-weight: 600;
    color: #1f2937;
  }

  .main-content {
    padding: 3.5rem 3rem;
    position: relative;
  }

  .error {
    font-size: 1.125rem;
    font-weight: 500;
    color: #1f2937;
  }
`;

export default function Store() {
  const router = useRouter();
  const {
    isLoading,
    isError,
    data: store,
    error,
  } = useQuery<StoreInterface>(['store', router.query.id], async () => {
    if (!router.query.id) return;
    const response = await fetch(`/api/stores/${router.query.id}`);
    if (!response.ok) {
      throw new Error('Failed to fetch the store.');
    }
    const data = await response.json();
    return data.store;
  });

  return (
    <Layout>
      <StoreStyles>
        {isLoading && <div>Loading...</div>}
        {isError && error instanceof Error && (
          <>
            <div className="title">
              <div className="details">
                <h2>Store Error!</h2>
              </div>
            </div>
            <div className="main-content">
              <div className="wrapper">
                <div>Error: {error.message}</div>
              </div>
            </div>
          </>
        )}
        {store && (
          <>
            <div className="title">
              <h2>{store.name} Store</h2>
            </div>
            <div className="main-content">
              <pre>{JSON.stringify(store, null, 2)}</pre>
            </div>
          </>
        )}
      </StoreStyles>
    </Layout>
  );
}
