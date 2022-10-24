import React from 'react';
import styled from 'styled-components';
import { ShippingData } from '../../interfaces';
import useEscapeKeydownClose from '../../hooks/useEscapeKeydownClose';
import useOutsideClick from '../../hooks/useOutsideClick';

type Props = {
  setShowShippingModal: React.Dispatch<React.SetStateAction<boolean>>;
  shipping: ShippingData;
};

export default function HomepageMenu(props: Props) {
  const menuRef = React.useRef<HTMLDivElement>(null);
  const [showMenu, setShowMenu] = React.useState(false);
  useOutsideClick(showMenu, setShowMenu, menuRef);
  useEscapeKeydownClose(showMenu, setShowMenu);

  const handleShowShippngPriceModal = () => {
    props.setShowShippingModal(true);
  };

  return (
    <HomepageMenuStyles>
      <button
        type="button"
        onClick={() => setShowMenu(!showMenu)}
        className="main-menu-button"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M10.5 6a1.5 1.5 0 113 0 1.5 1.5 0 01-3 0zm0 6a1.5 1.5 0 113 0 1.5 1.5 0 01-3 0zm0 6a1.5 1.5 0 113 0 1.5 1.5 0 01-3 0z"
            clipRule="evenodd"
          />
        </svg>
        <span className="sr-only">Toggle nav menu</span>
      </button>
      <div ref={menuRef} className={`menu-container${showMenu ? ' show' : ''}`}>
        <div className="details">
          <div className="item">
            <div className="label">Shipping price</div>
            <div className="value">
              ${(props.shipping.price / 100).toFixed(2)}
            </div>
          </div>
          <div className="item">
            <div className="label">Free at cart of</div>
            <div className="value">
              ${(props.shipping.freeMinimum / 100).toFixed(2)}
            </div>
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
    padding: 0.5rem 1.75rem 1.125rem;
    position: absolute;
    top: 7rem;
    right: 0;
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
`;
