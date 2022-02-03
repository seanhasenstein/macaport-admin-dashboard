import styled from 'styled-components';
import { Field, FieldArray, FieldArrayRenderProps } from 'formik';
import { unitedStates } from '../utils';
import { StoreForm as StoreFormInterface } from '../interfaces';

type Props = {
  values: StoreFormInterface;
  setFieldValue: (
    field: string,
    value: any,
    shouldValidate?: boolean | undefined
  ) => void;
};

export default function StoreForm({ values, setFieldValue }: Props) {
  const handleAddGroupClick = async (
    arrayHelpers: FieldArrayRenderProps,
    groupsLength: number
  ) => {
    await arrayHelpers.push('');

    document
      .querySelector<HTMLInputElement>(`#groups\\.${groupsLength}`)
      ?.focus();
  };

  return (
    <StoreFormStyles>
      <>
        <div className="section">
          <div className="item">
            <label htmlFor="name">Store Name</label>
            <Field name="name" id="name" />
          </div>
        </div>
        <div className="section">
          <h4>Store Contact</h4>
          <div className="grid-col-2">
            <div className="item">
              <label htmlFor="contact.firstName">First Name</label>
              <Field name="contact.firstName" id="contact.firstName" />
            </div>
            <div className="item">
              <label htmlFor="contact.lastName">Last Name</label>
              <Field name="contact.lastName" id="contact.lastName" />
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
        <div className="section">
          <h4>Store Open Details</h4>
          <div className="grid-col-2">
            <div className="item">
              <label htmlFor="openDate">Open Date</label>
              <input
                type="date"
                id="openDate"
                name="openDate"
                value={values.openDate}
                onChange={e => setFieldValue('openDate', e.target.value)}
              />
            </div>
            <div className="item">
              <label htmlFor="openTime">Open Time</label>
              <input
                type="time"
                id="openTime"
                name="openTime"
                value={values.openTime}
                onChange={e => setFieldValue('openTime', e.target.value)}
              />
            </div>
          </div>
        </div>
        <div className="section">
          <h4>Store Close Details</h4>
          <div className="item">
            <div className="checkbox-item">
              <input
                type="checkbox"
                id="permanentlyOpen"
                name="permanentlyOpen"
                checked={values.permanentlyOpen}
                onChange={() =>
                  setFieldValue('permanentlyOpen', !values.permanentlyOpen)
                }
              />
              <label htmlFor="permanentlyOpen">
                Keep this store open permanently
              </label>
            </div>
          </div>
          {!values.permanentlyOpen && (
            <div className="grid-col-2">
              <div className="item">
                <label htmlFor="closeDate">Close Date</label>
                <input
                  type="date"
                  id="closeDate"
                  name="closeDate"
                  value={values.closeDate}
                  onChange={e => setFieldValue('closeDate', e.target.value)}
                />
              </div>
              <div className="item">
                <label htmlFor="closeTime">Close Time</label>
                <input
                  type="time"
                  id="closeTime"
                  name="closeTime"
                  value={values.closeTime}
                  onChange={e => setFieldValue('closeTime', e.target.value)}
                />
              </div>
            </div>
          )}
        </div>
        <div className="section">
          <h4>Order Shipping Options</h4>
          <div className="checkbox-item">
            <Field
              type="checkbox"
              name="allowDirectShipping"
              id="allowDirectShipping"
            />
            <label htmlFor="allowDirectShipping">
              Include direct shipping to customers
            </label>
          </div>
          <div className="checkbox-item">
            <Field
              type="checkbox"
              name="hasPrimaryShippingLocation"
              id="hasPrimaryShippingLocation"
            />
            <label htmlFor="hasPrimaryShippingLocation">
              Include a primary shipping location
            </label>
          </div>
        </div>
        {values.hasPrimaryShippingLocation && (
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
              <label htmlFor="primaryShippingLocation.city">City</label>
              <Field
                name="primaryShippingLocation.city"
                id="primaryShippingLocation.city"
              />
            </div>
            <div className="grid-col-2">
              <div className="item">
                <label htmlFor="primaryShippingLocation.state">State</label>
                <Field
                  as="select"
                  name="primaryShippingLocation.state"
                  id="primaryShippingLocation.state"
                >
                  <option value="">Select state</option>
                  {unitedStates.map((s, i) => (
                    <option key={i} value={s}>
                      {s}
                    </option>
                  ))}
                </Field>
              </div>
              <div className="item">
                <label htmlFor="primaryShippingLocation.zipcode">Zipcode</label>
                <Field
                  name="primaryShippingLocation.zipcode"
                  id="primaryShippingLocation.zipcode"
                />
              </div>
            </div>
          </div>
        )}
        <div className="section">
          <div className="item">
            <h4>Group selection at checkout</h4>
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
                  Group term (team, organization, category, etc.)
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
                              <Field name={`groups.${i}`} id={`groups.${i}`} />
                              <button
                                type="button"
                                onClick={() => arrayHelpers.remove(i)}
                                className="remove-group-button"
                              >
                                <span className="sr-only">Remove</span>
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
    </StoreFormStyles>
  );
}

const StoreFormStyles = styled.div`
  h4 {
    margin: 0 0 1.5rem;
    font-size: 1rem;
    font-weight: 600;
    color: #374151;
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

  .item {
    margin: 0 0 1.5rem;
    display: flex;
    flex-direction: column;
  }

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
    padding: 0.625rem 1rem;
    display: inline-flex;
    justify-content: center;
    align-items: center;
    color: #f9fafb;
    font-size: 0.875rem;
    font-weight: 500;
    text-align: center;
    line-height: 1;
    background-color: #1f2937;
    border: none;
    border-radius: 0.3125rem;
    cursor: pointer;

    &:hover {
      background-color: #263244;
    }

    &:focus {
      outline: 2px solid transparent;
      outline-offset: 2px;
    }

    &:focus-visible {
      box-shadow: rgb(255, 255, 255) 0px 0px 0px 2px, #1c44b9 0px 0px 0px 4px,
        rgba(0, 0, 0, 0) 0px 0px 0px 0px;
    }
  }
`;
