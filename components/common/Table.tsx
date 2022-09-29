import React from 'react';
import styled from 'styled-components';

type Props = {
  children: React.ReactNode;
  [props: string]: unknown;
};

export default function Table({ children, ...props }: Props) {
  return <TableStyles {...props}>{children}</TableStyles>;
}

const TableStyles = styled.div`
  width: 100%;
  background-color: #fff;
  border-width: 1px 1px 0 1px;
  border-style: solid;
  border-color: #d1d5db;
  border-radius: 0.25rem;
  box-shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1);

  table {
    width: 100%;
    border-collapse: collapse;
  }

  th,
  td {
    &:first-of-type {
      padding-left: 2rem;
    }

    &:last-of-type {
      padding-right: 2rem;
    }
  }

  tr:last-of-type td {
    border-bottom: none;
  }

  th {
    padding: 1rem;
    background-color: #e8eaee;
    border-bottom: 1px solid #d1d5db;
    font-size: 0.75rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.0375em;
    color: #374151;

    &:first-of-type {
      border-top-left-radius: 0.25rem;
    }

    &:last-of-type {
      border-top-right-radius: 0.25rem;
    }

    &.status svg {
      height: 1.25rem;
      width: 1.25rem;
      color: #6b7280;
    }
  }

  td {
    padding: 1.125rem 1rem;
    font-size: 0.875rem;
    font-weight: 500;
    color: #374151;
    border-bottom: 1px solid #e5e7eb;

    a {
      &:hover {
        text-decoration: underline;
      }

      &:focus {
        outline: 2px solid transparent;
        outline-offset: 2px;
      }

      &:focus-visible {
        text-decoration: underline;
        color: #1c44b9;
      }
    }
  }
`;
