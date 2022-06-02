import React from 'react';
import styled from 'styled-components';
import { usePagination } from '../hooks/usePagination';

type Props = {
  currentPage: number;
  setCurrentPage: React.Dispatch<React.SetStateAction<number | undefined>>;
  pageSize: number;
  count: number;
};

export default function Pagination({
  currentPage,
  setCurrentPage,
  pageSize,
  count,
}: Props) {
  const totalPageCount = Math.ceil(count / pageSize);
  const paginationRange = usePagination({ count, pageSize, currentPage });

  const handleClick = (clickedPage: number) => {
    if (currentPage === clickedPage) {
      return;
    }
    setCurrentPage(clickedPage);
  };

  if (currentPage === 0 || paginationRange.length < 2) {
    return null;
  }

  return (
    <PaginationStyles>
      <p>
        Showing{' '}
        <span className="bold">{currentPage * pageSize - pageSize + 1}</span> to{' '}
        <span className="bold">
          {count < currentPage * pageSize ? count : currentPage * pageSize}
        </span>{' '}
        of <span className="bold">{count}</span> results
      </p>
      <div className="buttons">
        <button
          type="button"
          disabled={currentPage === 1}
          onClick={() => setCurrentPage(Math.max(currentPage - 1, 1))}
          className="previous-button"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={3}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15 19l-7-7 7-7"
            />
          </svg>
          <span className="sr-only">First page</span>
        </button>

        {paginationRange.map((rangeItem, index) => {
          if (typeof rangeItem === 'number') {
            return (
              <button
                key={index}
                onClick={() => handleClick(rangeItem)}
                className={currentPage === rangeItem ? 'active' : ''}
              >
                {rangeItem}
              </button>
            );
          } else {
            return (
              <div key={index} className="ellipses">
                {rangeItem}
              </div>
            );
          }
        })}

        <button
          type="button"
          disabled={currentPage === totalPageCount}
          onClick={() => setCurrentPage(currentPage + 1)}
          className="next-button"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={3}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9 5l7 7-7 7"
            />
          </svg>
          <span className="sr-only">Next page</span>
        </button>
      </div>
    </PaginationStyles>
  );
}

const PaginationStyles = styled.div`
  margin: 2rem 0 0;
  display: flex;
  justify-content: space-between;
  align-items: center;

  p {
    margin: 0;
  }

  .bold {
    font-weight: 500;
  }

  .buttons {
    display: flex;
    border-radius: 0.375rem;
    box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05);
  }

  button,
  .ellipses {
    margin: 0 0 0 -1px;
    display: flex;
    justify-content: center;
    align-items: center;
    background-color: #fff;
    border: 1px solid #d1d5db;
    border-radius: 0;
  }

  button {
    padding: 0.5rem 1rem;
    color: #6b7280;
    font-weight: 500;
    cursor: pointer;

    &.previous-button,
    &.next-button {
      padding: 0.75rem;
    }

    &.active,
    &.active:hover {
      background-color: #f0fdfa;
      border-color: #14b8a6;
      color: #0f766e;
      z-index: 100;
    }

    &:hover {
      background-color: #f9fafb;

      &:disabled {
        background-color: #fff;
      }
    }

    &:disabled {
      cursor: pointer;
      pointer-events: none;
    }

    &:focus-visible {
      z-index: 200;
    }

    &:first-of-type {
      border-top-left-radius: 0.375rem;
      border-bottom-left-radius: 0.375rem;
    }

    &:last-of-type {
      border-top-right-radius: 0.375rem;
      border-bottom-right-radius: 0.375rem;
    }

    svg {
      height: 0.875rem;
      width: 0.875rem;
    }
  }

  .ellipses {
    padding: 0.5rem 0.875rem;
    color: #374151;
  }
`;
