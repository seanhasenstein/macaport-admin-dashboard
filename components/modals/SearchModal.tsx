import React from 'react';
import Link from 'next/link';
import styled from 'styled-components';
import classNames from 'classnames';
import {
  ChevronUpDownIcon,
  CheckIcon,
  MagnifyingGlassIcon,
} from '@heroicons/react/20/solid';

import Modal from '../Modal';

import useOutsideClick from '../../hooks/useOutsideClick';
import useEscapeKeydownClose from '../../hooks/useEscapeKeydownClose';
import usePreventBodyScroll from '../../hooks/usePreventBodyScroll';
import useThrottle from '../../hooks/useThrottle';

import { formatPhoneNumber } from '../../utils';

import {
  InventoryProductSearchResult,
  OrderSearchResult,
  StoreSearchResult,
} from '../../interfaces';

type Props = {
  isOpen: boolean;
  closeModal: () => void;
};

const options = [
  {
    name: 'Orders',
    value: 'orders' as const,
    inputPlaceholder: 'Search for an order',
    notFoundCopy: 'No orders found',
  },
  {
    name: 'Stores',
    value: 'stores' as const,
    inputPlaceholder: 'Search for a store',
    notFoundCopy: 'No stores found',
  },
  {
    name: 'Inv. Products',
    value: 'inventoryProducts' as const,
    inputPlaceholder: 'Search for an inventory product',
    notFoundCopy: 'No inventory products found',
  },
  // {
  //   name: 'Customers',
  //   value: 'customers' as const,
  //   inputPlaceholder: 'Search for a customer',
  // },
];

type Options = 'orders' | 'stores' | 'inventoryProducts' | 'customers';

export default function SearchModal({ isOpen, closeModal }: Props) {
  const [isOptionsOpen, setIsOptionsOpen] = React.useState(false);
  const [selectedOption, setSelectedOption] = React.useState<Options>(
    options[0].value
  );
  const [searchTerm, setSearchTerm] = React.useState('');
  const [searchResults, setSearchResults] = React.useState<
    OrderSearchResult[] | StoreSearchResult[] | InventoryProductSearchResult[]
  >();
  const [loading, setLoading] = React.useState(false);

  const throttledSearchTerm = useThrottle(searchTerm, 700);

  const optionsRef = React.useRef<HTMLDivElement>(null);

  const handleOptionClick = (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>,
    value: Options
  ) => {
    e.preventDefault();
    e.stopPropagation();

    if (selectedOption === value) {
      setIsOptionsOpen(false);
      return;
    }

    setSelectedOption(value);
    setIsOptionsOpen(false);
    setSearchTerm('');
    setSearchResults(undefined);
  };

  useOutsideClick(isOptionsOpen, () => setIsOptionsOpen(false), optionsRef);
  useEscapeKeydownClose(isOptionsOpen, () => setIsOptionsOpen(false));
  usePreventBodyScroll(isOpen);

  const fetchResults = React.useCallback(
    async (term: string, selectedOption: Options) => {
      if (!term && searchResults === undefined) return;
      if (!term && searchResults !== undefined) {
        setSearchResults(undefined);
        return;
      }

      setLoading(true);
      try {
        const response = await fetch(
          `/api/search/${selectedOption}?searchTerm=${term}`
        );
        const data = await response.json();
        const results = data.results || [];
        setSearchResults(results);
      } catch (error) {
        // todo: handle this error better
      } finally {
        setLoading(false);
      }
    },
    []
  );

  React.useEffect(() => {
    if (!throttledSearchTerm || searchTerm === '' || searchTerm.length < 3) {
      setSearchResults(undefined);
      return;
    }
    fetchResults(throttledSearchTerm, selectedOption);
  }, [throttledSearchTerm, fetchResults, selectedOption]);

  if (!isOpen) return null;

  return (
    <SearchModalStyles $hasresults={searchResults !== undefined}>
      <Modal
        {...{ isOpen, closeModal, hideCloseButton: true }}
        customOverlayClass="custom-modal-overlay"
        customModalClass="custom-modal-container"
        disableCloseOnOutsideClick={isOptionsOpen}
        disableCloseOnEscapeKey={isOptionsOpen}
      >
        <div className="search-container">
          <div className="input-container">
            <input
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder={
                options.find(option => option.value === selectedOption)
                  ?.inputPlaceholder
              }
              className="search-input"
            />
            <MagnifyingGlassIcon className="magnifying-glass-icon" />
          </div>
          <div className="search-categories">
            <div className="category-toggle-container">
              <button
                type="button"
                onClick={() => setIsOptionsOpen(prev => !prev)}
                className={classNames('category-toggle-button', {
                  optionsOpen: isOptionsOpen,
                })}
              >
                {options.find(option => option.value === selectedOption)?.name}
                <ChevronUpDownIcon className="chevron-icon" />
              </button>
            </div>
            {isOptionsOpen && (
              <div ref={optionsRef} className="search-categories-dropdown">
                {options.map(option => (
                  <button
                    key={option.value}
                    type="button"
                    className={classNames('option-button', {
                      selected: selectedOption === option.value,
                    })}
                    onClick={e => handleOptionClick(e, option.value)}
                  >
                    {option.name}
                    {selectedOption === option.value && (
                      <CheckIcon className="check-icon" />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
        {searchResults !== undefined ? (
          <div className="results-container">
            {searchResults.length === 0 && !loading ? (
              <p>
                {
                  options.find(option => option.value === selectedOption)
                    ?.notFoundCopy
                }
              </p>
            ) : null}
            {searchResults?.length ? (
              <ul>
                {selectedOption === 'orders' ? (
                  <>
                    {(searchResults as OrderSearchResult[]).map(order => (
                      <li key={order.id}>
                        <Link
                          href={`/stores/${order.store._id}?orderId=${order.id}`}
                        >
                          <a>
                            #{order.id} {order.createdAt} -{' '}
                            {order.customer.firstName} {order.customer.lastName}{' '}
                            - {order.customer.email}{' '}
                            {formatPhoneNumber(order.customer.phone)} -
                            {order.store.name} - {order.total} - {order.status}
                          </a>
                        </Link>
                      </li>
                    ))}
                  </>
                ) : null}
                {selectedOption === 'stores' ? (
                  <>
                    {(searchResults as StoreSearchResult[]).map(store => (
                      <li key={store._id}>{store.name}</li>
                    ))}
                  </>
                ) : null}
                {selectedOption === 'inventoryProducts' ? (
                  <>
                    {(searchResults as InventoryProductSearchResult[]).map(
                      invProd => (
                        <li key={invProd._id}>
                          {invProd.name} - {invProd.merchandiseCode} -{' '}
                          {invProd.colorsCount} - {invProd.sizesCount}
                        </li>
                      )
                    )}
                  </>
                ) : null}
              </ul>
            ) : null}
          </div>
        ) : null}
      </Modal>
    </SearchModalStyles>
  );
}

const SearchModalStyles = styled.div<{ $hasresults: boolean }>`
  .custom-modal-overlay {
    padding-top: 26.7vh;
    align-items: flex-start;
    background-color: rgba(0, 0, 0, 0.75);
  }
  .custom-modal-container {
    padding: 0;
    max-width: 40rem;
    width: 100%;
    overflow-y: visible;
  }
  .search-container {
    display: grid;
    grid-template-columns: 1fr 9rem;
    .input-container {
      position: relative;
      .search-input {
        padding: 0 1rem 0 2.3125rem;
        height: 2.5rem;
        max-width: 40rem;
        width: 100%;
        background-color: transparent;
        border-bottom: none;
        border-left: none;
        border-right: 1px solid transparent;
        border-radius: 0.375rem 0 0 0;
        box-shadow: none;
        &:focus {
          outline: none;
          border-color: transparent;
          box-shadow: none;
        }
      }
      .magnifying-glass-icon {
        position: absolute;
        top: 0.625rem;
        left: 0.75rem;
        height: 1.1875rem;
        width: 1.1875rem;
        color: #9ca3af;
      }
    }
    .search-categories {
      width: 100%;
      .category-toggle-container {
        background-color: #fff;
        border-left: 1px solid #e5e7eb;
        border-radius: 0 0.375rem 0.375rem 0;
      }
      .category-toggle-button {
        margin-left: -1px;
        padding: 0 0.5rem 0 1rem;
        height: 2.5rem;
        width: 100%;
        display: flex;
        justify-content: space-between;
        align-items: center;
        background-color: transparent;
        border: 1px solid transparent;
        border-radius: 0 0.375rem 0.375rem 0;
        font-size: 0.875rem;
        font-weight: 500;
        color: #111827;
        cursor: pointer;
        transition: all 100ms linear;
        .chevron-icon {
          height: 1.25rem;
          width: 1.25rem;
          color: #9ca3af;
          transition: all 100ms linear;
        }
        &.optionsOpen {
          cursor: default;
        }
        &:hover:not(.optionsOpen) {
          background-color: #eef2f9;
          color: #0e1829;
          border-color: #d1dcef;
          .chevron-icon {
            color: #7a99d0;
          }
        }
      }
      .search-categories-dropdown {
        position: absolute;
        top: 2.5rem;
        right: ${p => (p.$hasresults ? '0.375rem' : '0')};
        margin-top: 0.375rem;
        width: ${p => (p.$hasresults ? 'calc(9rem - 0.375rem)' : '9rem')};
        display: grid;
        grid-template-columns: 1fr;
        background-color: #fff;
        border: 1px solid #e5e7eb;
        border-radius: 0.3125rem;
        box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.075),
          0 2px 4px -2px rgb(0 0 0 / 0.075);
        .option-button {
          margin: -1px 0 0;
          padding: 0.375rem 0.5rem 0.375rem 1rem;
          width: 100%;
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 0.8125rem;
          font-weight: 400;
          color: #111827;
          text-align: left;
          background-color: transparent;
          border-top: 1px solid transparent;
          border-right: 1px solid transparent;
          border-bottom: 1px solid #e5e7eb;
          border-left: 1px solid transparent;
          border-radius: 0;
          cursor: pointer;
          transition: all 100ms linear;
          &.selected {
            background-color: #eef2f9;
            color: #0e1829;
            border-color: #d1dcef;
            .check-icon {
              color: #4b6a95;
              height: 0.875rem;
              width: 0.875rem;
            }
          }
          &:hover {
            background-color: #eef2f9;
            border-color: #d1dcef;
            color: #0e1829;
            z-index: 1;
            &:last-of-type {
              border-bottom: 1px solid #d1dcef;
            }
          }
          &:first-of-type {
            border-radius: 0.3125rem 0.3125rem 0 0;
          }
          &:last-of-type {
            border-bottom: 1px solid transparent;
            border-radius: 0 0 0.3125rem 0.3125rem;
          }
        }
      }
    }
  }
  .results-container {
    overflow-y: auto;
    max-height: 30rem;
    border-radius: 0 0 0.375rem 0.375rem;
    border-top: 1px solid #e5e7eb;
    ul {
      margin: 0;
      padding: 0;
      list-style-type: none;
      li {
        padding: 0.5rem 1rem;
        font-size: 0.875rem;
        color: #111827;
        border-bottom: 1px solid #e5e7eb;
        &:last-of-type {
          border-bottom: none;
        }
      }
    }
  }
`;
