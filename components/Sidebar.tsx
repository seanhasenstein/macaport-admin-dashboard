// Sidebar.tsx

import React from 'react';
import styled from 'styled-components';
import classNames from 'classnames';
import { XMarkIcon } from '@heroicons/react/20/solid';

import useEscapeKeydownClose from '../hooks/useEscapeKeydownClose';
import useOutsideClick from '../hooks/useOutsideClick';

type Props = {
  children: React.ReactNode;
  customClassName?: string;
  isOpen: boolean;
  closeSidebar: () => void;
  headerTitle: string;
  allowBodyScroll?: boolean;
};

export default function Sidebar({
  children,
  customClassName,
  isOpen,
  closeSidebar,
  headerTitle,
  allowBodyScroll = false,
}: Props) {
  const sidebarRef = React.useRef<HTMLDivElement>(null);

  useOutsideClick(isOpen, closeSidebar, sidebarRef);
  useEscapeKeydownClose(isOpen, closeSidebar);

  React.useEffect(() => {
    if (isOpen && !allowBodyScroll) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'inherit';
    }

    return () => {
      document.body.style.overflow = 'inherit';
    };
  }, [isOpen, allowBodyScroll]);

  return (
    <SidebarStyles>
      <div className={isOpen ? 'overlay' : ''} />
      <div
        ref={sidebarRef}
        className={classNames(customClassName, 'sidebar-container', {
          open: isOpen,
        })}
      >
        {headerTitle && (
          <div className="sidebar-header">
            <h3 className="title">{headerTitle}</h3>
            <button
              type="button"
              className="close-button"
              onClick={closeSidebar}
            >
              <XMarkIcon className="icon" />
            </button>
          </div>
        )}
        {children}
      </div>
    </SidebarStyles>
  );
}

const SidebarStyles = styled.div`
  .overlay {
    position: fixed;
    top: 0;
    left: 0;
    height: 100vh;
    width: 100%;
    background-color: rgba(0, 0, 0, 0.4);
    z-index: 100;
  }
  .sidebar-container {
    overflow-y: auto;
    position: fixed;
    top: 10px;
    right: 10px;
    bottom: 10px;
    max-width: 32rem;
    width: 100%;
    background-color: #f9fafb;
    border: 1px solid #d1d5db;
    border-radius: 0.625rem;
    box-shadow: 0 0 10px 6px rgb(0 0 0 / 0.05),
      inset 0 0 0 2px rgba(229, 231, 235, 0.9);
    transform: translateX(120%);
    transition: transform 400ms ease-in-out;
    z-index: 100;
    &.open {
      transform: translateX(0);
    }
    .sidebar-header {
      padding: 1.25rem 1.75rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-radius: 0.625rem 0.625rem 0rem 0rem;
      border-bottom: 1px solid #e5e7eb;
      background: #fff;
      box-shadow: 0px 1px 2px 0px rgba(0, 0, 0, 0.05);
      .title {
        margin: 0;
        color: #030712;
        font-size: 1.0625rem;
        font-weight: 600;
        line-height: 100%;
      }
      .close-button {
        padding: 0 0.25rem;
        display: flex;
        justify-content: center;
        align-items: center;
        background-color: transparent;
        color: #a1a1aa;
        border: none;
        cursor: pointer;
        transition: color 100ms ease-in-out;
        .icon {
          width: 1.5rem;
          height: 1.5rem;
        }
        &:hover {
          color: #27272a;
        }
      }
    }
  }
`;
