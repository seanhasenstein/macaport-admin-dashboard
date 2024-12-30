import Link from 'next/link';
import styled from 'styled-components';

export default function PageNavButtons() {
  return (
    <PageNavButtonstyles>
      <Link href="/">Dashboard home</Link>
      <Link href="/stores">All stores</Link>
      <Link href="/inventory-products">Inventory products</Link>
    </PageNavButtonstyles>
  );
}

const PageNavButtonstyles = styled.div`
  margin: 0 auto;
  width: 100%;
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  background-color: #fff;
  border-radius: 0.375rem;
  box-shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1);

  a {
    padding: 0.75rem 2rem 0.875rem;
    font-size: 0.875rem;
    font-weight: 500;
    color: #111827;
    text-align: center;
    border-top: 1px solid #e5e7eb;
    border-right: 1px solid #e5e7eb;
    border-bottom: 1px solid transparent;
    border-left: 1px solid #e5e7eb;
    transition: all 100ms linear;

    &:hover {
      background-color: #eef2f9;
      color: #0e1829;
      border-color: #d1dcef;
      z-index: 100;
    }

    &:focus-visible {
      z-index: 100;
    }

    &:not(:first-of-type) {
      margin-left: -1px;
    }

    &:first-of-type {
      border-top-left-radius: 0.375rem;
      border-bottom-left-radius: 0.375rem;
    }

    &:last-of-type {
      border-top-right-radius: 0.375rem;
      border-bottom-right-radius: 0.375rem;
    }
  }
`;
