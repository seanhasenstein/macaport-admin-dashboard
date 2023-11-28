import React from 'react';
import { Formik, Form } from 'formik';
import styled from 'styled-components';
import * as Yup from 'yup';
import { XMarkIcon } from '@heroicons/react/20/solid';

import TextInput from '../../TextInput';
import Select from '../../Select';
import TextArea from '../../TextArea';

import { unitedStates } from '../../../utils/unitedStates';
import { formatZipcodeOnChange } from '../../../utils';

const validationSchema = Yup.object({
  name: Yup.string().required('Name is required'),
  type: Yup.string().required('Type is required'),
  dates: Yup.array().of(
    Yup.object({
      startTime: Yup.string().required('Start time is required'),
      endTime: Yup.string().required('End time is required'),
    })
  ),
  location: Yup.object({
    name: Yup.string().required('Location name is required'),
    address: Yup.object({
      street: Yup.string().required('Street is required'),
      city: Yup.string().required('City is required'),
      state: Yup.string()
        .required('State is required')
        .test(
          'is-default',
          'A state is required',
          value => value !== 'default'
        ),
      zip: Yup.string().required('Zip is required'),
    }),
  }),
});

type Props = {
  closeSidebar: () => void;
};

export default function CreateEventSidebar({ closeSidebar }: Props) {
  const zipRef = React.useRef<HTMLInputElement>(null);

  const handleSubmit = () => {
    console.log('submit');
  };

  return (
    <CreateEventSidebarStyles>
      <div className="header">
        <h3 className="title">Add an event</h3>
        <button type="button" className="close-button" onClick={closeSidebar}>
          <XMarkIcon className="icon" />
          <span className="sr-only">Close sidebar</span>
        </button>
      </div>
      <Formik
        initialValues={{
          name: '',
          type: undefined,
          dates: [], // {startTime: string; endTime: string}
          location: {
            name: '',
            address: {
              street: '',
              street2: '',
              city: '',
              state: '',
              zip: '',
            },
          },
          employees: [],
          equipment: [],
          instructions: [],
        }}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
      >
        {({ resetForm }) => (
          <Form>
            <div className="body">
              <div>
                <TextInput name="name" label="Name" />
                {/* todo add type radio inputs */}
                {/* todo: add dates inputs */}
              </div>
              <div className="section">
                <h3 className="section-title">Location</h3>
                <TextInput name="location.name" label="Name" />
                <TextInput name="location.address.street" label="Street" />
                <TextInput name="location.address.street2" label="Street 2" />
                <div className="grid-col-2">
                  <TextInput name="location.address.city" label="City" />
                  <Select
                    name="location.address.state"
                    label="State"
                    options={unitedStates}
                  />
                </div>
                <TextInput
                  ref={zipRef}
                  name="location.address.zip"
                  label="Zip"
                  onInput={e => {
                    if (zipRef.current) {
                      zipRef.current.value = formatZipcodeOnChange(
                        e.target.value
                      );
                    }
                  }}
                />
              </div>
              <div className="section">
                <h3 className="section-title">Other items</h3>
                <TextArea name="instructions" label="Instructions" />
              </div>
              <div className="actions">
                <button
                  type="button"
                  className="cancel-button"
                  onClick={() => {
                    resetForm();
                    closeSidebar();
                  }}
                >
                  Cancel
                </button>
                <button type="button" className="submit-button">
                  Add event
                </button>
              </div>
            </div>
          </Form>
        )}
      </Formik>
    </CreateEventSidebarStyles>
  );
}

const CreateEventSidebarStyles = styled.div`
  .header {
    position: relative;
    padding: 1.3125rem 1.75rem;
    border-bottom: 1px solid #e5e7eb;
    box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05);
  }

  .title {
    margin: 0;
    font-size: 1.0625rem;
    font-weight: 600;
    color: #030712;
    line-height: 100%;
  }

  .close-button {
    padding: 0.5rem;
    position: absolute;
    top: 0.75rem;
    right: 0.75rem;
    background: transparent;
    border: none;
    color: #9ca3af;
    cursor: pointer;
    transition: color 200ms ease-in-out;

    .icon {
      height: 1.4375rem;
      width: 1.4375rem;
    }

    &:hover {
      color: #6b7280;
    }
  }

  .body {
    position: relative;
    padding: 1.75rem 1.75rem 0;
    height: calc(100vh - 5.5rem);
    overflow-y: auto;
  }

  .section {
    margin-top: 2.25rem;
    padding-top: 1.5rem;
    border-top: 1px solid #e5e7eb;
  }

  .section-title {
    margin: 0 0 1.25rem;
    font-size: 1.0625rem;
    font-weight: 600;
    color: #111827;
  }

  .grid-col-2 {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(11rem, 1fr));
    gap: 1rem;
  }

  .actions {
    margin-top: 2rem;
    padding: 1.125rem 0;
    display: flex;
    justify-content: flex-end;
    gap: 0 0.75rem;
    border-top: 1px solid #e5e7eb;
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
`;
