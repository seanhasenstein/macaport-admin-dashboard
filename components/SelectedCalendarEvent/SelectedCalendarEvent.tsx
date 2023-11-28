import React from 'react';
import styled from 'styled-components';
import { format } from 'date-fns';

import { CalendarEventWithId } from '../../interfaces';

type Props = {
  selectedEvent: CalendarEventWithId;
  firstEventSelected: boolean;
  lastEventSelected: boolean;
  setPrevItem: () => void;
  setNextItem: () => void;
  setModeToUpdate: () => void;
};

export default function SelectedCalendarEvent({
  selectedEvent,
  firstEventSelected,
  lastEventSelected,
  setPrevItem,
  setNextItem,
  setModeToUpdate,
}: Props) {
  const {
    _id,
    name,
    type,
    locations,
    employees,
    equipment,
    instructions,
    createdAt,
    updatedAt,
  } = selectedEvent;

  return (
    <SelectedCalendarEventStyles>
      <div className="body">
        <button
          type="button"
          className="update-button"
          onClick={setModeToUpdate}
        >
          Update
        </button>
        <div className="item">
          <p className="label">Name</p>
          <p className="value">{name}</p>
        </div>
        <div className="item">
          <p className="label">Type</p>
          <p className="value">{type}</p>
        </div>
        <div className="item">
          <p className="label">Locations</p>
          <p>TODO</p>
        </div>
        {/* TODO: add secondaryLocations */}
        {/* TODO: add employees */}
        {/* TODO: add equipment */}
        {/* TODO: add instructions */}
        <div className="item">
          <p className="label">Created</p>
          <p className="value">{format(new Date(createdAt), 'Pp')}</p>
        </div>
        <div className="item">
          <p className="label">Updated</p>
          <p className="value">{format(new Date(updatedAt), 'Pp')}</p>
        </div>
      </div>
    </SelectedCalendarEventStyles>
  );
}

const SelectedCalendarEventStyles = styled.div`
  position: relative;
  height: calc(100vh - 7rem);
  overflow-y: auto;

  .update-button {
    padding: 0;
    width: 4.5rem;
    height: 1.75rem;
    position: absolute;
    top: 1.5rem;
    right: 1.5rem;
    background-color: transparent;
    font-size: 0.8125rem;
    font-weight: 600;
    color: #374151;
    line-height: 100%;
    border: 1px solid #d1d5db;
    border-radius: 0.25rem;
    box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05);
    cursor: pointer;
    transition: all 250ms ease-in-out;

    &:hover {
      border-color: #bbc1ca;
      color: #111827;
    }
  }

  .item {
    margin: 0 0 2rem;

    .label {
      margin: 0 0 0.5rem;
      font-size: 0.875rem;
      font-weight: 500;
      color: #111827;
    }

    .value {
      margin: 0;
      font-size: 0.875rem;
      font-weight: 500;
      color: #6b7280;
    }
  }

  .footer {
    position: fixed;
    bottom: 0;
    width: 100%;
    display: flex;
    align-items: center;
    background-color: #fff;
    border-radius: 0 0 0.625rem 0.625rem;
    box-shadow: 0 -1px 2px 0 rgb(0 0 0 / 0.05);

    .prev-button,
    .next-button {
      padding: 0;
      width: 100%;
      height: 3.25rem;
      display: flex;
      justify-content: center;
      gap: 0 0.25rem;
      align-items: center;
      background-color: transparent;
      border: 1px solid #e5e7eb;
      border-radius: 0;
      font-size: 0.875rem;
      font-weight: 500;
      color: #4b5563;
      box-shadow: none;
      cursor: pointer;
      transition: all 100ms ease-in-out;
      user-select: none;

      &:hover {
        border-color: #d1d5db;
        color: #111827;
        z-index: 10;
      }

      &:disabled {
        color: #b2b7c1;
        cursor: default;
        pointer-events: none;
        box-shadow: none;

        &:hover {
          border-color: #e5e7eb;
        }

        .icon {
          color: #dddfe4;
        }
      }

      .icon {
        height: 1.3125rem;
        width: 1.3125rem;
        color: #b2b7c1;
        transition: color 100ms ease-in-out;
      }
    }

    .prev-button {
      border-left: none;
      border-bottom-left-radius: 0.625rem;
    }

    .next-button {
      margin-left: -1px;
      border-right: none;
      border-bottom-right-radius: 0.625rem;
    }
  }
`;
