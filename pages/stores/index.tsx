import { useQuery } from 'react-query';
import styled from 'styled-components';
import Layout from '../../components/Layout';
import { Store } from '../../interfaces';

const StoresStyles = styled.div`
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

export default function Stores() {
  const {
    isLoading,
    isError,
    data: stores,
    error,
  } = useQuery<Store[]>('stores', async () => {
    const response = await fetch('/api/stores');
    if (!response.ok) {
      throw new Error('Failed to fetch the stores.');
    }
    const data = await response.json();
    return data.stores;
  });

  return (
    <Layout>
      <StoresStyles>
        {isLoading && <div>Loading...</div>}
        {isError && error instanceof Error && (
          <>
            <div className="title">
              <div className="details">
                <h2>Order Error!</h2>
              </div>
            </div>
            <div className="main-content">
              <div className="wrapper">
                <div>Error: {error.message}</div>
              </div>
            </div>
          </>
        )}
        {stores && (
          <>
            <div className="title">
              <h2>Stores</h2>
            </div>
            <div className="main-content">
              <pre>{JSON.stringify(stores, null, 2)}</pre>
            </div>
          </>
        )}
      </StoresStyles>
    </Layout>
  );
}
