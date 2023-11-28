import React from 'react';
import { useMutation, useQueryClient } from 'react-query';
import { Formik, Form, FieldArray } from 'formik';
import styled from 'styled-components';

import TextInput from '../../TextInput';

import {
  createCalendarEvent,
  deleteCalendarEvent,
  updateCalendarEvent,
  validationSchema,
} from './formContent';

import { CalendarEventWithId } from '../../../interfaces';
import TextArea from '../../TextArea';

type Props = {
  mode: 'create' | 'update';
  closeSidebar: () => void;
  openSidebar: () => void;
  selectedEvent: CalendarEventWithId | undefined;
  setModeToView: () => void;
  updateSelectedEvent: (employee: CalendarEventWithId) => void;
};

export default function CalendarEventForm({
  mode,
  closeSidebar,
  openSidebar,
  selectedEvent,
  setModeToView,
  updateSelectedEvent,
}: Props) {
  const [showDelete, setShowDelete] = React.useState(false);

  const zipRef = React.useRef<HTMLInputElement>(null);

  const queryClient = useQueryClient();
  const { mutate: createMutation, isLoading: createIsLoading } =
    useMutation(createCalendarEvent);
  const { mutate: updateMutation, isLoading: updateIsLoading } =
    useMutation(updateCalendarEvent);
  const {
    mutate: deleteMutation,
    isLoading: deleteIsLoading,
    isSuccess: deleteSuccessful,
  } = useMutation(deleteCalendarEvent);

  const getInitialValues = () => {};

  const handleSubmit = () => {};

  React.useEffect(() => {
    openSidebar();
  }, [showDelete]);

  if (deleteSuccessful) {
    return <div>{selectedEvent?.name} was successfully deleted.</div>;
  }

  return (
    <CalendarEventFormStyles>
      <Formik
        initialValues={{}}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
      >
        {({ resetForm, isSubmitting }) => {
          const isLoading = isSubmitting || createIsLoading || updateIsLoading;

          return (
            <Form>
              <TextInput name="name" label="Name" />
              {/* TODO: Add type radio buttons 'offsite' | 'instore' */}
              {/* TODO: Add date component to select dates and startTime/endTimes */}
              {/* conditionally render if type === 'offsite' otherwise set to Macaport and address */}
              <h3 className="section-title">Primary location</h3>
              <TextInput name="primaryLocation.name" label="Name" />
              <TextInput name="primaryLocation.address.street" label="Street" />
              <TextInput
                name="primaryLocation.address.street2"
                label="Street 2"
              />
              <TextInput name="primaryLocation.address.city" label="City" />
              {/* TODO: add select for state */}
              <TextInput name="primaryLocation.address.zip" label="Zip" />
              {/* TODO: add FieldArray for secondaryLocations */}
              <TextArea name="instructions" label="Instructions" />
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
                    : `${mode === 'create' ? 'Add' : 'Update'} calendar event`}
                </button>
              </div>
            </Form>
          );
        }}
      </Formik>
      {mode === 'update' && !!selectedEvent ? (
        <div className="delete-event-section">
          {showDelete ? (
            <div className="final-check">
              <p>Are you sure you want to delete?</p>
              <div className="buttons">
                <button
                  type="button"
                  className="yes-delete-button"
                  disabled={deleteIsLoading}
                  onClick={() =>
                    deleteMutation(selectedEvent?._id, {
                      onSuccess: () => {
                        queryClient.invalidateQueries('calendar-events');
                      },
                    })
                  }
                >
                  Yes, delete this calendar event
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
              Delete calendar event
            </button>
          )}
        </div>
      ) : null}
    </CalendarEventFormStyles>
  );
}

const CalendarEventFormStyles = styled.div`
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
