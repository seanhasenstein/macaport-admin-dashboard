import React from 'react';
import Link from 'next/link';
import styled from 'styled-components';

type Props = {
  storeId: string;
  currentActiveId: string | undefined;
  setCurrentActiveId: React.Dispatch<React.SetStateAction<string | undefined>>;
};

export default function StoresTableMenu({
  storeId,
  currentActiveId,
  setCurrentActiveId,
}: Props) {
  const menuRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const handleEscapeKeyup = (e: KeyboardEvent) => {
      if (e.code === 'Escape') setCurrentActiveId(undefined);
    };

    const handleOutsideClick = (e: MouseEvent) => {
      if (
        currentActiveId === storeId &&
        menuRef.current &&
        !menuRef.current.contains(e.target as Node)
      ) {
        setCurrentActiveId(undefined);
      }
    };

    if (currentActiveId) {
      document.addEventListener('keyup', handleEscapeKeyup);
      document.addEventListener('click', handleOutsideClick);
    }

    return () => {
      document.removeEventListener('keyup', handleEscapeKeyup);
      document.removeEventListener('click', handleOutsideClick);
    };
  }, [currentActiveId, storeId, setCurrentActiveId]);

  const handleMenuButtonClick = (id: string) => {
    if (currentActiveId === id) {
      setCurrentActiveId(undefined);
    } else {
      setCurrentActiveId(id);
    }
  };

  return (
    <StoresTableMenuStyles>
      <button
        type="button"
        className="menu-button"
        onClick={() => handleMenuButtonClick(storeId)}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path d="M6 10a2 2 0 11-4 0 2 2 0 014 0zM12 10a2 2 0 11-4 0 2 2 0 014 0zM16 12a2 2 0 100-4 2 2 0 000 4z" />
        </svg>
      </button>
      <div
        ref={menuRef}
        className={`menu ${currentActiveId === storeId ? 'show' : ''}`}
      >
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
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
              />
            </svg>
            View Store
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
                d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"
              />
            </svg>
            Edit Store
          </a>
        </Link>
        <Link href={`/stores/${storeId}?active=orders`}>
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
                d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
              />
            </svg>
            Store Orders
          </a>
        </Link>
      </div>
    </StoresTableMenuStyles>
  );
}

const StoresTableMenuStyles = styled.div`
  .menu-button {
    margin-left: auto;
    padding: 0.125rem;
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
      height: 1rem;
      width: 1rem;
    }
  }

  .menu {
    padding: 0 1rem;
    position: absolute;
    right: 1.5rem;
    top: 2.25rem;
    width: 10.75rem;
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
    padding: 0.75rem 2rem 0.75rem 0;
    width: 100%;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    background-color: transparent;
    border: none;
    font-size: 0.875rem;
    font-weight: 400;
    color: #111827;
    line-height: 1;
    text-align: left;
    cursor: pointer;
    border-bottom: 1px solid #e5e7eb;

    &:last-of-type {
      border-bottom: none;
    }

    &:hover {
      color: #4338ca;

      svg {
        color: #4338ca;
      }
    }

    svg {
      height: 1rem;
      width: 1rem;
      color: #9ca3af;
    }
  }
`;
