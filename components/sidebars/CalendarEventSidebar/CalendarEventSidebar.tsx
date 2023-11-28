import React from 'react';
import styled from 'styled-components';
import { XMarkIcon } from '@heroicons/react/20/solid';

import { CalendarEventWithId } from '../../../interfaces';
import CalendarEventForm from '../../forms/CalendarEventForm';
import SelectedCalendarEvent from '../../SelectedCalendarEvent';

type Props = {
  mode: 'create' | 'update' | 'view' | undefined;
  closeSidebar: () => void;
  openSidebar: () => void;
  selectedEvent: CalendarEventWithId | undefined;
  updateSelectedEvent: (employee: CalendarEventWithId) => void;
  firstEventSelected: boolean;
  lastEventSelected: boolean;
  setPrevItem: () => void;
  setNextItem: () => void;
  setModeToUpdate: () => void;
  setModeToView: () => void;
};

export default function CalendarEventSidebar({
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
}: Props) {
  if (!mode) return null;

  const title =
    mode === 'create'
      ? 'Add an event'
      : mode === 'update'
      ? 'Update an event'
      : 'Event';
  const showSelectedEvent = mode === 'view' && !!selectedEvent;
  const showEventForm = mode === 'create' || mode === 'update';

  return (
    <CalendarEventSidebarStyles>
      <div className="header">
        <h3 className="title">{title}</h3>
        <button type="button" className="close-button" onClick={closeSidebar}>
          <XMarkIcon className="icon" />
          <span className="sr-only">Close sidebar</span>
        </button>
      </div>
      {showSelectedEvent ? (
        <SelectedCalendarEvent
          {...{
            selectedEvent,
            firstEventSelected,
            lastEventSelected,
            setPrevItem,
            setNextItem,
            setModeToUpdate,
          }}
        />
      ) : showEventForm ? (
        <div className="body">
          <CalendarEventForm
            {...{
              mode,
              closeSidebar,
              openSidebar,
              selectedEvent,
              setModeToView,
              updateSelectedEvent,
            }}
          />
        </div>
      ) : null}
    </CalendarEventSidebarStyles>
  );
}

const CalendarEventSidebarStyles = styled.div`
  .header,
  .body {
    padding-left: 1.75rem;
    padding-right: 1.75rem;
  }

  .header {
    position: relative;
    padding-top: 1.3125rem;
    padding-bottom: 1.3125rem;
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
