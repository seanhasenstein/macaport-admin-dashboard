import React from 'react';
import Link from 'next/link';
import styled from 'styled-components';
import useOutsideClick from '../../hooks/useOutsideClick';
import useEscapeKeydownClose from '../../hooks/useEscapeKeydownClose';

type Props = {
  inventoryProductId: string;
};

export default function StoreProductSkusTableMenu({
  inventoryProductId,
}: Props) {
  const menuRef = React.useRef<HTMLDivElement>(null);
  const [showMenu, setShowMenu] = React.useState(false);
  useOutsideClick(showMenu, setShowMenu, menuRef);
  useEscapeKeydownClose(showMenu, setShowMenu);

  return (
    <StoreProductSkusTableMenuStyles>
      <div className="menu-container text-right">
        <button
          type="button"
          onClick={() => setShowMenu(!showMenu)}
          className="menu-button"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z"
            />
          </svg>
          <span className="sr-only">Menu</span>
        </button>
      </div>
      <div ref={menuRef} className={`menu ${showMenu ? 'show' : ''}`}>
        <Link href={`/inventory-products/${inventoryProductId}`}>
          <a className="link">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            View inventory product
          </a>
        </Link>
      </div>
    </StoreProductSkusTableMenuStyles>
  );
}

const StoreProductSkusTableMenuStyles = styled.div`
  position: relative;

  .menu-button {
    margin-left: auto;
    height: 1.5rem;
    width: 2rem;
    display: flex;
    justify-content: center;
    align-items: center;
    background-color: transparent;
    border: none;
    color: #6b7280;
    cursor: pointer;

    &:hover {
      color: #111827;
    }

    svg {
      flex-shrink: 0;
      height: 1rem;
      width: 1rem;
    }
  }

  .menu {
    padding: 0 1rem;
    position: absolute;
    top: 1.25rem;
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

  .link {
    padding: 0.75rem 1.25rem 0.75rem 0;
    width: 100%;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    background-color: transparent;
    border: none;
    font-size: 0.875rem;
    font-weight: 400;
    color: #1f2937;
    line-height: 1;
    text-align: left;
    cursor: pointer;
    border-bottom: 1px solid #e5e7eb;

    &:last-child {
      border-bottom: none;
    }

    &:hover {
      color: #111827;

      svg {
        color: #6b7280;
      }
    }

    svg {
      flex-shrink: 0;
      height: 0.9375rem;
      width: 0.9375rem;
      color: #9ca3af;
    }
  }
`;
