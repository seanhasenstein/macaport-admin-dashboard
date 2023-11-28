import React from 'react';
import styled from 'styled-components';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/20/solid';
import { format } from 'date-fns';

import { EquipmentWithId } from '../../interfaces';

type Props = {
  selectedItem: EquipmentWithId;
  firstItemSelected: boolean;
  lastItemSelected: boolean;
  setPrevItem: () => void;
  setNextItem: () => void;
  setModeToUpdate: () => void;
};

export default function SelectedEquipment({
  selectedItem,
  firstItemSelected,
  lastItemSelected,
  setPrevItem,
  setNextItem,
  setModeToUpdate,
}: Props) {
  const {
    _id,
    id,
    name,
    type,
    description,
    instructions,
    createdAt,
    updatedAt,
  } = selectedItem;

  return (
    <SelectedEquipmentStyles>
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
          <p className="label">Description</p>
          <p className="value">{description ? description : 'None'}</p>
        </div>
        <div className="item">
          <p className="label">Instructions</p>
          <p className="value">{instructions ? instructions : 'None'}</p>
        </div>
        <div className="item">
          <p className="label">Metadata:</p>
        </div>
        <div className="details-grid">
          <div className="grid-item">
            <p className="label">Id</p>
            <p className="value">{id}</p>
          </div>
          <div className="grid-item">
            <p className="label">Type</p>
            <p className="value">{type}</p>
          </div>
          <div className="grid-item">
            <p className="label">Created at</p>
            <p className="value">
              {createdAt ? format(new Date(createdAt), 'Pp') : ''}
            </p>
          </div>
          <div className="grid-item">
            <p className="label">Last updated</p>
            <p className="value">
              {updatedAt ? format(new Date(updatedAt), 'Pp') : ''}
            </p>
          </div>
        </div>
      </div>
      <div className="footer">
        <button
          type="button"
          className="prev-button"
          disabled={firstItemSelected}
          onClick={setPrevItem}
        >
          <ChevronLeftIcon className="icon" />
          Prev item
        </button>
        <button
          type="button"
          className="next-button"
          disabled={lastItemSelected}
          onClick={setNextItem}
        >
          Next item
          <ChevronRightIcon className="icon" />
        </button>
      </div>
    </SelectedEquipmentStyles>
  );
}

const SelectedEquipmentStyles = styled.div`
  .body {
    position: relative;
    padding: 1.75rem 1.75rem;
    height: calc(100vh - 7rem);
    overflow-y: auto;

    .update-button {
      padding: 0;
      width: 4.5rem;
      height: 1.75rem;
      position: absolute;
      top: 1.75rem;
      right: 1.875rem;
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

    .details-grid {
      margin: -0.9375rem 0 2rem;
      background-color: #fff;
      border: 1px solid #e5e7eb;
      border-radius: 0.5rem;
      box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05);

      .grid-item {
        padding: 0 1rem;
        display: grid;
        grid-template-columns: 1fr 1fr;
        background-color: #fff;
        border-bottom: 1px solid #e5e7eb;

        &:first-of-type {
          border-top-left-radius: 0.5rem;
          border-top-right-radius: 0.5rem;
        }

        &:last-of-type {
          border-bottom: none;
          border-bottom-left-radius: 0.5rem;
          border-bottom-right-radius: 0.5rem;
        }

        p {
          margin: 0;
          padding: 0.6875rem 0;
          font-size: 0.875rem;
          font-weight: 500;
          color: #4b5563;
        }

        .label {
          border-right: 1px solid #e5e7eb;
        }

        .value {
          text-align: right;
        }
      }
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
      box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05);
      cursor: pointer;
      transition: all 100ms ease-in-out;
      box-shadow: none;
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
