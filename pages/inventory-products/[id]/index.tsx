import React from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { useQuery, useQueryClient } from 'react-query';
import styled from 'styled-components';
import { format } from 'date-fns';
import { InventoryProduct as IPInterface } from '../../../interfaces';
import { useSession } from '../../../hooks/useSession';
import useActiveNavTab from '../../../hooks/useActiveNavTab';
import useOutsideClick from '../../../hooks/useOutsideClick';
import useEscapeKeydownClose from '../../../hooks/useEscapeKeydownClose';
import Layout from '../../../components/Layout';
import InventoryProductSkus from '../../../components/InventoryProductSkus';
import InventoryModal from '../../../components/InventoryModal';
import LoadingSpinner from '../../../components/LoadingSpinner';

const navValues = ['details', 'skus', 'notes'];
type NavValue = typeof navValues[number];

export default function InventoryProduct() {
  const [session, sessionLoading] = useSession({ required: true });
  const router = useRouter();
  const queryClient = useQueryClient();
  const productMenuRef = React.useRef<HTMLDivElement>(null);
  const [showProductMenu, setShowProductMenu] = React.useState(false);
  const [showInventoryModal, setShowInventoryModal] = React.useState(false);
  const { activeNav, setActiveNav } = useActiveNavTab(
    navValues,
    `/inventory-products/${router.query.id}?`
  );
  useOutsideClick(showProductMenu, setShowProductMenu, productMenuRef);
  useEscapeKeydownClose(showProductMenu, setShowProductMenu);

  const inventoryProductQuery = useQuery<IPInterface>(
    ['inventory-products', 'inventory-product', router.query.id],
    async () => {
      if (!router.query.id) return;
      const response = await fetch(
        `/api/inventory-products/${router.query.id}`
      );

      if (!response.ok) {
        throw new Error('Failed to fetch the inventory product.');
      }

      const data = await response.json();
      return data.inventoryProduct;
    },
    {
      initialData: () => {
        return queryClient
          .getQueryData<IPInterface[]>(['inventory-products'])
          ?.find(ip => ip.inventoryProductId === router.query.id);
      },
      initialDataUpdatedAt: () =>
        queryClient.getQueryState(['inventory-products'])?.dataUpdatedAt,
      staleTime: 1000 * 60 * 10,
    }
  );

  const handleNavClick = (value: NavValue) => {
    setActiveNav(value);
    router.push(
      `/inventory-products/${router.query.id}?active=${value}`,
      undefined,
      {
        shallow: true,
      }
    );
  };

  if (sessionLoading || !session) return <div />;

  return (
    <Layout title={`Inventory Product`}>
      <InventoryProductStyles>
        <div className="container">
          {inventoryProductQuery.isLoading && (
            <LoadingSpinner isLoading={inventoryProductQuery.isLoading} />
          )}
          {inventoryProductQuery.isError &&
            inventoryProductQuery.error instanceof Error && (
              <div>Error: {inventoryProductQuery.error}</div>
            )}
          {inventoryProductQuery.data && (
            <>
              <Link href="/#inventory-products">
                <a className="back-link">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Back to inventory products
                </a>
              </Link>
              <div className="product-menu-container">
                <button
                  type="button"
                  onClick={() => setShowProductMenu(!showProductMenu)}
                  className="product-menu-button"
                >
                  <span className="sr-only">Menu</span>
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
                      d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"
                    />
                  </svg>
                </button>
                <div
                  ref={productMenuRef}
                  className={`menu${showProductMenu ? ' show' : ''}`}
                >
                  <button
                    type="button"
                    onClick={() => {
                      setShowInventoryModal(true);
                      setShowProductMenu(false);
                    }}
                    className="menu-link"
                  >
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
                        d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                      />
                    </svg>
                    Update inventory
                  </button>
                  <Link href={`/inventory-products/${router.query.id}/update`}>
                    <a className="menu-link">
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
                          d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                      </svg>
                      Update product
                    </a>
                  </Link>
                </div>
              </div>

              <div className="product-header">
                <h2>{inventoryProductQuery.data.name}</h2>
                <p>{inventoryProductQuery.data.merchandiseCode}</p>
              </div>

              <div className="product-nav">
                <button
                  type="button"
                  onClick={() => handleNavClick('details')}
                  className={activeNav === 'details' ? 'active' : ''}
                >
                  <span>Details</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleNavClick('skus')}
                  className={activeNav === 'skus' ? 'active' : ''}
                >
                  <span>Skus</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleNavClick('notes')}
                  className={activeNav === 'notes' ? 'active' : ''}
                >
                  <span>Notes</span>
                </button>
              </div>

              <div className="body">
                <FetchingSpinner isLoading={inventoryProductQuery.isFetching} />

                {activeNav === 'details' && (
                  <>
                    <div className="product-details">
                      <div className="section">
                        <div className="info-item">
                          <div className="label">ID</div>
                          <div className="value">
                            {inventoryProductQuery.data.inventoryProductId}
                          </div>
                        </div>
                        <div className="info-item">
                          <div className="label">Merchandise Code</div>
                          <div className="value">
                            {inventoryProductQuery.data.merchandiseCode}
                          </div>
                        </div>
                        <div className="info-item">
                          <div className="label">Created</div>
                          <div className="value">
                            {format(
                              new Date(inventoryProductQuery.data.createdAt),
                              "MMM. dd, yyyy 'at' h:mmaa"
                            )}
                          </div>
                        </div>
                        <div className="info-item">
                          <div className="label">Last updated</div>
                          <div className="value">
                            {format(
                              new Date(inventoryProductQuery.data.updatedAt),
                              "MMM. dd, yyyy 'at' h:mmaa"
                            )}
                          </div>
                        </div>
                        <div className="info-item">
                          <div className="label">Description</div>
                          <div className="value">
                            {inventoryProductQuery.data.description}
                          </div>
                        </div>
                        <div className="info-item">
                          <div className="label">Tag</div>
                          <div className="value">
                            {inventoryProductQuery.data.tag}
                          </div>
                        </div>
                        <div className="info-item">
                          <div className="label">Details</div>
                          <div className="value">
                            <ul>
                              {inventoryProductQuery.data.details.length > 0 &&
                                inventoryProductQuery.data.details.map(
                                  (d, i) => <li key={i}>{d}</li>
                                )}
                            </ul>
                          </div>
                        </div>
                      </div>
                      <div className="section">
                        <div className="info-item">
                          <div className="label">Sizes</div>
                          <div className="value">
                            <ul>
                              {inventoryProductQuery.data.sizes.map(s => (
                                <li key={s.id}>{s.label}</li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </div>
                      <div className="section">
                        <div className="info-item">
                          <div className="label">Colors</div>
                          <div className="value">
                            <ul>
                              {inventoryProductQuery.data.colors.length > 0 &&
                                inventoryProductQuery.data.colors.map(c => (
                                  <li key={c.id} className="size">
                                    <div>{c.label}</div>
                                    <div>{c.hex}</div>
                                  </li>
                                ))}
                            </ul>
                          </div>
                        </div>
                      </div>
                    </div>
                  </>
                )}

                {activeNav === 'skus' && (
                  <InventoryProductSkus
                    inventoryProduct={inventoryProductQuery.data}
                  />
                )}

                {activeNav === 'notes'}
              </div>
            </>
          )}
        </div>
      </InventoryProductStyles>
      {showInventoryModal && inventoryProductQuery.data && (
        <InventoryModal
          product={inventoryProductQuery.data}
          showModal={showInventoryModal}
          setShowModal={setShowInventoryModal}
        />
      )}
    </Layout>
  );
}

const InventoryProductStyles = styled.div`
  position: relative;

  h2 {
    margin: 0;
    font-size: 1.5rem;
    font-weight: 600;
    color: #111827;
  }

  h3 {
    margin: 0 0 1.25rem;
    font-size: 1.25rem;
    font-weight: 600;
    color: #111827;
  }

  h4 {
    margin: 0 0 1rem;
    font-size: 1.125rem;
    font-weight: 600;
    color: #111827;
  }

  .container {
    margin: 0 auto;
    padding: 3rem 0 0;
    max-width: 75rem;
    width: 100%;
  }

  .back-link {
    display: inline-flex;
    align-items: center;
    gap: 0.25rem;
    font-weight: 500;
    color: #4b5563;

    svg {
      margin: 1px 0 0;
      height: 1rem;
      width: 1rem;
      color: #9ca3af;
    }

    &:hover {
      color: #1f2937;
    }

    &:focus {
      outline: 2px solid transparent;
      outline-offset: 2px;
    }

    &:focus-visible {
      text-decoration: underline;
      color: #1c5eb9;

      svg {
        color: #1c5eb9;
      }
    }
  }

  .product-menu-container {
    position: absolute;
    top: 2rem;
    right: 2rem;
    display: flex;
    justify-content: flex-end;
    width: 25%;

    .menu {
      top: 2.25rem;
      right: 0;
    }
  }

  .product-menu-button {
    padding: 0;
    height: 2rem;
    width: 2rem;
    display: flex;
    justify-content: center;
    align-items: center;
    background-color: transparent;
    border: none;
    color: #6b7280;
    border-radius: 0.3125rem;
    cursor: pointer;

    svg {
      height: 1.25rem;
      width: 1.25rem;
    }

    &:hover {
      color: #111827;
    }
  }

  .product-header {
    margin: 3rem 0 2.25rem;

    p {
      margin: 0.25rem 0 0;
      font-family: 'Dank Mono', 'Menlo', monospace;
      font-size: 1rem;
      font-weight: 700;
      color: #6b7280;
    }
  }

  .menu-button {
    margin-left: auto;
    padding: 1rem 0.5rem;
    display: flex;
    justify-content: center;
    align-items: center;
    background-color: transparent;
    border: none;
    color: #6b7280;
    cursor: pointer;

    &:hover {
      color: #111827;
    }

    svg {
      height: 1rem;
      width: 1rem;
    }
  }

  .menu {
    padding: 0 1rem;
    position: absolute;
    display: none;
    flex-direction: column;
    align-items: flex-start;
    background-color: #fff;
    border-radius: 0.5rem;
    box-shadow: rgb(255, 255, 255) 0px 0px 0px 0px,
      rgba(17, 24, 39, 0.05) 0px 0px 0px 1px,
      rgba(0, 0, 0, 0.1) 0px 4px 6px -1px, rgba(0, 0, 0, 0.06) 0px 2px 4px -1px;

    &.show {
      display: flex;
      z-index: 100;
    }
  }

  .menu-link.disabled,
  .delete-button.disabled {
    pointer-events: none;
    text-decoration: line-through;
  }

  .menu-link,
  .edit-button,
  .delete-button {
    padding: 0.75rem 2rem 0.75rem 0;
    width: 100%;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    background-color: transparent;
    border: none;
    font-size: 0.875rem;
    font-weight: 400;
    color: #1f2937;
    text-align: left;
    cursor: pointer;

    &:hover {
      color: #111827;

      svg {
        color: #6b7280;
      }
    }

    svg {
      height: 1rem;
      width: 1rem;
      color: #9ca3af;
    }
  }

  .edit-button,
  .menu-link {
    border-bottom: 1px solid #e5e7eb;
  }

  .delete-button:hover {
    color: #991b1b;

    svg {
      color: #991b1b;
    }
  }

  .product-nav {
    padding: 0.625rem 0;
    display: flex;
    align-items: center;
    border-bottom: 1px solid #e5e7eb;
    border-top: 1px solid #e5e7eb;

    button {
      margin: 0 0.75rem 0 0;
      padding: 0.4375rem 0.75rem;
      background-color: transparent;
      border: none;
      border-radius: 9999px;
      font-size: 0.875rem;
      font-weight: 500;
      line-height: 1;
      color: #374151;
      cursor: pointer;

      &:hover {
        background-color: #e5e7eb;
        color: #111827;
      }

      &.active {
        background-color: #1c5eb9;
        color: #fff;

        &:focus {
          outline: 2px solid transparent;
          outline-offset: 2px;
        }

        &:focus-visible {
          box-shadow: rgb(255, 255, 255) 0px 0px 0px 2px,
            #1c5eb9 0px 0px 0px 4px, rgba(0, 0, 0, 0) 0px 0px 0px 0px;
        }
      }
    }

    a {
      font-size: 0.875rem;
      font-weight: 500;
      color: #374151;
    }
  }

  .body {
    position: relative;
    padding: 3.5rem 0;
  }

  .product-details {
    display: grid;
    grid-template-columns: 1fr 0.5fr 0.75fr;
    gap: 6rem;

    ul {
      padding: 0;
    }

    li {
      padding: 0.5rem 0;
      list-style: none;

      &:first-of-type {
        padding-top: 0;
      }

      &.size {
        display: flex;
        flex-direction: column;
        gap: 0.125rem;
      }
    }
  }

  .info-item {
    padding: 1.25rem 0;
    display: flex;
    flex-direction: column;
    font-size: 1rem;
    color: #111827;
    line-height: 1.35;

    &:last-of-type {
      padding-bottom: 0;
    }
  }

  .label {
    margin: 0 0 0.5rem;
    font-size: 0.8125rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.0375em;
    color: #89909d;
  }

  .value {
    color: #111827;
    line-height: 1.5;

    a:hover {
      text-decoration: underline;
      color: #1c5eb9;
    }
  }

  .text-center {
    text-align: center;
  }

  .text-right {
    text-align: right;
  }
`;

const FetchingSpinner = styled(LoadingSpinner)`
  position: absolute;
  top: 2rem;
  right: 0;
`;
