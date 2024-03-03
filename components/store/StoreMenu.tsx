import React from 'react';
import styled from 'styled-components';
import Link from 'next/link';
import { CheckCircleIcon } from '@heroicons/react/24/outline';

import { StoreStatus } from '../../interfaces';

import useOutsideClick from '../../hooks/useOutsideClick';
import useEscapeKeydownClose from '../../hooks/useEscapeKeydownClose';

const baseStoreUrl = 'https://macaport.com/store';

type Props = {
  storeId: string;
  storeStatus: StoreStatus | undefined;
  setShowDeleteModal: React.Dispatch<React.SetStateAction<boolean>>;
  setShowCSVModal: React.Dispatch<React.SetStateAction<boolean>>;
  setPrintOption: React.Dispatch<
    React.SetStateAction<
      'unfulfilled' | 'personalization' | 'single' | undefined
    >
  >;
};

export default function StoreMenu({
  storeId,
  storeStatus,
  setShowDeleteModal,
  setShowCSVModal,
  setPrintOption,
}: Props) {
  const menuRef = React.useRef<HTMLDivElement>(null);
  const [showMenu, setShowMenu] = React.useState(false);
  const [copyLinkClicked, setCopyLinkClicked] = React.useState<
    'demo' | 'live' | undefined
  >(undefined);

  useOutsideClick(showMenu, setShowMenu, menuRef);
  useEscapeKeydownClose(showMenu, setShowMenu);

  const handleDeleteStoreMenuClick = () => {
    setShowMenu(false);
    setShowDeleteModal(true);
  };

  const handlePrintUnfulfilledOrders = () => {
    setPrintOption('unfulfilled');
    setShowMenu(false);
  };

  const handlePrintPersonalizedOrders = () => {
    setPrintOption('personalization');
    setShowMenu(false);
  };

  return (
    <StoreMenuStyles>
      <button
        type="button"
        onClick={() => setShowMenu(!showMenu)}
        className="menu-button"
      >
        <span className="sr-only">Menu</span>
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
            d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"
          />
        </svg>
      </button>

      <div ref={menuRef} className={`menu-container${showMenu ? ' show' : ''}`}>
        <button
          type="button"
          onClick={() => {
            console.log('todo');
          }}
          className="menu-link"
        >
          <CheckCircleIcon strokeWidth={2} />
          <span>
            Trigger a shipment
            <span className="subtitle">
              Set all fulfilled order items to shipped
            </span>
          </span>
        </button>

        <button
          type="button"
          onClick={handlePrintUnfulfilledOrders}
          className="menu-link"
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
              d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"
            />
          </svg>
          Print unfulfilled orders
        </button>

        <button
          type="button"
          onClick={handlePrintPersonalizedOrders}
          className="menu-link"
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
              d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"
            />
          </svg>
          Print personalized orders
        </button>

        <button
          type="button"
          onClick={() => {
            setShowCSVModal(true);
            setShowMenu(false);
          }}
          className="menu-link"
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
              d="M17 16v2a2 2 0 01-2 2H5a2 2 0 01-2-2v-7a2 2 0 012-2h2m3-4H9a2 2 0 00-2 2v7a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-1m-1 4l-3 3m0 0l-3-3m3 3V3"
            />
          </svg>
          Download orders to csv
        </button>

        <button
          type="button"
          className="menu-link"
          onClick={() => {
            navigator.clipboard.writeText(`${baseStoreUrl}/${storeId}/demo`);
            setCopyLinkClicked('demo');
            setTimeout(() => {
              setCopyLinkClicked(undefined);
              setShowMenu(false);
            }, 350);
          }}
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
              d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 01-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 011.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 00-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 01-1.125-1.125v-9.25m12 6.625v-1.875a3.375 3.375 0 00-3.375-3.375h-1.5a1.125 1.125 0 01-1.125-1.125v-1.5a3.375 3.375 0 00-3.375-3.375H9.75"
            />
          </svg>
          {copyLinkClicked === 'demo'
            ? 'Demo link copied!'
            : 'Copy url to demo store'}
        </button>

        <button
          type="button"
          className="menu-link"
          onClick={() => {
            navigator.clipboard.writeText(`${baseStoreUrl}/${storeId}`);
            setCopyLinkClicked('live');
            setTimeout(() => {
              setCopyLinkClicked(undefined);
              setShowMenu(false);
            }, 350);
          }}
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
              d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 01-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 011.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 00-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 01-1.125-1.125v-9.25m12 6.625v-1.875a3.375 3.375 0 00-3.375-3.375h-1.5a1.125 1.125 0 01-1.125-1.125v-1.5a3.375 3.375 0 00-3.375-3.375H9.75"
            />
          </svg>
          {copyLinkClicked === 'live'
            ? 'Link copied!'
            : `Copy url to ${storeStatus === 'open' ? 'live' : ''} store`}
        </button>

        {storeStatus === 'open' ? (
          <a
            href={`${process.env.NEXT_PUBLIC_DOMAIN}/store/${storeId}`}
            target="_blank"
            rel="noreferrer"
            className="menu-link"
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
            className="menu-link"
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
        <Link href={`/stores/${storeId}/product/add`}>
          <a className="menu-link">
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
                d="M12 9v6m3-3H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            Add a store product
          </a>
        </Link>
        <Link href={`/stores/update?id=${storeId}`}>
          <a className="menu-link">
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

        <button
          type="button"
          onClick={handleDeleteStoreMenuClick}
          className="delete-button"
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
              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
            />
          </svg>
          Delete store
        </button>
      </div>
    </StoreMenuStyles>
  );
}

const StoreMenuStyles = styled.div`
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

  .menu-container {
    margin: 0.25rem 0 0;
    padding: 0 1rem;
    position: absolute;
    right: 1rem;
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

  .menu-link,
  .delete-button {
    padding: 0.75rem 0.5rem 0.75rem 0;
    width: 100%;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    background-color: transparent;
    border: none;
    font-size: 0.875rem;
    font-weight: 400;
    color: #1f2937;
    text-align: left;
    cursor: pointer;

    .subtitle {
      margin: 0.1875rem 0 0;
      display: block;
      font-size: 0.6875rem;
      color: #6b7280;
    }

    &:hover {
      color: #000;

      .subtitle {
        color: #4b5563;
      }

      svg {
        color: #6b7280;
      }
    }

    svg {
      flex-shrink: 0;
      height: 1rem;
      width: 1rem;
      color: #9ca3af;
    }
  }

  .menu-link {
    border-bottom: 1px solid #e5e7eb;
  }

  .delete-button:hover {
    color: #991b1b;

    svg {
      color: #991b1b;
    }
  }
`;
