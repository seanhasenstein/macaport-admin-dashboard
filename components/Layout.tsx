import React from 'react';
import Head from 'next/head';
import Link from 'next/link';
import styled from 'styled-components';
import AuthorizedRoute from './AuthorizedRoute';
import NavSidebar from './NavSidebar';

type Props = {
  children: React.ReactNode;
  title?: string;
  loading?: boolean;
  requiresAuth: boolean;
};

export default function Layout({
  children,
  loading = false,
  title = 'Macaport Dashboard',
  requiresAuth,
}: Props) {
  const [sidebarOpen, setSidebarOpen] = React.useState(false);

  return (
    <AuthorizedRoute required={requiresAuth}>
      <LayoutStyles>
        <Head>
          <title>{loading ? 'Loading...' : title}</title>
        </Head>
        <div>
          <header>
            <div className="logo">
              <Link href="/">
                <a>
                  <img src="/images/logo.png" alt="Macaport" />
                </a>
              </Link>
            </div>
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              className="nav-button"
            >
              <span className="sr-only">
                {sidebarOpen ? 'Close' : 'Open'} sidebar
              </span>
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
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>
            <NavSidebar
              sidebarOpen={sidebarOpen}
              setSidebarOpen={setSidebarOpen}
            />
          </header>
          <main>{children}</main>
        </div>
        <footer>
          © Macaport {new Date().getFullYear()}. All Rights Reserved.
        </footer>
      </LayoutStyles>
    </AuthorizedRoute>
  );
}

const LayoutStyles = styled.div`
  min-height: 100%;
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: space-between;

  header {
    position: relative;
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 0.875rem 1.5rem;
    background-color: #fff;
    box-shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1);
  }

  .logo img {
    width: 12rem;
  }

  .nav-button {
    padding: 0.125rem;
    position: absolute;
    right: 2rem;
    display: inline-flex;
    justify-content: center;
    align-items: center;
    background-color: transparent;
    border: none;
    color: #374151;
    cursor: pointer;

    svg {
      height: 1.375rem;
      width: 1.375rem;
    }

    &:hover {
      color: #111827;
    }
  }

  footer {
    margin: 0 auto;
    padding: 1.75rem 0;
    max-width: 74rem;
    width: 100%;
    font-size: 0.9375rem;
    color: #6b7280;
    text-align: center;
    border-top: 1px solid #d1d5db;
  }

  @media print {
    padding: 0;

    header {
      display: none;
    }
  }
`;
