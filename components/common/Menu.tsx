import React from 'react';
import styled from 'styled-components';
import classNames from 'classnames';
import { EllipsisVerticalIcon } from '@heroicons/react/20/solid';

import useOutsideClick from '../../hooks/useOutsideClick';

type Props = {
  children: React.ReactNode;
  customClass?: string;
  customButtonClass?: string;
  customMenuClass?: string;
  isOpen: boolean;
  closeSidebar: () => void;
  toggleSidebar: () => void;
};

export default function Menu({
  children,
  customClass,
  customButtonClass,
  customMenuClass,
  isOpen,
  closeSidebar,
  toggleSidebar,
}: Props) {
  const sidebarRef = React.useRef<HTMLDivElement>(null);

  useOutsideClick(isOpen, closeSidebar, sidebarRef);

  return (
    <MenuStyles className={classNames(customClass)}>
      <button
        type="button"
        onClick={toggleSidebar}
        className={classNames('menu-toggle-button', customButtonClass)}
      >
        <EllipsisVerticalIcon className="icon" />
        <span className="sr-only">Toggle menu</span>
      </button>
      {isOpen ? (
        <div
          ref={sidebarRef}
          className={classNames('menu-container', customMenuClass)}
        >
          {children}
        </div>
      ) : null}
    </MenuStyles>
  );
}

const MenuStyles = styled.div`
  position: relative;
  .menu-toggle-button {
    padding: 0;
    background-color: transparent;
    border: none;
    color: #71717a;
    cursor: pointer;
    transition: color 100ms ease-in-out;
    &:hover {
      color: #09090b;
    }
    .icon {
      height: 1.5rem;
      width: 1.5rem;
    }
  }
  .menu-container {
    padding: 0.25rem 1.125rem;
    position: absolute;
    right: 0;
    top: 2rem;
    white-space: nowrap;
    background: #fff;
    border: 1px solid #d4d4d8;
    border-radius: 0.625rem;
    box-shadow: rgb(255, 255, 255) 0px 0px 0px 0px,
      rgba(17, 24, 39, 0.05) 0px 0px 0px 1px,
      rgba(0, 0, 0, 0.05) 0px 4px 6px -1px, rgba(0, 0, 0, 0.05) 0px 2px 4px -1px;
  }
`;
