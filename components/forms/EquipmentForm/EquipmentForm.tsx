import React from 'react';
import styled from 'styled-components';
import { Formik, Form, getIn } from 'formik';
import { useMutation, useQueryClient } from 'react-query';

import TextInput from '../../TextInput';
import TextArea from '../../TextArea';
import Select from '../../Select';

import {
  FormValues,
  createEquipmentMutation,
  deleteEquipmentMutation,
  updateEquipmentMutation,
  validationSchema,
} from './pageContent';
import { EquipmentWithId } from '../../../interfaces';

type Props = {
  mode: 'create' | 'update';
  closeSidebar: () => void;
  openSidebar: () => void;
  selectedItem: EquipmentWithId | undefined;
  setModeToView: () => void;
  updateSelectedItem: (item: EquipmentWithId) => void;
  updateTitle: (title: string) => void;
};

export default function EquipmentForm({
  mode,
  closeSidebar,
  openSidebar,
  selectedItem,
  setModeToView,
  updateSelectedItem,
  updateTitle,
}: Props) {
  const [showDelete, setShowDelete] = React.useState(false);

  const idRef = React.useRef<HTMLInputElement>(null);

  const queryClient = useQueryClient();
  const createEquipment = useMutation(createEquipmentMutation);
  const updateEquipment = useMutation(updateEquipmentMutation);
  const deleteEquipmentItem = useMutation(deleteEquipmentMutation);

  const isLoading = createEquipment.isLoading || updateEquipment.isLoading;

  const getInitialValues = () => {
    if (mode === 'update' && !!selectedItem) {
      const { name, id, type, description, instructions } = selectedItem;
      return {
        name,
        id,
        type,
        description: description ?? '',
        instructions: instructions ?? '',
      };
    } else {
      return {
        id: '',
        name: '',
        type: '',
        description: '',
        instructions: '',
      };
    }
  };

  const handleIdInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (idRef.current) {
      const value = e.target.value;
      if (!value || value === '-' || value === '_') {
        idRef.current.value = '';
        return;
      }

      if (value.includes('-') && value[value.length - 1] === '_') {
        const result = value.replace(/_+/g, '');
        idRef.current.value = result;
        return;
      }

      if (value.includes('_') && value[value.length - 1] === '-') {
        const result = value.replace(/-+/g, '');
        idRef.current.value = result;
        return;
      }

      const result = value
        .replace(/-+/g, '-')
        .replace(/_+/g, '_')
        .replace(/[^a-zA-Z0-9-_]/g, '');
      idRef.current.value = result;
    }
  };

  const handleSubmit = (values: FormValues) => {
    if (mode === 'create') {
      createEquipment.mutate(values, {
        onSettled: () => queryClient.invalidateQueries('equipment'),
        onSuccess: data => {
          queryClient.setQueryData(['equipment', data._id], data);
          updateSelectedItem(data);
          setModeToView();
        },
      });
    }

    if (mode === 'update' && !!selectedItem) {
      const { _id, createdAt, updatedAt } = selectedItem;
      const update = { _id, ...values, createdAt, updatedAt };
      updateEquipment.mutate(update, {
        onSettled: () => queryClient.invalidateQueries('equipment'),
        onSuccess: data => {
          queryClient.setQueryData(['equipment', data._id], data);
          updateSelectedItem(data);
          setModeToView();
        },
      });
    }
  };

  React.useEffect(() => {
    openSidebar();
  }, [showDelete]);

  if (deleteEquipmentItem.isSuccess) {
    return <p>{selectedItem?.name} was successfully deleted.</p>;
  }

  return (
    <EquipmentFormStyles>
      <Formik
        initialValues={getInitialValues()}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
      >
        {({ resetForm }) => (
          <Form>
            <TextInput label="Name" name="name" customClassName="form-item" />
            <div className="grid-col-2">
              <TextInput
                ref={idRef}
                label="Id"
                name="id"
                customClassName="form-item"
                onInput={handleIdInput}
              />
              <Select
                name="type"
                label="Type"
                customClassName="form-item"
                options={[
                  { value: 'default', label: 'Select a type' },
                  { value: 'type1', label: 'Type 1' },
                  { value: 'type2', label: 'Type 2' },
                  { value: 'type3', label: 'Type 3' },
                  { value: 'type4', label: 'Type 4' },
                ]}
              />
            </div>
            <TextArea
              label="Description"
              name="description"
              customClassName="form-item"
            />
            <TextArea
              label="Instructions"
              name="instructions"
              customClassName="form-item"
            />
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
                className="submit-button"
                disabled={isLoading}
              >
                {isLoading
                  ? 'Saving'
                  : `${mode === 'create' ? 'Add' : 'Update'} equipment`}
              </button>
            </div>
          </Form>
        )}
      </Formik>
      {mode === 'update' && !!selectedItem ? (
        <div className="delete-employee-section">
          {showDelete ? (
            <div className="final-check">
              <p>Are you sure you want to delete?</p>
              <div className="buttons">
                <button
                  type="button"
                  className="yes-delete-button"
                  disabled={deleteEquipmentItem.isLoading}
                  onClick={() =>
                    deleteEquipmentItem.mutate(selectedItem?._id, {
                      onSuccess: () => {
                        queryClient.invalidateQueries('equipment');
                        updateTitle('Equipment item deleted');
                      },
                    })
                  }
                >
                  Yes, delete the item
                </button>
                <button
                  type="button"
                  className="cancel-delete-button"
                  disabled={deleteEquipmentItem.isLoading}
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
              Delete this item
            </button>
          )}
        </div>
      ) : null}
    </EquipmentFormStyles>
  );
}

const EquipmentFormStyles = styled.div`
  padding-bottom: 2rem;

  .form-title {
    margin: 0 0 1.5rem;
    font-size: 1.125rem;
    font-weight: 600;
    color: #1f2937;
  }

  .grid-col-2 {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(11rem, 1fr));
    gap: 1rem;
  }

  .form-item {
    margin: 0 0 1.375rem;
    display: flex;
    flex-direction: column;
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

  .validation-error {
    margin: 0.5rem 0 0;
    font-size: 0.8125rem;
    font-weight: 500;
    color: #b91c1c;
  }
`;
