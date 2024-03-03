import React from 'react';
import Link from 'next/link';
import styled from 'styled-components';
import useOutsideClick from '../../hooks/useOutsideClick';
import useEscapeKeydownClose from '../../hooks/useEscapeKeydownClose';
import { getStoreStatus } from '../../utils';
import { CheckCircleIcon } from '@heroicons/react/24/outline';

type Props = {
  storeId: string;
  openDate: string;
  closeDate: string | null;
};

export default function StoresTableMenu({
  storeId,
  openDate,
  closeDate,
}: Props) {
  const menuRef = React.useRef<HTMLDivElement>(null);
  const storeStatus = getStoreStatus(openDate, closeDate);
  const [showMenu, setShowMenu] = React.useState(false);
  useOutsideClick(showMenu, setShowMenu, menuRef);
  useEscapeKeydownClose(showMenu, setShowMenu);

  return (
    <StoresTableMenuStyles>
      <button
        type="button"
        className="menu-button"
        onClick={() => setShowMenu(!showMenu)}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path d="M6 10a2 2 0 11-4 0 2 2 0 014 0zM12 10a2 2 0 11-4 0 2 2 0 014 0zM16 12a2 2 0 100-4 2 2 0 000 4z" />
        </svg>
      </button>
      <div ref={menuRef} className={`menu ${showMenu ? 'show' : ''}`}>
        <Link href={`/stores/${storeId}`}>
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
            View store data
          </a>
        </Link>
        <Link href={`/stores/${storeId}#orders`}>
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
                d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
              />
            </svg>
            Store orders
          </a>
        </Link>
        <Link href={`/stores/update?id=${storeId}`}>
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
                d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
            Edit store
          </a>
        </Link>
        {storeStatus === 'open' ? (
          <a
            href={`${process.env.NEXT_PUBLIC_DOMAIN}/store/${storeId}`}
            target="_blank"
            rel="noreferrer"
            className="link"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"
              />
            </svg>
            Go to live store
          </a>
        ) : (
          <a
            href={`${process.env.NEXT_PUBLIC_DOMAIN}/store/${storeId}/demo`}
            target="_blank"
            rel="noreferrer"
            className="link"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"
              />
            </svg>
            Go to demo store
          </a>
        )}
        <button
          type="button"
          onClick={() => {
            console.log('todo');
          }}
          className="button"
        >
          <CheckCircleIcon strokeWidth={2} />
          <span>
            Trigger a shipment
            <span className="subtitle">
              Set all fulfilled order items to shipped
            </span>
          </span>
        </button>
      </div>
    </StoresTableMenuStyles>
  );
}

const StoresTableMenuStyles = styled.div`
  .menu-button {
    margin-left: auto;
    padding: 0.125rem;
    height: 1.5rem;
    width: 1.5rem;
    display: flex;
    justify-content: center;
    align-items: center;
    background-color: transparent;
    border: none;
    border-radius: 0.3125rem;
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
    right: 1.5rem;
    top: 3rem;
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

  .link,
  .button {
    padding: 0.75rem 1.25rem 0.75rem 0;
    width: 100%;
    display: flex;
    align-items: center;
    gap: 0.4375rem;
    background-color: transparent;
    border: none;
    font-size: 0.875rem;
    font-weight: 400;
    color: #1f2937;
    line-height: 1;
    text-align: left;
    cursor: pointer;
    border-bottom: 1px solid #e5e7eb;

    .subtitle {
      margin: 0.1875rem 0 0;
      display: block;
      font-size: 0.6875rem;
      color: #6b7280;
      text-decoration: none;
    }

    &:last-child {
      border-bottom: none;
    }

    &:hover {
      color: #000;
      text-decoration: none;

      svg {
        color: #6b7280;
      }
    }

    svg {
      height: 0.9375rem;
      width: 0.9375rem;
      color: #9ca3af;
    }
  }
`;
