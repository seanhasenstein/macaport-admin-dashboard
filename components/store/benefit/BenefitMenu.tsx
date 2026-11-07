import React from 'react';
import styled from 'styled-components';
import { EllipsisVerticalIcon } from '@heroicons/react/20/solid';
import {
  ArrowDownTrayIcon,
  PencilSquareIcon,
  TrashIcon,
} from '@heroicons/react/24/outline';
import useOutsideClick from '../../../hooks/useOutsideClick';
import useEscapeKeydownClose from '../../../hooks/useEscapeKeydownClose';

type Props = {
  onEdit: () => void;
  onExport: () => void;
  canExport: boolean;
  onDelete: () => void;
};

// The less-used actions, behind the same kebab the store header uses, with
// delete last and red so it is never hit by accident.
export default function BenefitMenu({
  onEdit,
  onExport,
  canExport,
  onDelete,
}: Props) {
  const wrapperRef = React.useRef<HTMLDivElement>(null);
  const [showMenu, setShowMenu] = React.useState(false);

  useOutsideClick(showMenu, setShowMenu, wrapperRef);
  useEscapeKeydownClose(showMenu, setShowMenu);

  const run = (action: () => void) => () => {
    setShowMenu(false);
    action();
  };

  return (
    <MenuStyles ref={wrapperRef}>
      <button
        type="button"
        onClick={() => setShowMenu(!showMenu)}
        className="menu-button"
        aria-haspopup="menu"
        aria-expanded={showMenu}
      >
        <span className="sr-only">Benefit menu</span>
        <EllipsisVerticalIcon aria-hidden="true" />
      </button>

      <div className={`menu-container${showMenu ? ' show' : ''}`} role="menu">
        <button type="button" className="menu-link" onClick={run(onEdit)}>
          <PencilSquareIcon aria-hidden="true" />
          Edit benefit
        </button>
        <button
          type="button"
          className="menu-link"
          onClick={run(onExport)}
          disabled={!canExport}
        >
          <ArrowDownTrayIcon aria-hidden="true" />
          Export per-member CSV
        </button>
        <button type="button" className="delete-button" onClick={run(onDelete)}>
          <TrashIcon aria-hidden="true" />
          Delete benefit
        </button>
      </div>
    </MenuStyles>
  );
}

const MenuStyles = styled.div`
  position: relative;

  .menu-button {
    padding: 0;
    height: 2rem;
    width: 2rem;
    display: flex;
    justify-content: center;
    align-items: center;
    background-color: transparent;
    border: none;
    color: #6b7280;
    border-radius: 0.3125rem;
    cursor: pointer;

    svg {
      height: 1.25rem;
      width: 1.25rem;
    }

    &:hover {
      color: #111827;
    }
  }

  @keyframes menuOpen {
    from {
      opacity: 0;
      transform: scale(0.96) translateY(-4px);
    }
    to {
      opacity: 1;
      transform: scale(1) translateY(0);
    }
  }

  .menu-container {
    position: absolute;
    top: calc(100% + 0.375rem);
    right: 0;
    min-width: 15rem;
    padding: 0.375rem 0;
    display: none;
    flex-direction: column;
    align-items: stretch;
    background-color: #fff;
    border: 1px solid #d1d5db;
    border-radius: 0.5rem;
    box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1),
      0 4px 6px -4px rgb(0 0 0 / 0.1);
    z-index: 100;
    transform-origin: top right;

    &.show {
      display: flex;
      animation: menuOpen 120ms ease-out;

      @media (prefers-reduced-motion: reduce) {
        animation: none;
      }
    }
  }

  .menu-link,
  .delete-button {
    padding: 0.625rem 0.875rem;
    width: 100%;
    display: flex;
    align-items: center;
    gap: 0.625rem;
    background-color: transparent;
    border: none;
    text-align: left;
    font-size: 0.875rem;
    font-weight: 500;
    color: #1f2937;
    cursor: pointer;

    svg {
      flex-shrink: 0;
      height: 1rem;
      width: 1rem;
      color: #6b7280;
    }

    &:hover:not(:disabled) {
      background-color: #f3f4f6;

      svg {
        color: #4b5563;
      }
    }

    &:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    &:focus {
      outline: 2px solid transparent;
      outline-offset: 2px;
    }

    &:focus-visible {
      background-color: #f3f4f6;
    }
  }

  .delete-button {
    margin-top: 0.25rem;
    border-top: 1px solid #f3f4f6;

    &:hover {
      color: #991b1b;
      background-color: #fef2f2;

      svg {
        color: #991b1b;
      }
    }
  }
`;
