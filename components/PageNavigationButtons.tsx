import Link from 'next/link';
import styled from 'styled-components';

export default function PageNavigationButtons() {
  return (
    <PageNavigationButtonStyles>
      <Link href="/stores">All stores</Link>
      <Link href="/inventory-products">Inventory products</Link>
      <Link href="/stores/create">Create a store</Link>
      <Link href="/inventory-products/create">Create an inventory product</Link>
    </PageNavigationButtonStyles>
  );
}

const PageNavigationButtonStyles = styled.div`
  margin: 0 auto 3.5rem;
  display: grid;
  grid-template-columns: 1fr 1fr 1fr 1fr;
  background-color: #fff;
  border-radius: 0.375rem;
  box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05);

  a {
    padding: 0.75rem 2rem 0.875rem;
    font-size: 0.875rem;
    font-weight: 500;
    color: #111827;
    text-align: center;
    border: 1px solid #e5e7eb;
    transition: all 150ms linear;

    &:hover {
      background-color: #fcfcfd;
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
