import React from 'react';
import { useRouter } from 'next/router';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import styled from 'styled-components';
import { Formik } from 'formik';
import { useSession } from '../../hooks/useSession';
import { Store, StoreForm as StoreFormInterface } from '../../interfaces';
import {
  formatDataForDb,
  formatUpdateInitialValues,
} from '../../utils/storeForm';
import BasicLayout from '../../components/BasicLayout';
import StoreForm from '../../components/StoreForm';
import LoadingSpinner from '../../components/LoadingSpinner';

export default function UpdateStore() {
  const [session, loading] = useSession({ required: true });
  const router = useRouter();
  const queryClient = useQueryClient();

  const {
    isLoading,
    isError,
    data: store,
    error,
  } = useQuery<Store>(
    ['stores', 'store', router.query.id],
    async () => {
      if (!router.query.id) return;
      const response = await fetch(`/api/stores/${router.query.id}`);

      if (!response.ok) {
        throw new Error('Failed to fetch the store.');
      }

      const data = await response.json();
      return data.store;
    },
    {
      initialData: () => {
        return queryClient
          .getQueryData<Store[]>('stores')
          ?.find(s => s._id === router.query.id);
      },
      initialDataUpdatedAt: () =>
        queryClient.getQueryState('stores')?.dataUpdatedAt,
      staleTime: 600000,
    }
  );

  const updateStoreMutation = useMutation(
    async (store: StoreFormInterface) => {
      const response = await fetch(`/api/stores/update?id=${router.query.id}`, {
        method: 'POST',
        body: JSON.stringify(formatDataForDb(store)),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to update the store.');
      }

      const data = await response.json();
      return data.store;
    },
    {
      onMutate: async updatedStore => {
        await queryClient.cancelQueries(['stores', 'store', router.query.id]);
        queryClient.setQueryData(['stores', 'store', router.query.id], {
          ...formatDataForDb(updatedStore),
          _id: store?._id,
        });
        return { previousStore: store, updatedStore };
      },
      onError: () => {
        // TODO: trigger a notification
        queryClient.setQueryData(['stores', 'store', router.query.id], store);
      },
      onSettled: () => {
        queryClient.invalidateQueries(['stores']);
      },
      onSuccess: data => {
        router.push(`/stores/${data._id}?updateStore=true`);
      },
    }
  );

  if (loading || !session) return <div />;

  return (
    <BasicLayout title="Update Store | Macaport Dashboard">
      <UpdateStoreStyles>
        {isLoading && <LoadingSpinner isLoading={isLoading} />}
        {isError && error instanceof Error && <div>Error: {error}</div>}
        {store && (
          <Formik
            initialValues={formatUpdateInitialValues(store)}
            enableReinitialize={true}
            onSubmit={async values => {
              await updateStoreMutation.mutate(values);
            }}
          >
            {({ values, setFieldValue }) => (
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
                    <h2>Update Store</h2>
                  </div>
                  <div className="save-buttons">
                    <button
                      type="button"
                      className="primary-button"
                      onClick={() => updateStoreMutation.mutate(values)}
                    >
                      Save store
                    </button>
                  </div>
                </div>
                <div className="main-content">
                  <div className="form-container">
                    <h3>Update store form</h3>
                    <StoreForm values={values} setFieldValue={setFieldValue} />
                  </div>
                </div>
              </>
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
      background-color: #1c5eb9;
      color: #fff;
      border: 1px solid transparent;

      &:hover {
        background-color: #1955a8;
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
