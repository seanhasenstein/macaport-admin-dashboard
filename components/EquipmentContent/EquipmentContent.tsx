import React from 'react';
import { useQuery } from 'react-query';
import styled from 'styled-components';
import { format } from 'date-fns';
import { PlusIcon } from '@heroicons/react/24/outline';

import PageNavButtons from '../PageNavButtons';
import EquipmentForm from '../forms/EquipmentForm';
import Table from '../common/Table';
import Td from '../tables/Td';
import Modal from '../modals';

import { fetchAllEquipment } from './pageContent';

import { EquipmentWithId } from '../../interfaces';

import { FIVE_MINUTES } from '../../constants/time';
import Sidebar from '../Sidebar';
import EquipmentSidebar from '../sidebars/EquipmentSidebar';
import TableLoadingSpinner from '../TableLoadingSpinner';
import { ChevronRightIcon } from '@heroicons/react/20/solid';

export default function EquipmentContent() {
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);
  const [selectedItem, setSelectedItem] = React.useState<EquipmentWithId>();
  const [mode, setMode] = React.useState<'create' | 'update' | 'view'>();

  const { data: equipment, isLoading } = useQuery(
    ['equipment'],
    fetchAllEquipment,
    { staleTime: FIVE_MINUTES }
  );

  const openSidebar = () => setIsSidebarOpen(true);
  const closeSidebar = () => setIsSidebarOpen(false);
  const firstItemId = equipment?.[0]?._id || '';
  const lastItemId = equipment?.[equipment.length - 1]?._id || '';
  const firstItemSelected = selectedItem?._id === firstItemId;
  const lastItemSelected = selectedItem?._id === lastItemId;
  const setModeToUpdate = () => setMode('update');
  const setModeToView = () => setMode('view');
  const updateSelectedItem = (item: EquipmentWithId) => setSelectedItem(item);

  function setNextItem() {
    if (lastItemSelected) return;
    const currentIndex = equipment?.findIndex(
      item => item._id === selectedItem?._id
    );
    const nextItem = equipment?.[currentIndex! + 1];
    setSelectedItem(nextItem);
  }

  function setPrevItem() {
    if (firstItemSelected) return;
    const currentIndex = equipment?.findIndex(
      item => item._id === selectedItem?._id
    );
    const previousItem = equipment?.[currentIndex! - 1];
    setSelectedItem(previousItem);
  }

  function handleSelectClick(id: string) {
    setSelectedItem(equipment?.find(item => item._id === id));
    setModeToView();
    openSidebar();
  }

  React.useEffect(() => {
    if (mode === 'update' || mode === 'view') {
      openSidebar();
    }
  }, [mode]);

  if (isLoading) return <TableLoadingSpinner />;

  return (
    <EquipmentContentStyles>
      <div className="container">
        <PageNavButtons />
        <div className="header">
          <h2>Equipment</h2>
          <button
            type="button"
            className="open-create-sidebar"
            onClick={() => {
              setMode('create');
              openSidebar();
            }}
          >
            <PlusIcon className="icon" />
            Add equipment
          </button>
        </div>
        {equipment && equipment.length > 0 ? (
          <div className="table-container">
            <Table>
              <table>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>ID</th>
                    <th>Type</th>
                    <th>Created</th>
                    <th>Updated</th>
                    <th />
                  </tr>
                </thead>
                <tbody>
                  {equipment?.map(item => (
                    <tr key={item._id}>
                      <Td
                        withButton
                        onClick={() => handleSelectClick(item._id)}
                        customClassName="table-button-item"
                      >
                        {item.name}
                      </Td>
                      <Td
                        withButton
                        onClick={() => handleSelectClick(item._id)}
                        customClassName="table-button-item"
                      >
                        {item.id}
                      </Td>
                      <Td
                        withButton
                        onClick={() => handleSelectClick(item._id)}
                        customClassName="table-button-item"
                      >
                        {item.type}
                      </Td>
                      <Td
                        withButton
                        onClick={() => handleSelectClick(item._id)}
                        customClassName="table-button-item"
                      >
                        {format(new Date(item.createdAt), 'Pp')}
                      </Td>
                      <Td
                        withButton
                        onClick={() => handleSelectClick(item._id)}
                        customClassName="table-button-item"
                      >
                        {format(new Date(item.updatedAt), 'Pp')}
                      </Td>
                      <Td
                        withButton
                        onClick={() => handleSelectClick(item._id)}
                        customClassName="table-button-item chevron"
                      >
                        <ChevronRightIcon className="icon" />
                      </Td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Table>
          </div>
        ) : (
          <div>There are currently no equipment items.</div>
        )}
      </div>
      <Sidebar isOpen={isSidebarOpen} closeSidebar={closeSidebar}>
        <EquipmentSidebar
          {...{
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
          }}
        />
      </Sidebar>
    </EquipmentContentStyles>
  );
}

const EquipmentContentStyles = styled.div`
  .container {
    margin: 0 auto;
    padding: 3rem 0 6rem;
    max-width: 74rem;
    width: 100%;

    .header {
      margin: 3.5rem 0 1.5rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .open-create-sidebar {
      padding: 0.625rem 1.25rem;
      display: inline-flex;
      align-items: center;
      font-size: 0.875rem;
      font-weight: 500;
      color: #111827;
      background-color: #fff;
      border: 1px solid #dcdfe4;
      border-radius: 0.375rem;
      box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05);
      cursor: pointer;

      &:hover {
        color: #000;
        border-color: #d1d5db;
      }

      .icon {
        margin: 0 0.375rem 0 0;
        height: 0.875rem;
        width: 0.875rem;
        stroke-width: 2.5px;
        color: #9ca3af;
      }
    }

    tr {
      transition: background-color 100ms ease-in-out;

      &:hover {
        background-color: rgba(237, 240, 243, 0.5);
      }
    }

    .table-button-item {
      padding: 0;
      button {
        padding: 1.125rem 1rem;
        width: 100%;
        text-align: left;
        background-color: transparent;
        border: none;
        cursor: pointer;
      }

      &:first-of-type {
        button {
          padding-left: 2.25rem;
        }
      }

      &:last-of-type {
        button {
          padding-right: 1.75rem;
        }
      }

      &.chevron {
        button {
          display: flex;
          justify-content: center;
          align-items: center;

          .icon {
            height: 1.125rem;
            width: 1.125rem;
            color: #9ca3af;
          }
        }
      }
    }
  }
`;
