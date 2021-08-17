import { useRouter } from 'next/router';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import styled from 'styled-components';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { useSession } from '../../hooks/useSession';
import { Store, StoreForm } from '../../interfaces';
import { unitedStates, months, removeNonDigits } from '../../utils';
import BasicLayout from '../../components/BasicLayout';

const updateStoreSchema = Yup.object().shape({
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

function formatInitialValues(store: Store): StoreForm {
  const dbOpenDate = new Date(store.openDate);
  const dbCloseDate =
    store.hasCloseDate && store.closeDate
      ? new Date(store.closeDate)
      : undefined;
  const closeDate =
    store.hasCloseDate && dbCloseDate
      ? {
          month: months[dbCloseDate.getMonth()],
          date: dbCloseDate.getDate().toString(),
          year: dbCloseDate.getFullYear().toString(),
        }
      : { month: '', date: '', year: '' };
  const shippingMethod =
    store.category === 'macaport'
      ? 'inhouse'
      : store.hasPrimaryShippingLocation
      ? 'ship'
      : 'noship';
  const { name, street, street2, city, state, zipcode } =
    store.primaryShippingLocation;
  const { firstName, lastName, email, phone } = store.contact;

  return {
    name: store.name,
    openImmediately: false,
    openDate: {
      month: months[dbOpenDate.getMonth()],
      date: dbOpenDate.getDate().toString(),
      year: dbOpenDate.getFullYear().toString(),
    },
    hasCloseDate: store.hasCloseDate ? 'true' : 'false',
    closeDate,
    shippingMethod,
    primaryShippingLocation: {
      name,
      street,
      street2,
      city,
      state,
      zipcode,
    },
    allowDirectShipping: store.allowDirectShipping ? 'true' : 'false',
    contact: {
      firstName,
      lastName,
      email,
      phone,
    },
  };
}

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
    name: data.name,
    openDate,
    hasCloseDate,
    closeDate,
    category,
    hasPrimaryShippingLocation,
    primaryShippingLocation: data.primaryShippingLocation,
    allowDirectShipping,
    contact: data.contact,
    updatedAt: new Date(),
  };
}

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
    ['store', router.query.id],
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
    async (store: StoreForm) => {
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
      onSuccess: data => {
        queryClient.invalidateQueries('stores', { exact: true });
        queryClient.invalidateQueries(['store', data._id]);
        router.push(`/stores/${data._id}`);
      },
    }
  );

  if (loading || !session) return <div />;

  return (
    <BasicLayout>
      <UpdateStoreStyles>
        {isLoading && (
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
            </div>
            <div className="main-content">
              <div className="wrapper">
                <div className="form-container">
                  <div>Loading Store...</div>
                </div>
              </div>
            </div>
          </>
        )}
        {isError && error instanceof Error && (
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
                <h2>Error!</h2>
              </div>
            </div>
            <div className="main-content">
              <div className="wrapper">
                <div className="form-container">
                  <div>Error: {error.message}</div>
                </div>
              </div>
            </div>
          </>
        )}
        {store && (
          <Formik
            initialValues={formatInitialValues(store)}
            validationSchema={updateStoreSchema}
            onSubmit={async values => {
              await updateStoreMutation.mutate(values);
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
                    <Form>
                      <h3>Store Information</h3>
                      <div className="section">
                        <div className="grid-col-1">
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
                      </div>
                      <div className="section">
                        <h4>When will this store open?</h4>
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
                                Yes, this store will have a close date
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
                                No, this store will be open permanently
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
                              <Field
                                name="closeDate.year"
                                id="closeDate.year"
                              />
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
                                We will be shipping the orders to a primary
                                location
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
                                We will NOT be shipping orders to a primary
                                location
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
                                This store is for Macaport (no client)
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
                                    Yes, customers can ship directly to
                                    themselves
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
                            <h3>Store Contact</h3>
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
                              <label htmlFor="contact.email">
                                Email Address
                              </label>
                              <Field name="contact.email" id="contact.email" />
                              <ErrorMessage
                                name="contact.email"
                                component="div"
                                className="validation-error"
                              />
                            </div>
                            <div className="item">
                              <label htmlFor="contact.phone">
                                Phone Number
                              </label>
                              <Field name="contact.phone" id="contact.phone" />
                              <ErrorMessage
                                name="contact.phone"
                                component="div"
                                className="validation-error"
                              />
                            </div>
                          </div>
                        </>
                      )}
                    </Form>
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

  .main-content {
    padding: 10rem 3rem 3rem;
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

  .validation-error {
    margin: 0.25rem 0 0;
    font-size: 0.75rem;
    font-weight: 500;
    color: #b91c1c;
  }
`;
