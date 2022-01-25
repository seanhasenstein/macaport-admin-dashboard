import React from 'react';
import { useRouter } from 'next/router';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import styled from 'styled-components';
import { Formik } from 'formik';
import { useSession } from '../../hooks/useSession';
import { Store, StoreForm as StoreFormInterface } from '../../interfaces';
import { createId } from '../../utils';
import {
  createStoreInitialValues,
  formatDataForDb,
} from '../../utils/storeForm';
import BasicLayout from '../../components/BasicLayout';
import StoreForm from '../../components/StoreForm';

export default function CreateStore() {
  const [session, loading] = useSession({ required: true });
  const router = useRouter();
  const queryClient = useQueryClient();

  const storesQuery = useQuery<Store[]>(
    ['stores'],
    async () => {
      const response = await fetch('/api/stores');

      if (!response.ok) {
        throw new Error('Failed to fetch the stores.');
      }

      const data = await response.json();
      return data.stores;
    },
    {
      initialData: () => {
        return queryClient.getQueryData(['stores']);
      },
      initialDataUpdatedAt: () => {
        return queryClient.getQueryState(['stores'])?.dataUpdatedAt;
      },
      staleTime: 1000 * 60 * 10,
    }
  );

  const createStoreMutation = useMutation(
    async (store: StoreFormInterface) => {
      const response = await fetch(`/api/stores/create`, {
        method: 'POST',
        body: JSON.stringify(formatDataForDb(store)),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to create the store.');
      }

      const data = await response.json();
      return data.store;
    },
    {
      onMutate: async newStore => {
        await queryClient.cancelQueries(['stores']);
        const formattedNewStore = formatDataForDb(newStore);
        const previousStores = storesQuery.data || [];
        const stores = [
          ...previousStores,
          { ...formattedNewStore, _id: createId() },
        ];
        queryClient.setQueryData(['stores'], stores);
        return { previousStores, newStore };
      },
      onError: () => {
        // TODO: trigger a notification
        queryClient.setQueryData(['stores'], storesQuery.data);
      },
      onSettled: () => {
        queryClient.invalidateQueries(['stores']);
      },
      onSuccess: (data, variables) => {
        const route =
          variables.redirectTo === 'add_product'
            ? `/stores/${data._id}/product/add?createStore=true`
            : `/stores/${data._id}?createStore=true`;
        router.push(route);
      },
    }
  );

  if (loading || !session) return <div />;

  return (
    <BasicLayout title="Create a Store | Macaport Dashboard">
      <CreateStoreStyles>
        <Formik
          initialValues={createStoreInitialValues}
          onSubmit={async values => {
            await createStoreMutation.mutate(values);
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
                  <h2>Create a Store</h2>
                </div>
                <div className="save-buttons">
                  <button
                    type="button"
                    className="secondary-button"
                    onClick={() =>
                      createStoreMutation.mutate({
                        ...values,
                        redirectTo: 'add_product',
                      })
                    }
                  >
                    Create and add products
                  </button>
                  <button
                    type="button"
                    className="primary-button"
                    onClick={() => createStoreMutation.mutate(values)}
                  >
                    Create store
                  </button>
                </div>
              </div>
              <div className="main-content">
                <div className="form-container">
                  <h3>Create a store form</h3>
                  <StoreForm values={values} setFieldValue={setFieldValue} />
                </div>
              </div>
            </>
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

      &:focus {
        outline: 2px solid transparent;
        outline-offset: 2px;
      }

      &:focus-visible {
        box-shadow: rgb(255, 255, 255) 0px 0px 0px 2px, #1c5eb9 0px 0px 0px 4px,
          rgba(0, 0, 0, 0) 0px 0px 0px 0px;
      }
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
