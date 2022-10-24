import React from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import styled from 'styled-components';
import useEscapeKeydownClose from '../../hooks/useEscapeKeydownClose';
import useOutsideClick from '../../hooks/useOutsideClick';
import { ShippingData, ShippingDataForm } from '../../interfaces';
import useShippingDetailsMutation from '../../hooks/useShippingDetailsMutation';
import LoadingSpinner from '../LoadingSpinner';

const validationSchema = Yup.object().shape({
  price: Yup.string()
    .matches(new RegExp(/^\d*\d\.{1}\d{2}$/), 'Invalid price')
    .required('Price is required'),
  freeMinimum: Yup.string()
    .matches(new RegExp(/^\d*\d\.{1}\d{2}$/), 'Invalid price')
    .required('Minimum cart total amount is required'),
});

type Props = {
  initialValues: ShippingData;
  showModal: boolean;
  setShowModal: React.Dispatch<React.SetStateAction<boolean>>;
};

export default function ShippingPriceModal(props: Props) {
  const deleteStoreRef = React.useRef<HTMLDivElement>(null);
  const { updateShippingDetails } = useShippingDetailsMutation();
  useOutsideClick(props.showModal, props.setShowModal, deleteStoreRef);
  useEscapeKeydownClose(props.showModal, props.setShowModal);

  const handleSubmit = (formValues: ShippingDataForm) => {
    console.log('hello?');
    updateShippingDetails.mutate(formValues, {
      onSuccess: () => {
        props.setShowModal(false);
      },
    });
  };

  return (
    <ShippingPriceModalStyles>
      <div ref={deleteStoreRef} className="modal">
        <Formik
          initialValues={{
            _id: props.initialValues._id,
            price: (props.initialValues.price / 100).toFixed(2),
            freeMinimum: (props.initialValues.freeMinimum / 100).toFixed(2),
          }}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
        >
          {() => (
            <>
              <h3>Update shipping price</h3>
              <p>This form will update shipping for all stores.</p>
              <Form>
                <div className="form-item">
                  <label htmlFor="price">Shipping Price</label>
                  <Field name="price" id="price" />
                  <ErrorMessage
                    component="div"
                    name="price"
                    className="validation-error"
                  />
                </div>
                <div className="form-item">
                  <label htmlFor="freeMinimum">
                    Free shipping cart minimum
                  </label>
                  <Field name="freeMinimum" id="freeMinimum" />
                  <ErrorMessage
                    component="div"
                    name="freeMinimum"
                    className="validation-error"
                  />
                </div>
                <div className="actions">
                  <button
                    type="button"
                    className="secondary-button"
                    onClick={() => props.setShowModal(false)}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="primary-button">
                    {updateShippingDetails.isLoading ? (
                      <LoadingSpinner
                        theme="dark"
                        isLoading={updateShippingDetails.isLoading}
                      />
                    ) : (
                      'Update shipping'
                    )}
                  </button>
                </div>
                {updateShippingDetails.isError ? (
                  <div className="server-error">
                    Server error. Please try again.
                  </div>
                ) : null}
              </Form>
            </>
          )}
        </Formik>
      </div>
    </ShippingPriceModalStyles>
  );
}

const ShippingPriceModalStyles = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.6);
  z-index: 9999;

  .modal {
    position: relative;
    margin: -8rem 0 0;
    padding: 2.25rem 2.5rem 1.75rem;
    max-width: 30rem;
    width: 100%;
    background-color: #fff;
    border-radius: 0.5rem;
    box-shadow: 0 25px 50px -12px rgb(0 0 0 / 0.25);

    h3 {
      margin: 0;
      font-size: 1.125rem;
      font-weight: 600;
      color: #111827;
    }

    p {
      margin: 0.75rem 0 0;
      font-size: 1rem;
      color: #4b5563;
      line-height: 1.5;
    }

    form {
      margin: 1.875rem 0 0;
    }

    .form-item {
      margin: 1.5rem 0 0;
      display: flex;
      flex-direction: column;
    }

    .actions {
      margin: 1.75rem 0 0;
      display: flex;
      justify-content: flex-end;
      align-items: center;
      gap: 1rem;
    }

    .primary-button,
    .secondary-button {
      font-size: 0.875rem;
      font-weight: 500;
      cursor: pointer;
    }

    .primary-button {
      padding: 0.625rem 1.25rem;
      min-width: 10rem;
      color: #fff;
      background-color: #111827;
      border: none;
      border-radius: 0.25rem;
      transition: background-color 150ms linear;

      &:hover {
        background-color: #1f2937;
      }

      &:focus {
        outline: 2px solid transparent;
        outline-offset: 2px;
      }

      &:focus-visible {
        text-decoration: underline;
      }
    }

    .secondary-button {
      color: #4b5563;
      background-color: transparent;
      border: none;

      &:hover {
        color: #1f2937;
        text-decoration: underline;
      }

      &:focus {
        outline: 2px solid transparent;
        outline-offset: 2px;
      }

      &:focus-visible {
        text-decoration: underline;
      }
    }
  }

  .validation-error,
  .server-error {
    font-size: 0.875rem;
    font-weight: 500;
    color: #b91c1c;
  }

  .validation-erro {
    margin: 0.5rem 0 0;
  }

  .server-error {
    margin: 1.125rem 0 0;
    text-align: center;
  }
`;
