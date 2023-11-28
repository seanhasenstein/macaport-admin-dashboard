import React from 'react';
import { useQuery } from 'react-query';
import styled from 'styled-components';
import { format } from 'date-fns';
import { PlusIcon } from '@heroicons/react/24/outline';
import { ChevronRightIcon } from '@heroicons/react/20/solid';

import PageNavButtons from '../PageNavButtons';
import Table from '../common/Table';
import Td from '../tables/Td';
import Sidebar from '../Sidebar';
import EmployeeSidebar from '../sidebars/EmployeeSidebar';

import { fetchEmployees } from './pageContent';
import { FIVE_MINUTES } from '../../constants/time';
import { formatPhoneNumber } from '../../utils';

import { EmployeeWithId } from '../../interfaces';
import TableLoadingSpinner from '../TableLoadingSpinner';

export default function EmployeesContent() {
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);
  const [selectedEmployee, setSelectedEmployee] =
    React.useState<EmployeeWithId>();
  const [mode, setMode] = React.useState<'create' | 'update' | 'view'>();

  const { data: employees, isLoading } = useQuery(
    ['employees'],
    fetchEmployees,
    {
      staleTime: FIVE_MINUTES,
    }
  );

  const openSidebar = () => setIsSidebarOpen(true);
  const closeSidebar = () => setIsSidebarOpen(false);
  const firstEmployeeId = employees?.[0]?._id;
  const lastEmployeeId = employees?.[employees.length - 1]?._id;
  const firstEmployeeSelected = selectedEmployee?._id === firstEmployeeId;
  const lastEmployeeSelected = selectedEmployee?._id === lastEmployeeId;
  const setModeToUpdate = () => setMode('update');
  const setModeToView = () => setMode('view');
  const updateSelectedEmployee = (employee: EmployeeWithId) =>
    setSelectedEmployee(employee);

  const setPrevItem = () => {
    if (firstEmployeeSelected || !employees) return;
    const index = employees?.findIndex(
      employee => employee._id === selectedEmployee?._id
    );
    setSelectedEmployee(employees?.[index - 1]);
  };

  const setNextItem = () => {
    if (lastEmployeeSelected || !employees) return;
    const index = employees.findIndex(
      employee => employee._id === selectedEmployee?._id
    );
    setSelectedEmployee(employees?.[index + 1]);
  };

  const handleSelectClick = (id: string) => {
    setSelectedEmployee(employees?.find(employee => employee._id === id));
    setModeToView();
    openSidebar();
  };

  React.useEffect(() => {
    if (mode === 'update' || mode === 'view') {
      setIsSidebarOpen(true);
    }
  }, [mode]);

  if (isLoading) return <TableLoadingSpinner />;

  return (
    <EmployeesContentStyles>
      <div className="container">
        <PageNavButtons />
        <div className="header">
          <h3>Employees</h3>
          <button
            type="button"
            className="open-create-sidebar"
            onClick={() => {
              setMode('create');
              openSidebar();
            }}
          >
            <PlusIcon className="icon" />
            Add an employee
          </button>
        </div>
        {employees && employees.length > 0 ? (
          <div className="table-container">
            <Table>
              <table>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Phone</th>
                    <th>Created</th>
                    <th />
                  </tr>
                </thead>
                <tbody>
                  {employees.map(employee => (
                    <tr key={employee._id}>
                      <Td
                        withButton
                        onClick={() => handleSelectClick(employee._id)}
                        customClassName="table-button-item name"
                      >
                        {employee.firstName} {employee.lastName}
                      </Td>
                      <Td
                        withButton
                        onClick={() => handleSelectClick(employee._id)}
                        customClassName="table-button-item"
                      >
                        {employee.email}
                      </Td>
                      <Td
                        withButton
                        onClick={() => handleSelectClick(employee._id)}
                        customClassName="table-button-item"
                      >
                        {formatPhoneNumber(employee.phone)}
                      </Td>
                      <Td
                        withButton
                        onClick={() => handleSelectClick(employee._id)}
                        customClassName="table-button-item"
                      >
                        {format(new Date(employee.createdAt), 'Pp')}
                      </Td>
                      <Td
                        withButton
                        onClick={() => handleSelectClick(employee._id)}
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
          <div>There are currently no employees.</div>
        )}
      </div>
      <Sidebar isOpen={isSidebarOpen} closeSidebar={closeSidebar}>
        <EmployeeSidebar
          {...{
            mode,
            closeSidebar,
            openSidebar,
            selectedEmployee,
            updateSelectedEmployee,
            firstEmployeeSelected,
            lastEmployeeSelected,
            setPrevItem,
            setNextItem,
            setModeToUpdate,
            setModeToView,
          }}
        />
      </Sidebar>
    </EmployeesContentStyles>
  );
}

const EmployeesContentStyles = styled.div`
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
        padding: 1rem;
        width: 100%;
        text-align: left;
        background-color: transparent;
        border: none;
        color: #4b5563;
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

      &.name {
        button {
          font-weight: 600;
          color: #111827;
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
