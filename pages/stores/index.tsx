import React from 'react';
// import { useRouter } from 'next/router';
// import Link from 'next/link';
import styled from 'styled-components';
// import { useQuery } from 'react-query';
// import { fetchPaginatedStores } from '../../queries/stores';
// import { StoreStatusFilter } from '../../interfaces';
import Layout from '../../components/Layout';
// import StoresTable from '../../components/storesTable/StoresTable';
// import LoadingSpinner from '../../components/LoadingSpinner';
// import TableLoadingSpinner from '../../components/TableLoadingSpinner';
// import PageNavButtons from '../../components/PageNavButtons';
// import Pagination from '../../components/Pagination';

export default function Stores() {
  // const router = useRouter();
  // const pageSize = 1;
  // const [currentPage, setCurrentPage] = React.useState<number>();
  // const [statusFilter, setStatusFilter] =
  //   React.useState<StoreStatusFilter>('all');
  // const [unfulfilledChecked, setUnfulfilledChecked] = React.useState(false);

  // const query = useQuery(
  //   ['stores', currentPage, pageSize, statusFilter, unfulfilledChecked],
  //   () =>
  //     fetchPaginatedStores(
  //       currentPage,
  //       pageSize,
  //       statusFilter,
  //       unfulfilledChecked
  //     ),
  //   {
  //     staleTime: 1000 * 60 * 10,
  //     enabled: currentPage ? true : false,
  //     keepPreviousData: true,
  //   }
  // );

  // React.useEffect(() => {
  //   if (
  //     router.isReady &&
  //     (!router.query.page || isNaN(Number(router.query.page)))
  //   ) {
  //     router.push('/stores?page=1');
  //     setCurrentPage(1);
  //   } else if (!currentPage) {
  //     setCurrentPage(Number(router.query.page));
  //   } else if (currentPage && currentPage !== Number(router.query.page)) {
  //     router.push(`/stores?page=${currentPage}`);
  //   }
  // }, [router.query.page, currentPage]);

  // React.useEffect(() => {
  //   router.push('/stores?page=1');
  //   setCurrentPage(1);
  // }, [statusFilter, unfulfilledChecked]);

  // const handleStatusFilterClick = (status: StoreStatusFilter) => {
  //   setStatusFilter(status);
  // };

  return (
    <Layout
      // loading={query.isLoading}
      requiresAuth={true}
      title="All stores | Macaport Dashboard"
    >
      {/* <StoresStyles unfulfilledChecked={unfulfilledChecked}> */}
      <StoresStyles unfulfilledChecked={false}>
        <p>This is a test...</p>
        {/* {(query.isLoading || query.isFetching) && <TableLoadingSpinner />}
        {query.data && !query.isFetching && (
          <div className="container">
            <PageNavButtons />
            <div className="header">
              <div className="row">
                <div className="row">
                  <h2>All stores</h2>
                  <LoadingSpinner isLoading={query.isFetching} />
                </div>
                <Link href="/stores/create">
                  <a className="link-button">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
                        clipRule="evenodd"
                      />
                    </svg>
                    Create a store
                  </a>
                </Link>
              </div>
              <div className="store-status-filter">
                <button
                  type="button"
                  onClick={() => handleStatusFilterClick('all')}
                  className={`status-button${
                    statusFilter === 'all' ? ' active' : ''
                  }`}
                >
                  All
                </button>
                <button
                  type="button"
                  onClick={() => handleStatusFilterClick('upcoming')}
                  className={`status-button${
                    statusFilter === 'upcoming' ? ' active' : ''
                  }`}
                >
                  Upcoming
                </button>
                <button
                  type="button"
                  onClick={() => handleStatusFilterClick('open')}
                  className={`status-button${
                    statusFilter === 'open' ? ' active' : ''
                  }`}
                >
                  Open
                </button>
                <button
                  type="button"
                  onClick={() => handleStatusFilterClick('closed')}
                  className={`status-button${
                    statusFilter === 'closed' ? ' active' : ''
                  }`}
                >
                  Closed
                </button>
              </div>
              <div className="unfulfilled-checkbox">
                <label htmlFor="unfulfilled">
                  <input
                    type="checkbox"
                    name="unfulfilled"
                    id="unfulfilled"
                    checked={unfulfilledChecked}
                    onChange={() => setUnfulfilledChecked(!unfulfilledChecked)}
                  />
                  Only stores with unfulfilled orders
                </label>
              </div>
            </div>
            <StoresTable stores={query.data.stores} />
            {currentPage && (
              <Pagination
                currentPage={currentPage}
                setCurrentPage={setCurrentPage}
                pageSize={pageSize}
                count={query.data.count}
                isFetching={query.isFetching}
              />
            )}
          </div>
        )}*/}
      </StoresStyles>
    </Layout>
  );
}

const StoresStyles = styled.div<{ unfulfilledChecked: boolean }>`
  .container {
    margin: 0 auto;
    padding: 3rem 0 6rem;
    max-width: 74rem;
    width: 100%;
  }

  .header {
    margin: 3.5rem 0 1.25rem;
  }

  h2 {
    margin: 0 0.75rem 0 0;
    font-size: 1.5rem;
    font-weight: 600;
    color: #111827;
  }

  .row {
    display: flex;
    justify-content: space-between;
  }

  .link-button {
    padding: 0.625rem 1.25rem;
    display: inline-flex;
    align-items: center;
    font-size: 0.875rem;
    font-weight: 500;
    color: #111827;
    background-color: #fff;
    border: 1px solid #dcdfe4;
    border-radius: 0.375rem;
    box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05);

    &:hover {
      color: #000;
      border-color: #d1d5db;
    }

    svg {
      margin: 0 0.375rem 0 0;
      height: 0.875rem;
      width: 0.875rem;
    }
  }

  .store-status-filter {
    margin: 1.5rem 0 0;
    display: flex;
    gap: 2rem;
    border-bottom: 1px solid #e5e7eb;

    .status-button {
      margin: 0 0 -1px;
      padding: 0 0 0.875rem;
      background-color: transparent;
      border-width: 0 0 2px 0;
      border-style: solid;
      border-color: transparent;
      font-size: 0.875rem;
      font-weight: 500;
      color: #6b7280;
      cursor: pointer;
      transition: color 150ms linear;

      &.active,
      &.active:hover {
        color: #060ea5;
        border-color: #060ea5;
      }

      &:hover {
        color: #000;
      }
    }
  }

  .unfulfilled-checkbox {
    margin: 1.5rem 0 0;

    label {
      padding: 0.5rem 0.75rem;
      display: inline-flex;
      align-items: center;
      border: 1px solid
        ${props => (props.unfulfilledChecked ? '#b8c8f4' : '#d1d5db')};
      border-radius: 0.3125rem;
      font-size: 0.8125rem;
      background-color: ${props =>
        props.unfulfilledChecked ? '#ecf0fc' : '#f9fafb'};
      color: ${props => (props.unfulfilledChecked ? '#173797' : '#374151')};
      cursor: pointer;
    }

    input {
      margin: 0 0.5rem 0 0;
      box-shadow: none;
      border-radius: 9999px;

      &:checked {
        border-color: #ecf0fc;
      }

      &:not(:checked) {
        border-color: #b0b7c1;
        background-color: transparent;
      }
    }
  }
`;
