import React from 'react';
import styled from 'styled-components';
import { EllipsisVerticalIcon } from '@heroicons/react/24/outline';

import useEscapeKeydownClose from '../../hooks/useEscapeKeydownClose';
import useOutsideClick from '../../hooks/useOutsideClick';

import { ShippingDataForm } from '../../interfaces';

type Props = {
  showMenu: boolean;
  setShowMenu: React.Dispatch<React.SetStateAction<boolean>>;
  setShowShippingModal: React.Dispatch<React.SetStateAction<boolean>>;
  shipping: ShippingDataForm;
  successfulMutation: boolean;
};

export default function HomepageMenu(props: Props) {
  const menuRef = React.useRef<HTMLDivElement>(null);
  useOutsideClick(props.showMenu, props.setShowMenu, menuRef);
  useEscapeKeydownClose(props.showMenu, props.setShowMenu);

  const handleShowShippngPriceModal = () => {
    props.setShowShippingModal(true);
  };

  return (
    <HomepageMenuStyles>
      <button
        type="button"
        onClick={() => props.setShowMenu(!props.showMenu)}
        className="main-menu-button"
      >
        <EllipsisVerticalIcon />
        <span className="sr-only">Toggle nav menu</span>
      </button>
      <div
        ref={menuRef}
        className={`menu-container${props.showMenu ? ' show' : ''}`}
      >
        {props.successfulMutation ? (
          <div className="successful-mutation">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z"
                clipRule="evenodd"
              />
            </svg>
            Successfully updated!
          </div>
        ) : null}
        <div className="details">
          <div className="item">
            <div className="label">Shipping price</div>
            <div className="value">${props.shipping.price}</div>
          </div>
          <div className="item">
            <div className="label">Free at cart of</div>
            <div className="value">${props.shipping.freeMinimum}</div>
          </div>
        </div>
        <button
          type="button"
          onClick={handleShowShippngPriceModal}
          className="menu-button"
        >
          Update shipping details
        </button>
      </div>
    </HomepageMenuStyles>
  );
}

const HomepageMenuStyles = styled.div`
  .main-menu-button {
    padding: 0 0.5rem;
    height: 100%;
    color: #6b7280;
    background-color: #fff;
    border: 1px solid #e5e7eb;
    border-radius: 0.375rem;
    box-shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1);
    cursor: pointer;
    transition: color 150ms linear;

    svg {
      height: 1.5rem;
      width: 1.5rem;
    }

    &:hover {
      color: #000;
    }
  }

  .menu-container {
    padding: 0.25rem 1.375rem 1rem;
    position: absolute;
    top: 7rem;
    right: -1rem;
    white-space: nowrap;
    display: none;
    flex-direction: column;
    align-items: flex-start;
    background-color: #fff;
    border-radius: 0.5rem;
    box-shadow: rgb(255, 255, 255) 0px 0px 0px 0px,
      rgba(17, 24, 39, 0.05) 0px 0px 0px 1px,
      rgba(0, 0, 0, 0.1) 0px 4px 6px -1px, rgba(0, 0, 0, 0.06) 0px 2px 4px -1px;

    &.show {
      display: flex;
      z-index: 100;
    }
  }

  .menu-button {
    padding: 0.625rem 1.25rem;
    width: 100%;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    background-color: #111827;
    border: none;
    font-size: 0.875rem;
    font-weight: 400;
    color: #fff;
    text-align: left;
    border-radius: 0.3125rem;
    cursor: pointer;
    transition: background-color 150ms linear;

    &:hover {
      background-color: #1f2937;
    }

    &:focus {
      outline: 2px solid transparent;
    }

    &:focus-visible {
      box-shadow: rgb(255, 255, 255) 0px 0px 0px 2px, #1c44b9 0px 0px 0px 4px,
        rgba(0, 0, 0, 0) 0px 0px 0px 0px;
    }
  }

  .details {
    margin: 0.25rem 0 0.5rem;
    width: 100%;
  }

  .item {
    padding: 0.625rem 0;
    width: 100%;
    display: flex;
    justify-content: space-between;
    border-bottom: 1px solid #e5e7eb;

    &:last-of-type {
      border-bottom: none;
    }
  }

  .label,
  .value {
    font-size: 0.875rem;
  }

  .label {
    min-width: 4rem;
  }

  .successful-mutation {
    margin: 0.875rem 0 0.125rem;
    display: flex;
    align-items: center;
    gap: 0.375rem;
    font-size: 0.875rem;
    font-weight: 500;
    color: #032a1f;

    svg {
      height: 0.875rem;
      width: 0.875rem;
      color: #059669;
    }
  }
`;
