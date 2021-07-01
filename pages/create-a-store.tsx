import Link from 'next/link';
import styled from 'styled-components';
import { Formik, Form, Field, FieldArray } from 'formik';
import Layout from '../components/Layout';
import { unitedStates, months, slugify } from '../utils';

const CreateStoreStyles = styled.div`
  .title {
    padding: 1.625rem 2.5rem;
    border-bottom: 1px solid #e5e7eb;
  }

  h2 {
    margin: 0;
    font-size: 1.375rem;
    font-weight: 600;
    color: #1f2937;
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
    padding: 3.5rem 3rem;
    position: relative;
  }

  .form-container {
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

  .store-url {
    margin: 0.75rem 0 0;
    font-size: 0.875rem;
    font-weight: 500;
    color: #9ca3af;

    span {
      text-decoration: underline;
    }
  }

  .add-note-container {
    display: grid;
    grid-template-columns: 1fr auto;
    gap: 1rem;
    align-items: flex-end;

    .item {
      margin: 0;
    }

    button {
      padding: 0 0.75rem;
      height: 41px;
      display: flex;
      align-items: center;
      font-size: 0.875rem;
      font-weight: 500;
      line-height: 1;
      color: #1f2937;
      background-color: #fff;
      border: 1px solid #dddde2;
      border-radius: 0.375rem;
      box-shadow: rgba(0, 0, 0, 0) 0px 0px 0px 0px,
        rgba(0, 0, 0, 0) 0px 0px 0px 0px, rgba(0, 0, 0, 0.05) 0px 1px 2px 0px;
      cursor: pointer;

      &:hover {
        background-color: #f9fafb;
      }

      svg {
        margin: 0 0.125rem 0 0;
        width: 1.25rem;
        height: 1.25rem;
        color: #9ca3af;
      }
    }
  }

  .buttons {
    margin: 2rem 0;
    display: flex;
    justify-content: flex-end;
    align-items: center;
    gap: 0 1.5rem;

    a {
      color: #6b7280;

      &:hover {
        color: #4b5563;
        text-decoration: underline;
      }
    }

    button {
      padding: 0.75rem 1.25rem;
      height: 2.625rem;
      position: relative;
      display: flex;
      justify-content: center;
      align-items: center;
      background-color: #4338ca;
      color: #f3f4f5;
      font-size: 0.875rem;
      font-weight: 600;
      letter-spacing: 0.011em;
      border: 1px solid #3730a3;
      border-radius: 0.375rem;
      box-shadow: rgba(0, 0, 0, 0) 0px 0px 0px 0px,
        rgba(0, 0, 0, 0) 0px 0px 0px 0px, rgba(0, 0, 0, 0.05) 0px 1px 2px 0px;
      cursor: pointer;

      &:hover {
        background-color: #3730a3;
      }

      &:focus {
        outline: 2px solid transparent;
        outline-offset: 2px;
        box-shadow: rgb(255, 255, 255) 0px 0px 0px 2px, #4f46e5 0px 0px 0px 4px,
          rgba(0, 0, 0, 0.05) 0px 1px 2px 0px;
      }
    }
  }

  .saved-notes {
    margin: 1.875rem 0 1rem;

    h4 {
      margin: 0 0 0.875rem;
    }
  }

  .note {
    padding: 1rem 0;
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 1px solid #e5e7eb;

    &:first-of-type {
      border-top: 1px solid #e5e7eb;
    }

    p {
      margin: 0;
      padding: 0 1rem 0 0;
    }

    button {
      display: flex;
      justify-content: center;
      align-items: center;
      height: 1.125rem;
      width: 1.125rem;
      background-color: transparent;
      border: none;
      cursor: pointer;

      svg {
        flex-shrink: 0;
        height: 1.125rem;
        width: 1.125rem;
        color: #374151;
      }

      &:hover svg {
        color: #1f2937;
      }
    }
  }
`;

type FormValues = {
  name: string;
  openImmediately: boolean;
  openDate: {
    month: string;
    date: string;
    year: string;
  };
  hasClosingDate: 'true' | 'false';
  closeDate: {
    month: string;
    date: string;
    year: string;
  };
  shippingMethod: 'ship' | 'noship' | 'inhouse';
  primaryShippingLocation: {
    name: string;
    street: string;
    street2: string;
    city: string;
    state: string;
    zipcode: string;
  };
  allowDirectShipping: 'true' | 'false';
  contact: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
  };
  unsavedNote: string;
  notes: string[];
};

const initialValues: FormValues = {
  name: '',
  openImmediately: false,
  openDate: {
    month: 'default',
    date: '',
    year: '',
  },
  hasClosingDate: 'true',
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
  unsavedNote: '',
  notes: [],
};

export default function createStore() {
  return (
    <Layout>
      <CreateStoreStyles>
        <div className="title">
          <h2>Create a Store</h2>
        </div>
        <div className="main-content">
          <Formik
            initialValues={initialValues}
            onSubmit={async values => {
              const response = await fetch('/api/add-store', {
                method: 'post',
                body: JSON.stringify(values),
                headers: {
                  'Content-Type': 'application/json',
                },
              });

              const data = await response.json();
              console.log(data);
            }}
          >
            {({ values, setFieldValue }) => (
              <div className="form-container">
                <Form>
                  <h3>Store Details</h3>
                  <p>
                    Fill out this form to create a new online store for the
                    Macaport website.
                  </p>
                  <div className="section">
                    <div className="grid-col-1">
                      <div className="item">
                        <label htmlFor="name">Store Name</label>
                        <Field name="name" id="name" />
                        <div className="store-url">
                          The store url will be:{' '}
                          <span>
                            www.macaport.com/store/
                            {values.name ? slugify(values.name) : 'store-name'}
                          </span>
                        </div>
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
                            name="hasClosingDate"
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
                            name="hasClosingDate"
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
                  {values.hasClosingDate === 'true' && (
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
                            We will be shipping the orders to the client
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
                            Orders for this store will NOT be shipped to the
                            client
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
                            This store is for us here at Macaport
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>
                  {values.shippingMethod === 'ship' && (
                    <div className="section">
                      <h4>Primary Shipping Location</h4>
                      <p>
                        This is where the orders will be shipped unless
                        customers ship directly to themselves.
                      </p>
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
                            <h4>Allow direct shipping for this store?</h4>
                            <div className="radio-item">
                              <Field
                                type="radio"
                                name="allowDirectShipping"
                                id="allowDirectShipping"
                                value="true"
                              />
                              <label htmlFor="allowDirectShipping">
                                Yes, allow direct shipping to customers for this
                                store
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
                                No, all orders will be packaged and
                                shipped/picked up together
                              </label>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="section">
                        <h3>Store Contact</h3>
                        <p>
                          This will be the main individual that you will
                          communicate with for this store.
                        </p>
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
                            <label htmlFor="contact.lastName">Last Name</label>
                            <Field
                              name="contact.lastName"
                              id="contact.lastName"
                            />
                          </div>
                        </div>
                        <div className="item">
                          <label htmlFor="contact.email">Email Address</label>
                          <Field name="contact.email" id="contact.email" />
                        </div>
                        <div className="item">
                          <label htmlFor="contact.phone">Phone Number</label>
                          <Field name="contact.phone" id="contact.phone" />
                        </div>
                      </div>
                    </>
                  )}
                  <div className="section">
                    <h3>Add notes about this store</h3>
                    <div className="item">
                      <FieldArray name="notes">
                        {({ push, remove }) => (
                          <>
                            <div className="add-note-container">
                              <div className="item">
                                <label
                                  htmlFor="unsavedNote"
                                  className="sr-only"
                                >
                                  Add a note
                                </label>
                                <Field name="unsavedNote" id="unsavedNote" />
                              </div>
                              <div>
                                <button
                                  type="button"
                                  onClick={() => {
                                    push(values.unsavedNote);
                                    setFieldValue('unsavedNote', '');
                                  }}
                                >
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
                                  Add note
                                </button>
                              </div>
                            </div>

                            {values.notes.length > 0 && (
                              <div className="saved-notes">
                                <h4>Saved Notes:</h4>
                                {values.notes.map((n, i) => (
                                  <div key={i} className="note">
                                    <p>{n}</p>
                                    <button
                                      type="button"
                                      onClick={() => remove(i)}
                                    >
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
                                      <span className="sr-only">
                                        Remove note
                                      </span>
                                    </button>
                                  </div>
                                ))}
                              </div>
                            )}
                          </>
                        )}
                      </FieldArray>
                    </div>
                  </div>
                  <div className="buttons">
                    <Link href="/dashboard">
                      <a>Cancel</a>
                    </Link>
                    <button type="submit">Create the store</button>
                  </div>
                </Form>
              </div>
            )}
          </Formik>
        </div>
      </CreateStoreStyles>
    </Layout>
  );
}
