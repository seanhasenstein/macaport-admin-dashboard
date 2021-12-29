import React from 'react';
import { useRouter } from 'next/router';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import styled from 'styled-components';
import {
  Formik,
  Form,
  Field,
  FieldArray,
  ErrorMessage,
  FieldArrayRenderProps,
} from 'formik';
import * as Yup from 'yup';
import { useSession } from '../../hooks/useSession';
import { Store, StoreForm } from '../../interfaces';
import {
  createId,
  formatGroups,
  formatGroupTerm,
  months,
  removeNonDigits,
  unitedStates,
} from '../../utils';
import BasicLayout from '../../components/BasicLayout';

const createStoreSchema = Yup.object().shape({
  name: Yup.string().required('A store name is required.'),
  contact: Yup.object({
    email: Yup.string().email('Must be a valid email address'),
    phone: Yup.string()
      .transform(value => {
        return removeNonDigits(value);
      })
      .matches(new RegExp(/^\d{10}$/), 'Phone number must be 10 digits'),
  }),
});

const initialValues: StoreForm = {
  name: '',
  openImmediately: false,
  openDate: {
    month: 'default',
    date: '',
    year: '',
  },
  hasCloseDate: 'true',
  closeDate: {
    month: 'default',
    date: '',
    year: '',
  },
  shippingMethod: 'ship',
  primaryShippingLocation: {
    name: '',
    street: '',
    street2: '',
    city: '',
    state: '',
    zipcode: '',
  },
  allowDirectShipping: 'true',
  contact: {
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
  },
  requireGroupSelection: false,
  groupTerm: '',
  groups: [''],
  redirectTo: 'store',
};

function formatDataForDb(data: StoreForm) {
  let openDate,
    closeDate,
    hasCloseDate,
    category,
    hasPrimaryShippingLocation,
    allowDirectShipping;

  data.openImmediately
    ? (openDate = new Date())
    : (openDate = new Date(
        `${data.openDate.month} ${data.openDate.date} ${data.openDate.year}`
      ));
  data.hasCloseDate === 'true'
    ? (closeDate = new Date(
        `${data.closeDate.month} ${data.closeDate.date} ${data.closeDate.year}`
      ))
    : (closeDate = null);
  data.hasCloseDate === 'true' ? (hasCloseDate = true) : (hasCloseDate = false);
  data.shippingMethod === 'inhouse'
    ? (category = 'macaport')
    : (category = 'client');
  data.shippingMethod === 'ship'
    ? (hasPrimaryShippingLocation = true)
    : (hasPrimaryShippingLocation = false);
  data.allowDirectShipping === 'true'
    ? (allowDirectShipping = true)
    : (allowDirectShipping = false);

  return {
    name: data.name.trim(),
    openDate,
    hasCloseDate,
    closeDate,
    category,
    hasPrimaryShippingLocation,
    primaryShippingLocation: data.primaryShippingLocation,
    allowDirectShipping,
    contact: {
      firstName: data.contact.firstName.trim(),
      lastName: data.contact.lastName.trim(),
      email: data.contact.email.trim().toLowerCase(),
      phone: removeNonDigits(data.contact.phone),
    },
    requireGroupSelection: data.requireGroupSelection,
    groupTerm: formatGroupTerm(data.requireGroupSelection, data.groupTerm),
    groups: formatGroups(data.requireGroupSelection, data.groups),
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

export default function CreateStore() {
  const [session, loading] = useSession({ required: true });
  const router = useRouter();
  const queryClient = useQueryClient();

  const storesQuery = useQuery<Store[]>(
    'stores',
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
    async (store: StoreForm) => {
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
          previousStores,
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
        queryClient.invalidateQueries('stores');
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

  const handleAddGroupClick = async (
    arrayHelpers: FieldArrayRenderProps,
    groupsLength: number
  ) => {
    await arrayHelpers.push('');

    document
      .querySelector<HTMLInputElement>(`#groups\\.${groupsLength}`)
      ?.focus();
  };

  if (loading || !session) return <div />;

  return (
    <BasicLayout title="Create a Store | Macaport Dashboard">
      <CreateStoreStyles>
        <Formik
          initialValues={initialValues}
          validationSchema={createStoreSchema}
          onSubmit={async values => {
            await createStoreMutation.mutate(values);
          }}
        >
          {({ values }) => (
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
                  <Form>
                    <div className="section">
                      <div className="item">
                        <label htmlFor="name">Store Name</label>
                        <Field name="name" id="name" />
                        <ErrorMessage
                          name="name"
                          component="div"
                          className="validation-error"
                        />
                      </div>
                    </div>
                    <div className="section">
                      <h4>Store Open Date</h4>
                      <div className="grid-col-1">
                        <div className="checkbox-item">
                          <Field
                            type="checkbox"
                            name="openImmediately"
                            id="openImmediately"
                          />
                          <label htmlFor="openImmediately">
                            Open this store immediately
                          </label>
                        </div>
                      </div>
                      {!values.openImmediately && (
                        <div className="grid-col-3 open-date-inputs">
                          <div className="item">
                            <label htmlFor="openingMonth">Month</label>
                            <Field
                              as="select"
                              name="openDate.month"
                              id="openingMonth"
                            >
                              <option value="default">Select month</option>
                              {months.map((m, i) => (
                                <option key={i} value={m}>
                                  {m}
                                </option>
                              ))}
                            </Field>
                          </div>
                          <div className="item">
                            <label htmlFor="openDate">Date</label>
                            <Field name="openDate.date" id="openDate" />
                          </div>
                          <div className="item">
                            <label htmlFor="closingYear">Year</label>
                            <Field name="openDate.year" id="openDate.year" />
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="section">
                      <div className="grid-col-1">
                        <div className="radio-group">
                          <h4>Will this store have a time limit?</h4>
                          <div className="radio-item">
                            <Field
                              type="radio"
                              name="hasCloseDate"
                              id="hasAClosingDate"
                              value="true"
                            />
                            <label htmlFor="hasAClosingDate">
                              This store will close
                            </label>
                          </div>
                          <div className="radio-item">
                            <Field
                              type="radio"
                              name="hasCloseDate"
                              id="permanentlyOpen"
                              value="false"
                            />
                            <label htmlFor="permanentlyOpen">
                              This store will be open permanently
                            </label>
                          </div>
                        </div>
                      </div>
                    </div>
                    {values.hasCloseDate === 'true' && (
                      <div className="section">
                        <h4>When will this store close (midnight CT)?</h4>
                        <div className="grid-col-3">
                          <div className="item">
                            <label htmlFor="closingMonth">Month</label>
                            <Field
                              as="select"
                              name="closeDate.month"
                              id="closingMonth"
                            >
                              <option value="default">Select month</option>
                              {months.map((m, i) => (
                                <option key={i} value={m}>
                                  {m}
                                </option>
                              ))}
                            </Field>
                          </div>
                          <div className="item">
                            <label htmlFor="closeDate">Date</label>
                            <Field name="closeDate.date" id="closeDate" />
                          </div>
                          <div className="item">
                            <label htmlFor="closingYear">Year</label>
                            <Field name="closeDate.year" id="closeDate.year" />
                          </div>
                        </div>
                      </div>
                    )}
                    <div className="section">
                      <div className="grid-col-1">
                        <div className="radio-group">
                          <h4>Select a shipping option:</h4>
                          <div className="radio-item">
                            <Field
                              type="radio"
                              name="shippingMethod"
                              id="ship"
                              value="ship"
                            />
                            <label htmlFor="ship">
                              Orders will be shipped to a primary location
                            </label>
                          </div>
                          <div className="radio-item">
                            <Field
                              type="radio"
                              name="shippingMethod"
                              id="noship"
                              value="noship"
                            />
                            <label htmlFor="noship">
                              Orders will NOT be shipped to a primary location
                            </label>
                          </div>
                          <div className="radio-item">
                            <Field
                              type="radio"
                              name="shippingMethod"
                              id="inhouse"
                              value="inhouse"
                            />
                            <label htmlFor="inhouse">
                              This store is for Macaport (in-house/no client)
                            </label>
                          </div>
                        </div>
                      </div>
                    </div>
                    {values.shippingMethod === 'ship' && (
                      <div className="section">
                        <h4>Primary Shipping Location</h4>
                        <div className="item">
                          <label htmlFor="primaryShippingLocation.name">
                            Location Name
                          </label>
                          <Field
                            name="primaryShippingLocation.name"
                            id="primaryShippingLocation.name"
                            placeholder="i.e. New London High School"
                          />
                        </div>
                        <div className="item">
                          <label htmlFor="primaryShippingLocation.street">
                            Street Address
                          </label>
                          <Field
                            name="primaryShippingLocation.street"
                            id="primaryShippingLocation.street"
                          />
                        </div>
                        <div className="item">
                          <label htmlFor="primaryShippingLocation.street2">
                            Street Line 2
                          </label>
                          <Field
                            name="primaryShippingLocation.street2"
                            id="primaryShippingLocation.street2"
                          />
                        </div>
                        <div className="item">
                          <label htmlFor="primaryShippingLocation.city">
                            City
                          </label>
                          <Field
                            name="primaryShippingLocation.city"
                            id="primaryShippingLocation.city"
                          />
                        </div>
                        <div className="grid-col-2">
                          <div className="item">
                            <label htmlFor="primaryShippingLocation.state">
                              State
                            </label>
                            <Field
                              as="select"
                              name="primaryShippingLocation.state"
                              id="primaryShippingLocation.state"
                            >
                              <option value="default">Select state</option>
                              {unitedStates.map((s, i) => (
                                <option key={i} value={s}>
                                  {s}
                                </option>
                              ))}
                            </Field>
                          </div>
                          <div className="item">
                            <label htmlFor="primaryShippingLocation.zipcode">
                              Zipcode
                            </label>
                            <Field
                              name="primaryShippingLocation.zipcode"
                              id="primaryShippingLocation.zipcode"
                            />
                          </div>
                        </div>
                      </div>
                    )}
                    {values.shippingMethod !== 'inhouse' && (
                      <>
                        <div className="section">
                          <div className="grid-col-1">
                            <div className="radio-group">
                              <h4>Direct shipping option:</h4>
                              <div className="radio-item">
                                <Field
                                  type="radio"
                                  name="allowDirectShipping"
                                  id="allowDirectShipping"
                                  value="true"
                                />
                                <label htmlFor="allowDirectShipping">
                                  Allow customers to ship directly to themselves
                                </label>
                              </div>
                              <div className="radio-item">
                                <Field
                                  type="radio"
                                  name="allowDirectShipping"
                                  id="noDirectShipping"
                                  value="false"
                                />
                                <label htmlFor="noDirectShipping">
                                  No, all orders will be sent to the primary
                                  location
                                </label>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="section">
                          <h3>Store Contact Person</h3>
                          <div className="grid-col-2">
                            <div className="item">
                              <label htmlFor="contact.firstName">
                                First Name
                              </label>
                              <Field
                                name="contact.firstName"
                                id="contact.firstName"
                              />
                            </div>
                            <div className="item">
                              <label htmlFor="contact.lastName">
                                Last Name
                              </label>
                              <Field
                                name="contact.lastName"
                                id="contact.lastName"
                              />
                            </div>
                          </div>
                          <div className="item">
                            <label htmlFor="contact.email">Email Address</label>
                            <Field name="contact.email" id="contact.email" />
                            <ErrorMessage
                              name="contact.email"
                              component="div"
                              className="validation-error"
                            />
                          </div>
                          <div className="item">
                            <label htmlFor="contact.phone">Phone Number</label>
                            <Field name="contact.phone" id="contact.phone" />
                            <ErrorMessage
                              name="contact.phone"
                              component="div"
                              className="validation-error"
                            />
                          </div>
                        </div>
                        <div className="section">
                          <div className="item">
                            <h3>Group selection at checkout</h3>
                            <div className="checkbox-item">
                              <Field
                                type="checkbox"
                                name="requireGroupSelection"
                                id="requireGroupSelection"
                              />
                              <label htmlFor="requireGroupSelection">
                                Require customers to select a group at checkout
                              </label>
                            </div>
                          </div>
                          {values.requireGroupSelection && (
                            <>
                              <div className="item">
                                <label htmlFor="groupTerm">
                                  Group term (team, organization, category,
                                  etc.)
                                </label>
                                <Field name="groupTerm" id="groupTerm" />
                              </div>
                              <div className="item">
                                <label htmlFor="groups">Groups</label>
                                <FieldArray
                                  name="groups"
                                  render={arrayHelpers => (
                                    <>
                                      <div className="group-items">
                                        {values.groups.length > 0 &&
                                          values.groups.map((g, i) => (
                                            <div key={i} className="group-item">
                                              <Field
                                                name={`groups.${i}`}
                                                id={`groups.${i}`}
                                              />
                                              <button
                                                type="button"
                                                onClick={() =>
                                                  arrayHelpers.remove(i)
                                                }
                                                className="remove-group-button"
                                              >
                                                <span className="sr-only">
                                                  Remove
                                                </span>
                                                <svg
                                                  xmlns="http://www.w3.org/2000/svg"
                                                  viewBox="0 0 20 20"
                                                  fill="currentColor"
                                                >
                                                  <path
                                                    fillRule="evenodd"
                                                    d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                                                    clipRule="evenodd"
                                                  />
                                                </svg>
                                              </button>
                                            </div>
                                          ))}
                                      </div>
                                      {values.groups.length > 0 ? (
                                        <div className="add-row">
                                          <button
                                            type="button"
                                            onClick={() =>
                                              handleAddGroupClick(
                                                arrayHelpers,
                                                values.groups.length
                                              )
                                            }
                                            className="add-group-button"
                                          >
                                            <span>Add another group</span>
                                          </button>
                                        </div>
                                      ) : (
                                        <button
                                          type="button"
                                          onClick={() =>
                                            handleAddGroupClick(
                                              arrayHelpers,
                                              values.groups.length
                                            )
                                          }
                                          className="add-group-button"
                                        >
                                          Add a group
                                        </button>
                                      )}
                                    </>
                                  )}
                                />
                              </div>
                            </>
                          )}
                        </div>
                      </>
                    )}
                  </Form>
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
      background-color: #4f46e5;
      color: #fff;
      border: 1px solid transparent;

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
    padding: 10rem 3rem 6rem;
    position: relative;
  }

  .form-container {
    margin: 0 auto;
    width: 32rem;
  }

  .section {
    margin: 3rem 0 0;
  }

  .grid-col-1 {
    display: grid;
    grid-template-columns: 1fr;
    gap: 1rem;
  }

  .grid-col-2 {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(11rem, 1fr));
    gap: 1rem;
  }

  .grid-col-3 {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(5rem, 1fr));
    gap: 1rem;
  }

  .open-date-inputs {
    margin: 0.75rem 0 0;
  }

  .item {
    margin: 0 0 1.5rem;
    display: flex;
    flex-direction: column;
  }

  .radio-item,
  .checkbox-item {
    margin: 0 0 1rem;
    display: flex;
    align-items: center;

    input {
      margin: 0 0.75rem 0 0;
    }

    label {
      margin: 0;
    }
  }

  .group-items {
    background-color: #fff;
    border-radius: 0.375rem;
    box-shadow: rgba(0, 0, 0, 0) 0px 0px 0px 0px,
      rgba(0, 0, 0, 0) 0px 0px 0px 0px, rgba(0, 0, 0, 0.05) 0px 1px 2px 0px;
  }

  .group-item {
    margin: -1px 0 0;
    position: relative;

    &:first-of-type input {
      border-top-left-radius: 0.375rem;
      border-top-right-radius: 0.375rem;
    }

    &:last-of-type input {
      border-bottom-left-radius: 0.375rem;
      border-bottom-right-radius: 0.375rem;
    }

    input {
      position: relative;
      width: 100%;
      background-color: transparent;
      border: 1px solid #d1d5db;
      box-shadow: none;
      border-radius: 0;

      &:focus {
        z-index: 100;
      }
    }
  }

  .remove-group-button {
    position: absolute;
    top: 0;
    right: 0;
    padding: 0.875rem 1rem;
    display: inline-flex;
    justify-content: center;
    align-items: center;
    background-color: transparent;
    border: none;
    cursor: pointer;
    color: #6b7280;
    z-index: 200;

    svg {
      height: 0.8125rem;
      width: 0.8125rem;
    }

    &:hover {
      color: #111827;
    }
  }

  .add-row {
    display: flex;
    justify-content: flex-end;
  }

  .add-group-button {
    margin: 1rem 0 0;
    padding: 0.5rem 0.75rem;
    display: inline-flex;
    justify-content: center;
    align-items: center;
    color: #475569;
    font-size: 0.875rem;
    font-weight: 500;
    text-align: center;
    line-height: 1;
    background-color: #e2e8f0;
    border: 1px solid #cbd5e1;
    border-radius: 0.3125rem;
    box-shadow: inset 0 1px 1px #fff, 0 1px 2px 0 rgb(0 0 0 / 0.05);
    cursor: pointer;

    &:hover {
      border-color: #bfcbda;
      box-shadow: inset 0 1px 1px #fff, 0 1px 2px 0 rgb(0 0 0 / 0.1);
    }

    &:focus {
      outline: 2px solid transparent;
      outline-offset: 2px;
    }

    &:focus-visible {
      box-shadow: rgb(255, 255, 255) 0px 0px 0px 2px,
        rgb(99, 102, 241) 0px 0px 0px 4px, rgba(0, 0, 0, 0) 0px 0px 0px 0px;
    }
  }

  .validation-error {
    margin: 0.25rem 0 0;
    font-size: 0.75rem;
    font-weight: 500;
    color: #b91c1c;
  }
`;
