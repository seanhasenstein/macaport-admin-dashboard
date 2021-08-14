import { useRouter } from 'next/router';
// import { useMutation, useQueryClient } from 'react-query';
import styled from 'styled-components';
import { useSession } from '../../../hooks/useSession';
import BasicLayout from '../../../components/BasicLayout';

export default function UpdateProduct() {
  const [session, sessionLoading] = useSession({ required: true });
  const router = useRouter();

  if (sessionLoading || !session) return <div />;

  return (
    <BasicLayout>
      <UpdateProductStyles>
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
            <h2>Edit product</h2>
          </div>
          <div className="save-buttons">
            <button
              type="button"
              className="primary-button"
              // onClick={() => addProductMutation.mutate(values)}
            >
              Save product
            </button>
          </div>
        </div>
        <div className="main-content">
          <h3>Edit product</h3>
          <p>TODO: Add form here...</p>
        </div>
      </UpdateProductStyles>
    </BasicLayout>
  );
}

const UpdateProductStyles = styled.div`
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
      background-color: #4f46e5;
      color: #fff;
      border: 1px solid transparent;
      cursor: pointer;

      &:hover {
        background-color: #4338ca;
      }
    }
  }

  h2 {
    margin: 0;
    font-size: 1.0625rem;
    font-weight: 500;
    color: #111827;
    line-height: 1;
  }

  h3 {
    margin: 0 0 1.5rem;
    font-weight: 600;
    color: #1f2937;
  }

  h4 {
    margin: 0 0 1.5rem;
    font-size: 1rem;
    font-weight: 600;
    color: #374151;
  }

  p {
    margin: 0 0 2rem;
    font-size: 0.9375rem;
    color: #6b7280;
    line-height: 1.5;
  }

  .main-content {
    padding: 10rem 3rem 3rem;
    position: relative;
  }
`;
