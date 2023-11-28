import React from 'react';
import styled from 'styled-components';
import { useMutation, useQueryClient } from 'react-query';
import { Formik, Form } from 'formik';
import { debounce } from 'lodash';

import TextInput from '../../TextInput';
import LoadingSpinner from '../../LoadingSpinner';

import {
  formatPhoneNumber,
  formatPhoneNumberOnChange,
  validateEmail,
  validatePhoneNumber,
} from '../../../utils';

import { EmployeeWithId } from '../../../interfaces';
import {
  FormValues,
  createEmployee,
  deleteEmployee,
  existingEmailMessage,
  existingPhoneMessage,
  fetchExistingEmployee,
  updateEmployee,
  validationSchema,
} from './formContent';

type Props = {
  mode: 'create' | 'update';
  closeSidebar: () => void;
  openSidebar: () => void;
  selectedEmployee: EmployeeWithId | undefined;
  setModeToView: () => void;
  updateSelectedEmployee: (employee: EmployeeWithId) => void;
};

export default function EmployeeForm({
  mode,
  closeSidebar,
  openSidebar,
  selectedEmployee,
  setModeToView,
  updateSelectedEmployee,
}: Props) {
  const [emailQueryIsLoading, setEmailQueryIsLoading] = React.useState(false);
  const [phoneQueryIsLoading, setPhoneQueryIsLoading] = React.useState(false);
  const [emailAlreadyExists, setEmailAlreadyExists] = React.useState(false);
  const [phoneAlreadyExists, setPhoneAlreadyExists] = React.useState(false);
  const [showDelete, setShowDelete] = React.useState(false);

  const emailRef = React.useRef<HTMLInputElement>(null);
  const phoneRef = React.useRef<HTMLInputElement>(null);

  const queryClient = useQueryClient();
  const { mutate: createMutation, isLoading: createIsLoading } =
    useMutation(createEmployee);
  const { mutate: updateMutation, isLoading: updateIsLoading } =
    useMutation(updateEmployee);
  const {
    mutate: deleteMutation,
    isLoading: deleteIsLoading,
    isSuccess: deleteSuccessful,
  } = useMutation(deleteEmployee);

  const isLoading = createIsLoading || updateIsLoading || deleteIsLoading;

  const getInitialValues = () => {
    if (mode === 'update' && selectedEmployee) {
      const { firstName, lastName, email, phone } = selectedEmployee;
      return {
        firstName,
        lastName,
        email,
        phone: formatPhoneNumber(phone),
      };
    } else {
      return {
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
      };
    }
  };

  const request = debounce(async (email: string) => {
    let existingEmployee = false;

    if (
      mode === 'create' &&
      emailRef.current &&
      validateEmail(emailRef.current?.value)
    ) {
      setEmailQueryIsLoading(true);
      existingEmployee = !!(await fetchExistingEmployee({ email }));
    }

    if (existingEmployee) {
      setEmailAlreadyExists(true);
    } else {
      setEmailAlreadyExists(false);
    }
    setEmailQueryIsLoading(false);
  }, 500);

  const debounceRequest = React.useCallback(
    (email: string) => request(email),
    []
  );

  function handleEmailInput(e: React.ChangeEvent<HTMLInputElement>) {
    if (emailRef.current) {
      emailRef.current.value = e.target.value.trim();
      debounceRequest(e.target.value);
    }
  }

  async function handlePhoneInput(e: React.ChangeEvent<HTMLInputElement>) {
    if (phoneRef.current) {
      phoneRef.current.value = formatPhoneNumberOnChange(e.target.value);

      if (mode === 'create' && validatePhoneNumber(phoneRef.current?.value)) {
        setPhoneQueryIsLoading(true);
        const existingEmployee = await fetchExistingEmployee({
          phone: phoneRef.current?.value,
        });
        existingEmployee
          ? setPhoneAlreadyExists(true)
          : setPhoneAlreadyExists(false);
        setPhoneQueryIsLoading(false);
      }
    }
  }

  const handleSubmit = (values: FormValues) => {
    if (
      emailQueryIsLoading ||
      phoneQueryIsLoading ||
      emailAlreadyExists ||
      phoneAlreadyExists
    ) {
      return;
    }

    if (mode === 'create') {
      createMutation(values, {
        onSettled: () => queryClient.invalidateQueries('employees'),
        onSuccess: data => {
          queryClient.setQueryData(['employees', 'employee', data._id], data);
          updateSelectedEmployee(data);
          setModeToView();
        },
      });
    }

    if (mode === 'update' && !!selectedEmployee) {
      const { _id, createdAt, updatedAt } = selectedEmployee;
      const update = {
        _id,
        ...values,
        meta: selectedEmployee.meta,
        createdAt,
        updatedAt,
      };
      updateMutation(update, {
        onSettled: () => queryClient.invalidateQueries('employees'),
        onSuccess: data => {
          queryClient.setQueryData(['employees', 'employee', data._id], data);
          updateSelectedEmployee(data);
        },
      });
    }
  };

  React.useEffect(() => {
    openSidebar();
  }, [showDelete]);

  if (deleteSuccessful) {
    return <div>{selectedEmployee?.firstName} was successfully deleted.</div>;
  }

  return (
    <EmployeeFormStyles>
      <Formik
        initialValues={getInitialValues()}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
      >
        {({ resetForm }) => (
          <Form>
            <div className="grid-col-2">
              <TextInput name="firstName" label="First name" />
              <TextInput name="lastName" label="Last name" />
            </div>
            <div className="email-field">
              <TextInput
                ref={emailRef}
                name="email"
                label="Email"
                customErrorMessage={
                  emailAlreadyExists ? existingEmailMessage : undefined
                }
                onInput={handleEmailInput}
              />
              <LoadingSpinner
                isLoading={emailQueryIsLoading}
                className="query-loading-spinner"
              />
            </div>
            <div className="phone-field">
              <TextInput
                ref={phoneRef}
                name="phone"
                label="Phone"
                customErrorMessage={
                  phoneAlreadyExists ? existingPhoneMessage : undefined
                }
                onInput={handlePhoneInput}
              />
              <LoadingSpinner
                isLoading={phoneQueryIsLoading}
                className="query-loading-spinner"
              />
            </div>
            <div className="actions">
              <button
                type="button"
                className="cancel-button"
                disabled={isLoading}
                onClick={() => {
                  resetForm();

                  if (mode === 'update') {
                    setModeToView();
                  } else {
                    closeSidebar();
                  }
                }}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="submit-button"
              >
                {isLoading
                  ? 'Saving'
                  : `${mode === 'create' ? 'Add' : 'Update'} employee`}
              </button>
            </div>
          </Form>
        )}
      </Formik>
      {mode === 'update' && !!selectedEmployee ? (
        <div className="delete-employee-section">
          {showDelete ? (
            <div className="final-check">
              <p>Are you sure you want to delete?</p>
              <div className="buttons">
                <button
                  type="button"
                  className="yes-delete-button"
                  disabled={deleteIsLoading}
                  onClick={() =>
                    deleteMutation(selectedEmployee?._id, {
                      onSuccess: () => {
                        queryClient.invalidateQueries('employees');
                      },
                    })
                  }
                >
                  Yes, delete this employee
                </button>
                <button
                  type="button"
                  className="cancel-delete-button"
                  disabled={deleteIsLoading}
                  onClick={() => {
                    setShowDelete(false);
                    openSidebar();
                  }}
                >
                  No, cancel
                </button>
              </div>
            </div>
          ) : (
            <button
              type="button"
              className="toggle-delete-button"
              onClick={() => setShowDelete(true)}
            >
              Delete employee
            </button>
          )}
        </div>
      ) : null}
    </EmployeeFormStyles>
  );
}

const EmployeeFormStyles = styled.div`
  .grid-col-2 {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(11rem, 1fr));
    gap: 1rem;
  }

  .email-field,
  .phone-field {
    position: relative;
    .query-loading-spinner {
      position: absolute;
      right: 0.75rem;
      top: 2.2125rem;
    }
  }

  .actions {
    margin-top: 2rem;
    display: flex;
    justify-content: flex-end;
    gap: 0 0.75rem;
  }

  .cancel-button,
  .submit-button {
    padding: 0.4375rem 0.9375rem;
    font-size: 0.875rem;
    font-weight: 600;
    border-radius: 0.325rem;
    cursor: pointer;
  }

  .cancel-button {
    background-color: transparent;
    color: #111827;
    border: 1px solid #d1d5db;
    box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05);
  }

  .submit-button {
    color: #fff;
    background-color: #111827;
    border: 1px solid #111827;

    &:hover {
      background-color: #030712;
      border-color: #030712;
    }
  }

  .delete-employee-section {
    padding: 0;
    position: absolute;
    bottom: 0;
    left: 0;
    display: flex;
    justify-content: center;
    width: 100%;

    .toggle-delete-button {
      margin-bottom: 1.75rem;
      width: calc(100% - 3.5rem);
      padding: 0.5625rem 0;
      background-color: transparent;
      border: 1px solid #dea8a8;
      border-radius: 0.25rem;
      color: #b91c1c;
      font-size: 0.875rem;
      font-weight: 500;
      cursor: pointer;
      transition: all 150ms ease-in-out;
    }

    .final-check {
      padding: 1.75rem;
      width: 100%;
      background-color: #fff;
      border-top: 1px solid #e5e7eb;
      box-shadow: 0 -1px 2px 0 rgb(0 0 0 / 0.05);
    }

    p {
      margin: 0;
      font-size: 1rem;
      font-weight: 500;
      color: #030712;
      text-align: center;
    }

    .buttons {
      margin: 1.75rem 0 0;
      display: flex;
      flex-direction: column;
      gap: 1rem 0;
      width: 100%;
    }

    .yes-delete-button,
    .cancel-delete-button {
      border: none;
      font-size: 0.875rem;
      font-weight: 500;
      border-radius: 0.25rem;
      cursor: pointer;
      transition: all 250ms ease-in-out;
    }

    .cancel-delete-button {
      padding: 0.5rem 1.5rem;
      background-color: #fff;
      color: #030712;
      border: 1px solid #d1d5db;
      box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05);
    }

    .yes-delete-button {
      padding: 0.625rem 1.5rem;
      background-color: #991b1b;
      color: #fff;
      border: none;

      &:hover {
        background-color: #881818;
      }
    }
  }
`;
