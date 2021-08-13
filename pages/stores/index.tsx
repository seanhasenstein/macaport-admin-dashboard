import { useQuery } from 'react-query';
import Link from 'next/link';
import styled from 'styled-components';
import { useSession } from '../../hooks/useSession';
import { Store } from '../../interfaces';
import Layout from '../../components/Layout';
import StoresTable from '../../components/StoresTable';

export default function Stores() {
  const [session, loading] = useSession({ required: true });
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

  if (loading || !session) return <div />;

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
              <Link href="/stores/create">
                <a className="create-store-link">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Create a store
                </a>
              </Link>
            </div>
            <div className="main-content">
              <h3>This page is currently identical to the homepage</h3>
              <StoresTable />
            </div>
          </>
        )}
      </StoresStyles>
    </Layout>
  );
}

const StoresStyles = styled.div`
  .title {
    padding: 1.625rem 2.5rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
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

  .create-store-link {
    padding: 0.625rem 1.25rem;
    display: flex;
    align-items: center;
    border: 1px solid #e5e7eb;
    border-radius: 0.375rem;
    font-size: 0.875rem;
    font-weight: 500;
    color: #4b5563;
    line-height: 1;
    box-shadow: rgba(0, 0, 0, 0) 0px 0px 0px 0px,
      rgba(0, 0, 0, 0) 0px 0px 0px 0px, rgba(0, 0, 0, 0.05) 0px 1px 2px 0px;

    &:hover {
      color: #111827;
      border-color: #d1d5db;
    }

    &:focus {
      outline: 2px solid transparent;
      outline-offset: 2px;
      box-shadow: rgb(255, 255, 255) 0px 0px 0px 2px, #4f46e5 0px 0px 0px 4px,
        rgba(0, 0, 0, 0.05) 0px 1px 2px 0px;
    }

    svg {
      margin: 0 0.375rem 0 0;
      width: 1.25rem;
      height: 1.25rem;
      color: #9ca3af;
    }
  }

  .main-content {
    padding: 2rem 3rem;
    position: relative;
  }

  .error {
    font-size: 1.125rem;
    font-weight: 500;
    color: #1f2937;
  }
`;
