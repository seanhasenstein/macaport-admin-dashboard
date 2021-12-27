import React from 'react';
import { signOut } from 'next-auth/client';
import styled from 'styled-components';
import useEscapeKeydownClose from '../hooks/useEscapeKeydownClose';
import useOutsideClick from '../hooks/useOutsideClick';

type Props = {
  sidebarOpen: boolean;
  setSidebarOpen: React.Dispatch<React.SetStateAction<boolean>>;
};

export default function NavSidebar({ sidebarOpen, setSidebarOpen }: Props) {
  const containerRef = React.useRef<HTMLDivElement>(null);
  useEscapeKeydownClose(sidebarOpen, setSidebarOpen);
  useOutsideClick(sidebarOpen, setSidebarOpen, containerRef);

  return (
    <NavSidebarStyles
      ref={containerRef}
      className={`sidebar-nav${sidebarOpen ? ' open' : ''}`}
    >
      <button
        type="button"
        onClick={() => setSidebarOpen(false)}
        className="close-sidebar-button"
        tabIndex={sidebarOpen ? 0 : -1}
      >
        <span className="sr-only">Close sidebar</span>
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
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      </button>
      <button
        type="button"
        onClick={() => signOut({ callbackUrl: '/login' })}
        className="logout-button"
        tabIndex={sidebarOpen ? 0 : -1}
      >
        Log out
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
            d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
          />
        </svg>
      </button>
    </NavSidebarStyles>
  );
}

const NavSidebarStyles = styled.div`
  padding: 2rem;
  width: 300px;
  position: fixed;
  top: 0;
  right: -100%;
  bottom: 0;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  background-color: #fff;
  box-shadow: 0 25px 50px -12px rgb(0 0 0 / 0.25);
  z-index: 9999;
  transition: right 500ms ease-in-out;

  &.open {
    right: 0;
  }

  .logout-button {
    padding: 0.4375rem;
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100%;
    color: #475569;
    font-size: 0.875rem;
    font-weight: 500;
    text-align: center;
    line-height: 1;
    background-color: #e2e8f0;
    border: 1px solid #cbd5e1;
    border-radius: 0.25rem;
    box-shadow: inset 0 1px 1px #fff, 0 1px 2px 0 rgb(0 0 0 / 0.05);
    cursor: pointer;

    svg {
      margin: 0 0 0 0.25rem;
      height: 0.8125rem;
      width: 0.8125rem;
      color: #94a3b8;
    }

    &:hover {
      border-color: #bfcbda;
      box-shadow: inset 0 1px 1px #fff, 0 1px 2px 0 rgb(0 0 0 / 0.1);
    }

    &:focus {
      outline: 2px solid transparent;
      outline-offset: 2px;
    }

    &:focus-visible {
      box-shadow: rgb(255, 255, 255) 0px 0px 0px 2px,
        rgb(99, 102, 241) 0px 0px 0px 4px, rgba(0, 0, 0, 0) 0px 0px 0px 0px;
    }
  }

  .close-sidebar-button {
    padding: 0.125rem;
    position: absolute;
    top: 1.5rem;
    right: 1.5rem;
    display: flex;
    justify-content: center;
    align-items: center;
    background-color: transparent;
    border: none;
    cursor: pointer;

    svg {
      height: 1.25rem;
      width: 1.25rem;
    }
  }
`;
