import React from 'react';
import { signOut } from 'next-auth/client';
import styled from 'styled-components';
import useEscapeKeydownClose from '../hooks/useEscapeKeydownClose';
import useOutsideClick from '../hooks/useOutsideClick';
import Link from 'next/link';

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
      <div>
        <div className="header">
          <h3>Dashboard navigation</h3>
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
        </div>
        <div className="main-nav">
          <Link href="/">Home</Link>
          <Link href="/stores">Stores</Link>
          <Link href="/inventory-products">Inventory products</Link>
          <Link href="stores/create">Create a store</Link>
          <Link href="inventory-products/create">Create inventory product</Link>
          <a
            href="https://dashboard.stripe.com/dashboard"
            target="_blank"
            rel="noreferrer"
          >
            Stripe dashboard
          </a>
        </div>
      </div>
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
  padding: 1.5rem 2rem 2rem;
  width: 20rem;
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  background-color: #fff;
  box-shadow: 0 25px 50px -12px rgb(0 0 0 / 0.25);
  z-index: 9999;
  transform: translateX(100%);
  transition: transform 200ms linear;

  &.open {
    transform: translateX(0);
  }

  h3 {
    margin: 0;
    font-size: 0.875rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.025em;
  }

  .header {
    margin: 0 0 1.5rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .main-nav {
    display: flex;
    flex-direction: column;

    a {
      padding: 0.75rem 0;
      font-size: 0.9375rem;
      font-weight: 500;
      color: #374151;
      border-bottom: 1px solid #e5e7eb;
      transition: color 150ms linear;

      &:first-of-type {
        border-top: 1px solid #e5e7eb;
      }

      &:hover {
        color: #000;
      }

      &:focus {
        outline: none;
      }

      &:focus-visible {
        color: #1c44b9;
        text-decoration: underline;
      }
    }
  }

  .logout-button {
    padding: 0.5rem;
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100%;
    color: #f3f4f6;
    font-size: 0.875rem;
    font-weight: 500;
    text-align: center;
    line-height: 1;
    background-color: #111827;
    border: none;
    border-radius: 0.25rem;
    cursor: pointer;
    transition: all 200ms linear;

    svg {
      margin: 0 0 0 0.25rem;
      height: 0.8125rem;
      width: 0.8125rem;
      color: #6b7280;
    }

    &:hover {
      background-color: #1f2937;
      color: #fff;
    }

    &:focus {
      outline: 2px solid transparent;
      outline-offset: 2px;
    }

    &:focus-visible {
      box-shadow: rgb(255, 255, 255) 0px 0px 0px 2px, #1c44b9 0px 0px 0px 4px,
        rgba(0, 0, 0, 0) 0px 0px 0px 0px;
    }
  }

  .close-sidebar-button {
    padding: 0.125rem;
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
