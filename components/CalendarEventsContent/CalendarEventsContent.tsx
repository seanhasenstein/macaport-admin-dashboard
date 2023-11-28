import React from 'react';
import { useQuery } from 'react-query';
import styled from 'styled-components';
import { format } from 'date-fns';
import { PlusIcon } from '@heroicons/react/24/outline';
import { ChevronRightIcon } from '@heroicons/react/20/solid';

import PageNavButtons from '../PageNavButtons';
import CalendarEventSidebar from '../sidebars/CalendarEventSidebar';
import Sidebar from '../Sidebar';
import TableLoadingSpinner from '../TableLoadingSpinner';

import { FIVE_MINUTES } from '../../constants/time';
import { fetchCalendarEvents } from './pageContent';

import { CalendarEventWithId } from '../../interfaces';
import Table from '../common/Table';
import Td from '../tables/Td';

export default function CalendarEventsContent() {
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);
  const [selectedEvent, setSelectedEvent] =
    React.useState<CalendarEventWithId>();
  const [mode, setMode] = React.useState<'create' | 'update' | 'view'>();

  const { data: calendarEvents, isLoading } = useQuery(
    ['events'],
    fetchCalendarEvents,
    { staleTime: FIVE_MINUTES }
  );

  const openSidebar = () => setIsSidebarOpen(true);
  const closeSidebar = () => setIsSidebarOpen(false);
  const firstEventId = calendarEvents?.[0]?._id;
  const lastEventId = calendarEvents?.[calendarEvents.length - 1]?._id;
  const firstEventSelected = selectedEvent?._id === firstEventId;
  const lastEventSelected = selectedEvent?._id === lastEventId;
  const setModeToUpdate = () => setMode('update');
  const setModeToView = () => setMode('view');
  const updateSelectedEvent = (event: CalendarEventWithId) =>
    setSelectedEvent(event);

  const setPrevItem = () => {
    if (firstEventSelected || !calendarEvents) return;
    const index = calendarEvents?.findIndex(
      event => event._id === selectedEvent?._id
    );
    setSelectedEvent(calendarEvents?.[index - 1]);
  };

  const setNextItem = () => {
    if (lastEventSelected || !calendarEvents) return;
    const index = calendarEvents.findIndex(
      event => event._id === selectedEvent?._id
    );
    setSelectedEvent(calendarEvents?.[index + 1]);
  };

  const handleSelectClick = (id: string) => {
    setSelectedEvent(calendarEvents?.find(event => event._id === id));
    setModeToView();
    openSidebar();
  };

  React.useEffect(() => {
    if (mode === 'update' || mode === 'view') {
      setIsSidebarOpen(true);
    }
  }, []);

  if (isLoading) return <TableLoadingSpinner />;

  return (
    <CalendarEventsContentStyles>
      <div className="container">
        <PageNavButtons />
        <div className="header">
          <h2>Events</h2>
          <button
            type="button"
            className="open-create-sidebar"
            onClick={() => {
              setMode('create');
              openSidebar();
            }}
          >
            <PlusIcon className="icon" />
            Add an event
          </button>
        </div>
        {calendarEvents && calendarEvents.length > 0 ? (
          <div className="table-container">
            <Table>
              <table>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Type</th>
                    <th>Locations</th>
                    <th>Created</th>
                    <th>Updated</th>
                    <th />
                  </tr>
                </thead>
                <tbody>
                  {calendarEvents.map(event => {
                    const { _id, name, type, locations, createdAt, updatedAt } =
                      event;
                    return (
                      <tr key={_id}>
                        <Td
                          withButton
                          onClick={() => handleSelectClick(event._id)}
                          customClassName="table-button-item name"
                        >
                          {name}
                        </Td>
                        <Td
                          withButton
                          onClick={() => handleSelectClick(event._id)}
                          customClassName="table-button-item"
                        >
                          {type}
                        </Td>
                        <Td
                          withButton
                          onClick={() => handleSelectClick(event._id)}
                          customClassName="table-button-item"
                        >
                          locations
                        </Td>
                        <Td
                          withButton
                          onClick={() => handleSelectClick(event._id)}
                          customClassName="table-button-item"
                        >
                          {format(new Date(event.createdAt), 'Pp')}
                        </Td>
                        <Td
                          withButton
                          onClick={() => handleSelectClick(event._id)}
                          customClassName="table-button-item"
                        >
                          {format(new Date(event.createdAt), 'Pp')}
                        </Td>
                        <Td
                          withButton
                          onClick={() => handleSelectClick(event._id)}
                          customClassName="table-button-item chevron"
                        >
                          <ChevronRightIcon className="icon" />
                        </Td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </Table>
          </div>
        ) : (
          <div>There are currently no events.</div>
        )}
      </div>
      <Sidebar isOpen={isSidebarOpen} closeSidebar={closeSidebar}>
        <CalendarEventSidebar
          {...{
            mode,
            closeSidebar,
            openSidebar,
            selectedEvent,
            updateSelectedEvent,
            firstEventSelected,
            lastEventSelected,
            setPrevItem,
            setNextItem,
            setModeToUpdate,
            setModeToView,
          }}
        />
      </Sidebar>
    </CalendarEventsContentStyles>
  );
}

const CalendarEventsContentStyles = styled.div`
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
