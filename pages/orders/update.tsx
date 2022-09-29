import { useRouter } from 'next/router';
import styled from 'styled-components';
import { useOrderQuery } from '../../hooks/useOrderQuery';
import BasicLayout from '../../components/BasicLayout';

export default function UpdateOrder() {
  const router = useRouter();
  const { isLoading, isError, error, data } = useOrderQuery();

  return (
    <BasicLayout title="Update Order | Macaport Dashboard" requiresAuth={true}>
      <UpdateOrderStyles>
        {isLoading && <div>Loading Order...</div>}
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
        {data?.order && (
          <>
            <div className="title">
              <div>
                <button
                  type="button"
                  className="cancel-link"
                  onClick={() => router.back()}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
                <h2>Edit order</h2>
              </div>
              <div className="save-buttons">
                <button
                  type="button"
                  className="primary-button"
                  // onClick={() => addProductMutation.mutate(values)}
                >
                  Save order
                </button>
              </div>
            </div>
            <div className="main-content">
              <p>TODO: Add this page...</p>
              <pre>{JSON.stringify(data.order, null, 2)}</pre>
            </div>
          </>
        )}
      </UpdateOrderStyles>
    </BasicLayout>
  );
}

const UpdateOrderStyles = styled.div`
  .title {
    padding: 1.5rem 2.5rem;
    position: fixed;
    width: 100%;
    display: flex;
    justify-content: space-between;
    align-items: center;
    background-color: #fff;
    border-bottom: 1px solid #e5e7eb;
    z-index: 100;

    > div {
      display: flex;
      align-items: center;
    }

    .cancel-link {
      padding: 0.375rem;
      display: flex;
      justify-content: center;
      align-items: center;
      background-color: #fff;
      border: none;
      color: #6b7280;
      cursor: pointer;

      &:hover {
        color: #111827;
      }

      svg {
        height: 1.125rem;
        width: 1.125rem;
      }
    }

    h2 {
      margin: 0 0 0 0.75rem;
      padding: 0 0 0 1.125rem;
      border-left: 1px solid #d1d5db;
    }

    .save-buttons {
      margin: 0;
      display: flex;
      gap: 0.875rem;
    }

    .primary-button {
      padding: 0.5rem 1.125rem;
      font-weight: 500;
      border-radius: 0.3125rem;
      background-color: #1c44b9;
      color: #fff;
      border: 1px solid transparent;
      cursor: pointer;

      &:hover {
        background-color: #1955a8;
      }
    }
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
    padding: 10rem 3rem 3rem;
    position: relative;
  }

  .error {
    font-size: 1.125rem;
    font-weight: 500;
    color: #1f2937;
  }
`;
