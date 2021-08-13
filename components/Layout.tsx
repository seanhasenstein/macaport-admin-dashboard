import Link from 'next/link';
import styled from 'styled-components';
import { signOut } from 'next-auth/client';

type Props = {
  children: React.ReactNode;
};

export default function Layout({ children }: Props) {
  return (
    <LayoutStyles>
      <header>
        <div className="logo">
          <Link href="/">
            <a>
              <img
                src="/images/logo.png"
                alt="Macaport logo in front of mountains"
              />
            </a>
          </Link>
        </div>
        <nav>
          <Link href="/">
            <a>
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
                  d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                />
              </svg>
              Home
            </a>
          </Link>
          <Link href="/stores">
            <a>
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
                  d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
              Stores
            </a>
          </Link>
          <Link href="/orders">
            <a>
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
                  d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                />
              </svg>
              Orders
            </a>
          </Link>
        </nav>
        <button
          type="button"
          className="logout-button"
          onClick={() =>
            signOut({ callbackUrl: 'http://localhost:3000/login' })
          }
        >
          Sign Out
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
      </header>
      <main>{children}</main>
    </LayoutStyles>
  );
}

const LayoutStyles = styled.div`
  padding: 0 0 0 20rem;
  position: relative;

  header {
    padding: 1.5rem 2rem 2rem;
    display: flex;
    flex-direction: column;
    width: 20rem;
    height: 100vh;
    position: fixed;
    top: 0;
    left: 0;
    background-color: #f3f4f6;
    border-right: 1px solid #e5e7eb;
  }

  .logo img {
    width: 200px;
  }

  nav {
    margin: 1.125rem 0;
    padding: 0.5rem 0;
    display: flex;
    flex-direction: column;

    a {
      padding: 0.75rem 0;
      display: flex;
      align-items: center;
      font-size: 1rem;
      font-weight: 500;
      color: #374151;
      border-bottom: 1px solid #e5e7eb;

      &:not(:first-of-type) {
        text-decoration: line-through;
      }

      &:last-of-type {
        border-bottom: none;
      }

      &:hover {
        color: #000;
      }

      svg {
        margin: 0 0.625rem 0 0;
        height: 1.125rem;
        width: 1.125rem;
        color: #9ca3af;
      }
    }
  }

  .logout-button {
    padding: 0.5rem 0;
    margin-top: auto;
    display: flex;
    justify-content: center;
    align-items: center;
    background-color: #fff;
    border: 1px solid #e5e7eb;
    font-size: 0.875rem;
    font-weight: 500;
    color: #374151;
    border-radius: 0.25rem;
    cursor: pointer;

    svg {
      margin: 0 0 0 0.25rem;
      height: 0.875rem;
      width: 0.875rem;
      color: #9ca3af;
    }

    &:hover {
      border-color: #d1d5db;
    }
  }

  @media print {
    padding: 0;

    header {
      display: none;
    }
  }
`;
