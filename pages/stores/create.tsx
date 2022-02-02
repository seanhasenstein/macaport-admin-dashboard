import React from 'react';
import { useRouter } from 'next/router';
import styled from 'styled-components';
import { Formik, Form } from 'formik';
import { createStoreInitialValues } from '../../utils/storeForm';
import { useSession } from '../../hooks/useSession';
import { useStoresQuery } from '../../hooks/useStoresQuery';
import { useStoreMutations } from '../../hooks/useStoreMutations';
import BasicLayout from '../../components/BasicLayout';
import StoreForm from '../../components/StoreForm';
import LoadingSpinner from '../../components/LoadingSpinner';

export default function CreateStore() {
  const [session, loading] = useSession({ required: true });
  const router = useRouter();
  const storesQuery = useStoresQuery();
  const { createStore } = useStoreMutations({
    stores: storesQuery.data,
  });

  if (loading || !session) return <div />;

  return (
    <BasicLayout title="Create a Store | Macaport Dashboard">
      <CreateStoreStyles>
        <Formik
          initialValues={createStoreInitialValues}
          onSubmit={values => {
            createStore.mutate(values);
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
                  <h2>Create a Store</h2>
                </div>
                <div className="save-buttons">
                  <button
                    type="button"
                    className="primary-button"
                    onClick={() => createStore.mutate(values)}
                  >
                    {createStore.isLoading ? (
                      <LoadingSpinner
                        isLoading={createStore.isLoading}
                        theme="dark"
                      />
                    ) : (
                      'Create store'
                    )}
                  </button>
                </div>
              </div>
              <div className="main-content">
                <div className="form-container">
                  <h3>Create a store form</h3>
                  <StoreForm values={values} setFieldValue={setFieldValue} />
                </div>
              </div>
            </Form>
          )}
        </Formik>
      </CreateStoreStyles>
    </BasicLayout>
  );
}

const CreateStoreStyles = styled.div`
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
      border-radius: 0.3125rem;
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
      position: relative;
      margin: 0;
      display: flex;
      gap: 0.875rem;
    }

    .secondary-button,
    .primary-button {
      padding: 0.5rem 1.125rem;
      display: flex;
      justify-content: center;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.8125rem;
      font-weight: 500;
      border-radius: 0.3125rem;
      cursor: pointer;

      &:focus {
        outline: 2px solid transparent;
        outline-offset: 2px;
      }

      &:focus-visible {
        box-shadow: rgb(255, 255, 255) 0px 0px 0px 2px, #1c44b9 0px 0px 0px 4px,
          rgba(0, 0, 0, 0) 0px 0px 0px 0px;
      }
    }

    .secondary-button {
      background-color: transparent;
      color: #1f2937;
      border: 1px solid #d1d5db;
      box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05);

      &:hover {
        color: #000;
        border-color: #c6cbd2;
        box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.1);

        svg {
          color: #6b7280;
        }
      }

      svg {
        height: 1rem;
        width: 1rem;
        color: #9ca3af;
      }
    }

    .primary-button {
      min-width: 7.25rem;
      display: inline-flex;
      justify-content: center;
      align-items: center;
      background-color: #1f2937;
      color: #f9fafb;
      border: 1px solid transparent;

      svg {
        margin: 0 0.25rem 0 0;
        height: 0.875rem;
        width: 0.875rem;
        color: #4b5563;
      }

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
