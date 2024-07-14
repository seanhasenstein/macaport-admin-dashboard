import React from 'react';
import styled from 'styled-components';
import { EllipsisVerticalIcon } from '@heroicons/react/20/solid';
import { PencilIcon, FolderOpenIcon } from '@heroicons/react/24/outline';

import useOutsideClick from '../../hooks/useOutsideClick';
import useEscapeKeydownClose from '../../hooks/useEscapeKeydownClose';

import { SizeChart } from '../../interfaces';

type Props = {
  sizeChart: SizeChart | undefined;
  handleSizeChartClick: (mode: 'view' | 'edit') => void;
};

export default function InventoryProductTableMenu({
  sizeChart,
  handleSizeChartClick,
}: Props) {
  const menuRef = React.useRef<HTMLDivElement>(null);
  const [showMenu, setShowMenu] = React.useState(false);
  useOutsideClick(showMenu, setShowMenu, menuRef);
  useEscapeKeydownClose(showMenu, setShowMenu);

  const addEditSizeChartCopy = sizeChart?.length
    ? 'Edit Size Chart'
    : 'Add Size Chart';

  return (
    <InventoryProductTableMenuStyles>
      <button
        type="button"
        onClick={() => setShowMenu(!showMenu)}
        className="menu-button"
      >
        <EllipsisVerticalIcon className="ellipsis-icon" />
      </button>
      <div ref={menuRef} className={`menu-container${showMenu ? ' show' : ''}`}>
        <button
          type="button"
          className="menu-link-button"
          onClick={() => {
            handleSizeChartClick('edit');
            setShowMenu(false);
          }}
        >
          <PencilIcon />
          {addEditSizeChartCopy}
        </button>
        {sizeChart?.length && (
          <button
            type="button"
            className="menu-link-button"
            onClick={() => {
              handleSizeChartClick('view');
              setShowMenu(false);
            }}
          >
            <FolderOpenIcon />
            View size chart
          </button>
        )}
      </div>
    </InventoryProductTableMenuStyles>
  );
}

const InventoryProductTableMenuStyles = styled.div`
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

    .ellipsis-icon {
      height: 1.25rem;
      width: 1.25rem;
    }

    &:hover {
      color: #111827;
    }
  }

  .menu-container {
    margin: 0.25rem 0 0;
    padding: 0 1rem;
    position: absolute;
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

  .menu-link-button {
    padding: 0.75rem 0;
    width: 100%;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    background-color: transparent;
    border: none;
    border-bottom: 1px solid #e5e7eb;
    font-size: 0.8125rem;
    font-weight: 500;
    color: #1f2937;
    text-align: left;
    cursor: pointer;

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
      height: 1rem;
      width: 1rem;
      color: #9ca3af;
    }
  }
`;
