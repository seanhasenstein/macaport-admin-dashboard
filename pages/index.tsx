import React from 'react';
import Link from 'next/link';
import styled from 'styled-components';
import Layout from '../components/Layout';

const ACTIVE_STORES = [
  {
    id: 1,
    name: 'Sheboygan Lutheran XC',
    slug: '/sheboygan-lutheran-xc',
    closeDate: 'July 5, 2021',
    contact: {
      name: 'Sean Hasenstein',
      email: 'seanhasenstein@gmail.com',
      phone: '9202075984',
    },
  },
  {
    id: 2,
    name: 'New London High School XC',
    slug: '/new-london-high-school-xc',
    closeDate: 'None',
    contact: {
      name: 'Sean Hasenstein',
      email: 'seanhasenstein@gmail.com',
      phone: '9202075984',
    },
  },
  {
    id: 3,
    name: '8th Street Ale House',
    slug: '8th-street-ale-house',
    closeDate: 'July 5, 2021',
    contact: {
      name: 'Sean Hasenstein',
      email: 'seanhasenstein@gmail.com',
      phone: '9202075984',
    },
  },
  {
    id: 4,
    name: 'Middleton HS Track & Field',
    slug: 'middleton-hs-track-field',
    closeDate: 'July 5, 2021',
    contact: {
      name: 'Sean Hasenstein',
      email: 'seanhasenstein@gmail.com',
      phone: '9202075984',
    },
  },
  {
    id: 5,
    name: "Kohler MS Boy's Basketball",
    slug: 'kohler-ms-boys-basketball',
    closeDate: 'July 5, 2021',
    contact: {
      name: 'Sean Hasenstein',
      email: 'seanhasenstein@gmail.com',
      phone: '9202075984',
    },
  },
];

const DashboardStyles = styled.div`
  .title {
    padding: 1.625rem 2.5rem;
    border-bottom: 1px solid #e5e7eb;
  }

  h2 {
    margin: 0;
    font-size: 1.375rem;
    font-weight: 600;
  }

  .main-content {
    padding: 2rem 3rem;
    position: relative;
  }

  .create-store-link {
    padding: 0.625rem 1.25rem;
    display: flex;
    align-items: center;
    position: absolute;
    top: 1.75rem;
    right: 1.75rem;
    border: 1px solid #e5e7eb;
    border-radius: 0.375rem;
    font-size: 0.875rem;
    font-weight: 500;
    color: #4b5563;
    line-height: 1;
    box-shadow: rgba(0, 0, 0, 0) 0px 0px 0px 0px,
      rgba(0, 0, 0, 0) 0px 0px 0px 0px, rgba(0, 0, 0, 0.05) 0px 1px 2px 0px;

    &:hover {
      color: #111827;
      border-color: #d1d5db;
    }

    &:focus {
      outline: 2px solid transparent;
      outline-offset: 2px;
      box-shadow: rgb(255, 255, 255) 0px 0px 0px 2px, #4f46e5 0px 0px 0px 4px,
        rgba(0, 0, 0, 0.05) 0px 1px 2px 0px;
    }

    svg {
      margin: 0 0.375rem 0 0;
      width: 1.25rem;
      height: 1.25rem;
      color: #9ca3af;
    }
  }

  h3 {
    margin: 0;
    font-weight: 600;
  }

  .buttons {
    padding: 1.5rem 0 2rem;

    button {
      padding: 0.625rem 1.25rem;
      background-color: transparent;
      border: 1px solid transparent;
      font-size: 0.875rem;
      font-weight: 500;
      color: #6b7280;
      border-radius: 0.375rem;
      cursor: pointer;

      &:hover {
        color: #1f2937;
      }

      &.active {
        background-color: #f3f4f6;
        border-color: #e5e7eb;
        color: #1f2937;
      }

      &:not(:first-of-type, :last-of-type) {
        margin: 0 0.5rem;
      }
    }
  }

  .table-container {
    width: 100%;
    border: 1px solid #e5e7eb;
    border-radius: 0.375rem;
    box-shadow: rgba(0, 0, 0, 0) 0px 0px 0px 0px,
      rgba(0, 0, 0, 0) 0px 0px 0px 0px, rgba(0, 0, 0, 0.05) 0px 1px 2px 0px;
  }

  table {
    width: 100%;
    border-collapse: collapse;
  }

  th,
  td {
    border-bottom: 1px solid #e5e7eb;
  }

  tr:last-of-type td {
    border-bottom: none;
  }

  th {
    padding: 1rem 1.5rem;
    background-color: #f9fafb;
    font-size: 0.75rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.0375em;
    color: #6b7280;
    text-align: left;

    &:first-of-type {
      border-top-left-radius: 0.375rem;
    }

    &:last-of-type {
      border-top-right-radius: 0.375rem;
    }
  }

  td {
    padding: 0.875rem 1.5rem;
    color: #1f2937;
    font-size: 0.875rem;

    &.store-name {
      font-size: 0.9375rem;
      font-weight: 500;
      color: #111827;
    }

    &.edit-store {
      svg {
        width: 1.125rem;
        height: 1.125rem;
        color: #9ca3af;
      }

      a:hover svg {
        color: #4b5563;
      }
    }
  }

  & .contact-name {
    margin: 0 0 0.25rem;
    color: #111827;
    font-weight: 500;
  }

  & .contact-email {
    color: #4b5563;

    a:hover {
      text-decoration: underline;
    }
  }
`;

type ActiveStoreButton = 'allStores' | 'activeStores' | 'closedStores';

export default function Index() {
  const [activeStoreButton, setActiveStoreButton] =
    React.useState<ActiveStoreButton>('allStores');

  return (
    <DashboardStyles>
      <Layout>
        <div className="title">
          <h2>Dashboard Home</h2>
        </div>
        <div className="main-content">
          <Link href="/create-a-store">
            <a className="create-store-link">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z"
                  clipRule="evenodd"
                />
              </svg>
              Create a store
            </a>
          </Link>
          <div className="stores">
            <h3>Stores</h3>
            <div className="buttons">
              <button
                type="button"
                className={activeStoreButton === 'allStores' ? 'active' : ''}
                onClick={() => setActiveStoreButton('allStores')}
              >
                All Stores
              </button>
              <button
                type="button"
                className={activeStoreButton === 'activeStores' ? 'active' : ''}
                onClick={() => setActiveStoreButton('activeStores')}
              >
                Active Stores
              </button>
              <button
                type="button"
                className={activeStoreButton === 'closedStores' ? 'active' : ''}
                onClick={() => setActiveStoreButton('closedStores')}
              >
                Closed Stores
              </button>
            </div>
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Store Name</th>
                    <th>Contact</th>
                    <th>Close Date</th>
                    <th />
                  </tr>
                </thead>
                <tbody>
                  {ACTIVE_STORES.map(s => (
                    <tr key={s.id}>
                      <td className="store-name">{s.name}</td>
                      <td className="store-contact">
                        <div className="contact-name">{s.contact.name}</div>
                        <div className="contact-email">
                          <a href={`mailto:${s.contact.email}`}>
                            {s.contact.email}
                          </a>
                        </div>
                      </td>
                      <td className="close-date">{s.closeDate}</td>
                      <td className="edit-store">
                        <Link href={`/`}>
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
                                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                              />
                            </svg>
                          </a>
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </Layout>
    </DashboardStyles>
  );
}
