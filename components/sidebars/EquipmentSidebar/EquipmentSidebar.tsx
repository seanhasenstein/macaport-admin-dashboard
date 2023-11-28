import React from 'react';
import styled from 'styled-components';
import { XMarkIcon } from '@heroicons/react/20/solid';

import { EquipmentWithId } from '../../../interfaces';
import SelectedEquipment from '../../SelectedEquipment';
import EquipmentForm from '../../forms/EquipmentForm';

function getTitle(mode: 'create' | 'update' | 'view' | undefined) {
  if (mode === 'create') {
    return 'Add an equipment item';
  } else if (mode === 'update') {
    return 'Update equipment item';
  } else {
    return 'Equipment item';
  }
}

type Props = {
  mode: 'create' | 'update' | 'view' | undefined;
  closeSidebar: () => void;
  openSidebar: () => void;
  selectedItem: EquipmentWithId | undefined;
  updateSelectedItem: (item: EquipmentWithId) => void;
  firstItemSelected: boolean;
  lastItemSelected: boolean;
  setPrevItem: () => void;
  setNextItem: () => void;
  setModeToUpdate: () => void;
  setModeToView: () => void;
};

export default function EquipmentSidebar({
  mode,
  closeSidebar,
  openSidebar,
  selectedItem,
  updateSelectedItem,
  firstItemSelected,
  lastItemSelected,
  setPrevItem,
  setNextItem,
  setModeToUpdate,
  setModeToView,
}: Props) {
  const [title, setTitle] = React.useState(() => getTitle(mode));

  const updateTitle = (title: string) => setTitle(title);

  const { name, id, type, description, instructions, createdAt, updatedAt } =
    selectedItem || {};

  React.useEffect(() => {
    setTitle(getTitle(mode));
  }, [mode]);

  if (!mode) return null;

  return (
    <EquipmentSidebarStyles>
      <div className="header">
        <h3 className="title">{title}</h3>
        <button type="button" className="close-button" onClick={closeSidebar}>
          <XMarkIcon className="icon" />
          <span className="sr-only">Close sidebar</span>
        </button>
      </div>
      {mode === 'view' && !!selectedItem ? (
        <SelectedEquipment
          {...{
            selectedItem,
            firstItemSelected,
            lastItemSelected,
            setPrevItem,
            setNextItem,
            setModeToUpdate,
          }}
        />
      ) : mode === 'create' || mode === 'update' ? (
        <div className="body">
          <EquipmentForm
            {...{
              mode,
              closeSidebar,
              openSidebar,
              selectedItem,
              setModeToView,
              updateSelectedItem,
              updateTitle,
            }}
          />
        </div>
      ) : null}
    </EquipmentSidebarStyles>
  );
}

const EquipmentSidebarStyles = styled.div`
  .header,
  .body {
    padding-left: 1.75rem;
    padding-right: 1.75rem;
  }

  .header {
    position: relative;
    padding: 1.3125rem 1.5rem;
    background-color: #fff;
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
    padding-top: 1.75rem;
  }
`;
