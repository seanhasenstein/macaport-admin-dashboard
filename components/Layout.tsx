import React from 'react';
import Head from 'next/head';
import Link from 'next/link';
import styled from 'styled-components';
import NavSidebar from './NavSidebar';

type Props = {
  children: React.ReactNode;
  title: string;
};

export default function Layout({
  children,
  title = 'Macaport Dashboard',
}: Props) {
  const [sidebarOpen, setSidebarOpen] = React.useState(false);

  return (
    <LayoutStyles>
      <Head>
        <title>{title}</title>
      </Head>
      <div>
        <header>
          <div className="logo">
            <Link href="/">
              <a>
                <img src="/images/logo.png" alt="Macaport" />
              </a>
            </Link>
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
          </div>
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
    padding: 0.875rem 0;
    display: flex;
    justify-content: center;
    background-color: #fff;
    border: 1px solid #e5e7eb;
    box-shadow: rgb(0 0 0 / 0%) 0px 0px 0px 0px, rgb(0 0 0 / 0%) 0px 0px 0px 0px,
      rgb(0 0 0 / 5%) 0px 1px 2px 0px;
  }

  .nav-button {
    padding: 0.125rem;
    position: absolute;
    right: 2rem;
    top: 1.875rem;
    display: flex;
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

  .logo img {
    width: 12rem;
  }

  footer {
    margin: 0 auto;
    padding: 1.75rem 0;
    max-width: 70rem;
    width: 100%;
    font-size: 0.9375rem;
    color: #6b7280;
    text-align: center;
    border-top: 1px solid #e5e7eb;
  }

  @media print {
    padding: 0;

    header {
      display: none;
    }
  }
`;
