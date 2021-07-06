import React from 'react';
import { GetServerSideProps } from 'next';
import { getSession } from 'next-auth/client';
import { connectToDb, store } from '../db';
import Link from 'next/link';
import styled from 'styled-components';
import { Store } from '../interfaces';
import Layout from '../components/Layout';

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

    .container {
      padding: 0.375rem;
      display: inline-flex;
      background-color: #f3f4f6;
      border: 1px solid #e5e7eb;
      border-radius: 0.375rem;
    }

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
        background-color: #fff;
        border-color: #e5e7eb;
        color: #1f2937;
        box-shadow: rgba(0, 0, 0, 0) 0px 0px 0px 0px,
          rgba(0, 0, 0, 0) 0px 0px 0px 0px, rgba(0, 0, 0, 0.05) 0px 1px 2px 0px;
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
    padding: 1rem 1rem;
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

    &.status {
      padding-right: 0.5rem;
      padding-left: 1.5rem;

      svg {
        height: 1.25rem;
        width: 1.25rem;
        color: #9ca3af;
      }
    }
  }

  td {
    padding: 0.875rem 1rem;
    color: #1f2937;
    font-size: 0.875rem;

    &.store-name {
      padding-left: 0.5rem;
      font-size: 0.9375rem;
      font-weight: 500;
      color: #111827;
    }

    &.update-store {
      svg {
        width: 1.125rem;
        height: 1.125rem;
        color: #9ca3af;
      }

      a:first-of-type {
        margin: 0 0.5rem 0 0;
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
  }

  .is-active {
    padding-right: 0.5rem;
    padding-left: 1.5rem;
  }

  .active-store,
  .inactive-store {
    display: block;
    height: 0.875rem;
    width: 0.875rem;
    border-radius: 9999px;
  }

  .active-store {
    background-color: #34d399;
    border: 3px solid #d1fae5;
  }

  .inactive-store {
    background-color: #f87171;
    border: 3px solid #fee2e2;
  }
`;

function isStoreActive(openDate: string, closeDate: string | undefined) {
  const open = new Date(openDate);
  const close = new Date(closeDate || 'Jan 01 9999');
  const now = new Date();

  const isOpen = now > open && now < close;

  return isOpen;
}

type Props = { stores: Store[] };
type ActiveStoreButton = 'allStores' | 'activeStores' | 'closedStores';

export default function Index({ stores }: Props) {
  const [activeStoreButton, setActiveStoreButton] =
    React.useState<ActiveStoreButton>('allStores');

  return (
    <Layout>
      <DashboardStyles>
        <div className="title">
          <h2>Dashboard Homepage</h2>
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
              <div className="container">
                <button
                  type="button"
                  className={activeStoreButton === 'allStores' ? 'active' : ''}
                  onClick={() => setActiveStoreButton('allStores')}
                >
                  All Stores
                </button>
                <button
                  type="button"
                  className={
                    activeStoreButton === 'activeStores' ? 'active' : ''
                  }
                  onClick={() => setActiveStoreButton('activeStores')}
                >
                  Active Stores
                </button>
                <button
                  type="button"
                  className={
                    activeStoreButton === 'closedStores' ? 'active' : ''
                  }
                  onClick={() => setActiveStoreButton('closedStores')}
                >
                  Closed Stores
                </button>
              </div>
            </div>
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th className="status">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M5.05 3.636a1 1 0 010 1.414 7 7 0 000 9.9 1 1 0 11-1.414 1.414 9 9 0 010-12.728 1 1 0 011.414 0zm9.9 0a1 1 0 011.414 0 9 9 0 010 12.728 1 1 0 11-1.414-1.414 7 7 0 000-9.9 1 1 0 010-1.414zM7.879 6.464a1 1 0 010 1.414 3 3 0 000 4.243 1 1 0 11-1.415 1.414 5 5 0 010-7.07 1 1 0 011.415 0zm4.242 0a1 1 0 011.415 0 5 5 0 010 7.072 1 1 0 01-1.415-1.415 3 3 0 000-4.242 1 1 0 010-1.415zM10 9a1 1 0 011 1v.01a1 1 0 11-2 0V10a1 1 0 011-1z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </th>
                    <th>Store Name</th>
                    <th>Contact</th>
                    <th>Store Opens</th>
                    <th>Store Closes</th>
                    <th />
                  </tr>
                </thead>
                <tbody>
                  {stores.map(s => (
                    <tr key={s._id}>
                      <td className="is-active">
                        {isStoreActive(s.openDate, s.closeDate) ? (
                          <span className="active-store" />
                        ) : (
                          <span className="inactive-store" />
                        )}
                      </td>
                      <td className="store-name">
                        <Link href={`/store?id=${s._id}`}>
                          <a>{s.name}</a>
                        </Link>
                      </td>
                      <td className="store-contact">
                        <div className="contact-name">
                          {s.contact.firstName} {s.contact.lastName}
                        </div>
                        <div className="contact-email">{s.contact.email}</div>
                      </td>
                      <td>{new Date(s.openDate).toDateString()}</td>
                      <td className="close-date">
                        {s.closeDate
                          ? new Date(s.closeDate).toDateString()
                          : 'Never'}
                      </td>
                      <td className="update-store">
                        <Link href={`/update-store?id=${s._id}`}>
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
                                d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"
                              />
                            </svg>
                          </a>
                        </Link>
                        <Link href={`/store?id=${s._id}`}>
                          <a>
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-5 w-5"
                              viewBox="0 0 20 20"
                              fill="currentColor"
                            >
                              <path
                                fillRule="evenodd"
                                d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
                                clipRule="evenodd"
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
      </DashboardStyles>
    </Layout>
  );
}

export const getServerSideProps: GetServerSideProps = async context => {
  try {
    const session = await getSession(context);
    if (!session) {
      return {
        props: {},
        redirect: {
          permanent: false,
          destination: '/login',
        },
      };
    }

    const { db } = await connectToDb();
    const result = await store.getStores(db);
    return {
      props: {
        stores: result,
      },
    };
  } catch (error) {
    console.error(error);
    return {
      props: {
        error: error.message,
      },
    };
  }
};
