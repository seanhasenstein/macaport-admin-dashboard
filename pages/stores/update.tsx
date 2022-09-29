import React from 'react';
import { useRouter } from 'next/router';
import styled from 'styled-components';
import { Formik, Form } from 'formik';
import { formatUpdateInitialValues } from '../../utils/storeForm';
import { useStoreQuery } from '../../hooks/useStoreQuery';
import { useStoreMutations } from '../../hooks/useStoreMutations';
import BasicLayout from '../../components/BasicLayout';
import StoreForm from '../../components/store/StoreForm';
import LoadingSpinner from '../../components/LoadingSpinner';

export default function UpdateStore() {
  const router = useRouter();
  const { isLoading, isError, error, data: store } = useStoreQuery();
  const { updateStoreForm } = useStoreMutations({ store });

  return (
    <BasicLayout title="Update Store | Macaport Dashboard" requiresAuth={true}>
      <UpdateStoreStyles>
        {isLoading && <LoadingSpinner isLoading={isLoading} />}
        {isError && error instanceof Error && <div>Error: {error}</div>}
        {store && (
          <Formik
            initialValues={formatUpdateInitialValues(store)}
            enableReinitialize={true}
            onSubmit={values => {
              updateStoreForm.mutate(values);
            }}
          >
            {({ values, setFieldValue }) => (
              <Form>
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
                    <h2>Update Store</h2>
                  </div>
                  <div className="save-buttons">
                    <button type="submit" className="primary-button">
                      {updateStoreForm.isLoading ? (
                        <LoadingSpinner
                          isLoading={updateStoreForm.isLoading}
                          theme="dark"
                        />
                      ) : (
                        'Update Store'
                      )}
                    </button>
                  </div>
                </div>
                <div className="main-content">
                  <div className="form-container">
                    <h3>Update store form</h3>
                    <StoreForm values={values} setFieldValue={setFieldValue} />
                  </div>
                </div>
              </Form>
            )}
          </Formik>
        )}
      </UpdateStoreStyles>
    </BasicLayout>
  );
}

const UpdateStoreStyles = styled.div`
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

    .secondary-button,
    .primary-button {
      padding: 0.5rem 1.125rem;
      font-weight: 500;
      border-radius: 0.3125rem;
      cursor: pointer;
    }

    .secondary-button {
      background-color: #fff;
      border: 1px solid #d1d5db;
      color: #374151;
      box-shadow: rgba(0, 0, 0, 0) 0px 0px 0px 0px,
        rgba(0, 0, 0, 0) 0px 0px 0px 0px, rgba(0, 0, 0, 0.1) 0px 1px 2px 0px,
        rgba(0, 0, 0, 0.02) 0px 1px 1px 0px;

      &:hover {
        background-color: #f9fafb;
        color: #111827;
      }
    }

    .primary-button {
      background-color: #1f2937;
      min-width: 7.75rem;
      display: inline-flex;
      justify-content: center;
      align-items: center;
      color: #fff;
      border: 1px solid transparent;

      &:hover {
        background-color: #263244;
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

  .main-content {
    padding: 10rem 3rem 6rem;
    position: relative;
  }

  .form-container {
    margin: 0 auto;
    width: 32rem;
  }
`;
