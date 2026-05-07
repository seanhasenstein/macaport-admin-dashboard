import React from 'react';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';
import styled from 'styled-components';
import { format } from 'date-fns';
import classNames from 'classnames';
import { MagnifyingGlassIcon, XMarkIcon } from '@heroicons/react/20/solid';

import OrderStatusComponent from './OrderStatus';
import Table from '../common/Table';
import OrderSidebar from './OrderSidebar';
import OrdersTableItemsBreakdown from './OrdersTableItemsBreakdown';
import OrdersActionsMenu from './OrdersActionsMenu';
import OrderViewSelector from '../store/OrderViewSelector';

import { calculateTotalItems, formatToMoney } from '../../utils';
import useThrottle from '../../hooks/useThrottle';

import {
  Order,
  OrderStatus,
  OrderStatusKey,
  StoreWithOrderStatusTotals,
} from '../../interfaces';
import {
  getStoresOrderStatusNumbers,
  OrderView,
  OrderViewOption,
} from '../../utils/store';
import UnfulfilledToFulfulledButton from './UnfulfilledToFulfilledButton';

type OrderViewOptions = OrderStatus | 'All' | 'Personalized';

type SortOption = 'newest' | 'oldest' | 'group' | 'shipping';

interface OrderFilterItem {
  id: number;
  option: OrderViewOptions;
}

const orderFilterItems: OrderFilterItem[] = [
  { id: 1, option: 'All' },
  { id: 2, option: 'Unfulfilled' },
  { id: 3, option: 'Printed' },
  { id: 4, option: 'Fulfilled' },
  { id: 5, option: 'PartiallyShipped' },
  { id: 6, option: 'Shipped' },
  { id: 7, option: 'Canceled' },
  { id: 8, option: 'Personalized' },
];

const STATS_BREAKDOWN: Array<{
  key: Exclude<OrderStatusKey, 'All'>;
  label: string;
}> = [
  { key: 'Unfulfilled', label: 'unfulfilled' },
  { key: 'Printed', label: 'printed' },
  { key: 'Fulfilled', label: 'fulfilled' },
  { key: 'PartiallyShipped', label: 'partially shipped' },
  { key: 'Shipped', label: 'shipped' },
  { key: 'Canceled', label: 'canceled' },
];

interface ButtonWrapperProps {
  children: React.ReactNode;
  customClassName?: string;
  onClick: () => void;
}

function ButtonWrapper({
  children,
  customClassName,
  onClick,
}: ButtonWrapperProps) {
  return (
    <ButtonWrapperStyles
      type="button"
      onClick={onClick}
      className={classNames(customClassName)}
    >
      {children}
    </ButtonWrapperStyles>
  );
}

const ButtonWrapperStyles = styled.button`
  padding: 1rem;
  background-color: transparent;
  border: none;
  text-align: inherit;
  color: inherit;
  font-size: inherit;
  font-weight: inherit;
  font-family: inherit;
  width: 100%;
  min-height: 69px;
  cursor: pointer;
`;

function orderMatchesQuery(order: Order, query: string): boolean {
  if (!query) return true;
  const haystacks = [
    order.orderId,
    `${order.customer.firstName} ${order.customer.lastName}`,
    order.customer.email,
  ];
  if (haystacks.some(h => h?.toLowerCase().includes(query))) return true;
  const queryDigits = query.replace(/\D/g, '');
  if (queryDigits) {
    const phoneDigits = (order.customer.phone || '').replace(/\D/g, '');
    if (phoneDigits.includes(queryDigits)) return true;
  }
  return false;
}

type PrintOption =
  | 'unfulfilled'
  | 'personalization'
  | 'filtered'
  | 'single';

type Props = {
  store: StoreWithOrderStatusTotals;
  selectedOrder: Order | undefined;
  setSelectedOrder: React.Dispatch<React.SetStateAction<Order | undefined>>;
  setPrintOption: React.Dispatch<
    React.SetStateAction<PrintOption | undefined>
  >;
  setFilteredOrdersForPrint: React.Dispatch<React.SetStateAction<Order[]>>;
  showCancelOrderModal: boolean;
  setShowCancelOrderModal: React.Dispatch<React.SetStateAction<boolean>>;
  openTriggerStoreShipmentModal: () => void;
  openCSVModal: () => void;
  viewOrders: Order[];
  viewOrderStatusTotals: Record<OrderStatusKey | 'Personalized', number>;
  viewOptions: OrderViewOption[];
  selectedView: OrderView | undefined;
  setSelectedView: (view: OrderView) => void;
  groupFilter: string;
  setGroupFilter: React.Dispatch<React.SetStateAction<string>>;
  shippingFilter: string;
  setShippingFilter: React.Dispatch<React.SetStateAction<string>>;
};

export default function OrdersTable({
  store,
  selectedOrder,
  setSelectedOrder,
  setPrintOption,
  setFilteredOrdersForPrint,
  showCancelOrderModal,
  setShowCancelOrderModal,
  openTriggerStoreShipmentModal,
  openCSVModal,
  viewOrders,
  viewOrderStatusTotals,
  viewOptions,
  selectedView,
  setSelectedView,
  groupFilter,
  setGroupFilter,
  shippingFilter,
  setShippingFilter,
}: Props) {
  const router = useRouter();

  const [copyEmailsState, setCopyEmailsState] = React.useState<
    'idle' | 'copied' | 'empty'
  >('idle');

  const [orderViewOption, setOrderViewOption] =
    React.useState<OrderViewOptions>('All');
  const [searchTerm, setSearchTerm] = React.useState('');
  const [sortOption, setSortOption] = React.useState<SortOption>('newest');
  const throttledSearchTerm = useThrottle(searchTerm, 200);
  const queryTrimmed = throttledSearchTerm.trim().toLowerCase();
  const isSearching = queryTrimmed.length > 0;

  const distinctGroups = React.useMemo(
    () =>
      Array.from(
        new Set(store.orders.map(o => o.group).filter(Boolean) as string[])
      ).sort((a, b) => a.localeCompare(b)),
    [store.orders]
  );

  const distinctShippingMethods = React.useMemo(
    () =>
      Array.from(
        new Set(
          store.orders.map(o => o.shippingMethod).filter(Boolean) as string[]
        )
      ).sort((a, b) => a.localeCompare(b)),
    [store.orders]
  );

  const showGroupControls =
    !!store.requireGroupSelection && distinctGroups.length > 0;
  const showShippingFilter = distinctShippingMethods.length >= 2;

  React.useEffect(() => {
    if (groupFilter && !distinctGroups.includes(groupFilter)) {
      setGroupFilter('');
    }
  }, [distinctGroups, groupFilter, setGroupFilter]);

  React.useEffect(() => {
    if (
      shippingFilter &&
      !distinctShippingMethods.includes(shippingFilter)
    ) {
      setShippingFilter('');
    }
  }, [distinctShippingMethods, shippingFilter, setShippingFilter]);

  React.useEffect(() => {
    if (sortOption === 'group' && !showGroupControls) setSortOption('newest');
    if (sortOption === 'shipping' && !showShippingFilter)
      setSortOption('newest');
  }, [sortOption, showGroupControls, showShippingFilter]);

  const searchedOrders = React.useMemo(
    () =>
      isSearching
        ? store.orders.filter(o => orderMatchesQuery(o, queryTrimmed))
        : viewOrders,
    [isSearching, queryTrimmed, store.orders, viewOrders]
  );

  const dimensionedOrders = React.useMemo(() => {
    if (!groupFilter && !shippingFilter) return searchedOrders;
    return searchedOrders.filter(o => {
      if (groupFilter && o.group !== groupFilter) return false;
      if (shippingFilter && o.shippingMethod !== shippingFilter) return false;
      return true;
    });
  }, [searchedOrders, groupFilter, shippingFilter]);

  const bulkPrintCounts = React.useMemo(() => {
    let total = 0;
    let unfulfilled = 0;
    let personalized = 0;
    for (const o of viewOrders) {
      if (groupFilter && o.group !== groupFilter) continue;
      if (shippingFilter && o.shippingMethod !== shippingFilter) continue;
      total += 1;
      if (o.orderStatus === 'Unfulfilled') unfulfilled += 1;
      if (o.items.some(i => i.personalizationAddons.length > 0))
        personalized += 1;
    }
    return { total, unfulfilled, personalized };
  }, [viewOrders, groupFilter, shippingFilter]);

  const canTriggerShipment = React.useMemo(
    () =>
      store.orders.some(o =>
        o.items.some(i => i.status.current === 'Fulfilled')
      ),
    [store.orders]
  );

  const hasActiveNarrowing =
    isSearching || !!groupFilter || !!shippingFilter;

  const scopedStatusTotals = React.useMemo(
    () =>
      hasActiveNarrowing
        ? getStoresOrderStatusNumbers({ ...store, orders: dimensionedOrders })
        : viewOrderStatusTotals,
    [hasActiveNarrowing, dimensionedOrders, store, viewOrderStatusTotals]
  );

  const visibleFilterItems = React.useMemo(
    () =>
      orderFilterItems.filter(
        item =>
          item.option === 'All' || scopedStatusTotals[item.option] > 0
      ),
    [scopedStatusTotals]
  );

  React.useEffect(() => {
    if (!visibleFilterItems.some(i => i.option === orderViewOption)) {
      setOrderViewOption('All');
    }
  }, [visibleFilterItems, orderViewOption]);

  const statsBreakdown = React.useMemo(
    () =>
      STATS_BREAKDOWN.filter(({ key }) => scopedStatusTotals[key] > 0).map(
        ({ key, label }) => `${scopedStatusTotals[key]} ${label}`
      ),
    [scopedStatusTotals]
  );
  const totalDisplayed = scopedStatusTotals.All;

  const filteredOrders = React.useMemo(() => {
    const statusFiltered = (() => {
      if (orderViewOption === 'All') return dimensionedOrders;
      if (orderViewOption === 'Personalized') {
        return dimensionedOrders.filter(o =>
          o.items.some(item => item.personalizationAddons.length > 0)
        );
      }
      return dimensionedOrders.filter(o => {
        if (
          orderViewOption === 'Printed' &&
          o.orderStatus === 'Unfulfilled' &&
          o.meta.receiptPrinted
        ) {
          return true;
        } else if (
          orderViewOption === 'Unfulfilled' &&
          o.orderStatus === 'Unfulfilled' &&
          o.meta.receiptPrinted
        ) {
          return false;
        } else {
          return o.orderStatus === orderViewOption;
        }
      });
    })();

    const sorted = [...statusFiltered];
    switch (sortOption) {
      case 'oldest':
        sorted.sort(
          (a, b) =>
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );
        break;
      case 'group':
        sorted.sort((a, b) => {
          const cmp = (a.group || '').localeCompare(b.group || '');
          if (cmp !== 0) return cmp;
          return (
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
        });
        break;
      case 'shipping':
        sorted.sort((a, b) => {
          const cmp = (a.shippingMethod || '').localeCompare(
            b.shippingMethod || ''
          );
          if (cmp !== 0) return cmp;
          return (
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
        });
        break;
      case 'newest':
      default:
        sorted.sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        break;
    }
    return sorted;
  }, [orderViewOption, dimensionedOrders, sortOption]);

  const [showSidebar, setShowSidebar] = React.useState(false);

  const session = useSession();
  const userId = session?.data?.user.id;

  const closeSidebar = () => setShowSidebar(false);

  const handleCopyEmails = async () => {
    const emails = Array.from(
      new Set(
        filteredOrders
          .map(o => o.customer?.email)
          .filter((e): e is string => !!e)
      )
    );
    if (emails.length === 0) {
      setCopyEmailsState('empty');
      setTimeout(() => setCopyEmailsState('idle'), 1200);
      return;
    }
    try {
      await navigator.clipboard.writeText(emails.join(', '));
      setCopyEmailsState('copied');
    } catch {
      setCopyEmailsState('idle');
      return;
    }
    setTimeout(() => setCopyEmailsState('idle'), 1200);
  };

  const { selectedOrderIndex, prevOrderId, nextOrderId } = React.useMemo(() => {
    if (!selectedOrder) {
      return {
        selectedOrderIndex: -1,
        prevOrderId: undefined,
        nextOrderId: undefined,
      };
    }
    const idx = filteredOrders.findIndex(
      o => o.orderId === selectedOrder.orderId
    );
    if (idx < 0) {
      return {
        selectedOrderIndex: -1,
        prevOrderId: undefined,
        nextOrderId: undefined,
      };
    }
    return {
      selectedOrderIndex: idx,
      prevOrderId: idx === 0 ? undefined : filteredOrders[idx - 1].orderId,
      nextOrderId:
        idx === filteredOrders.length - 1
          ? undefined
          : filteredOrders[idx + 1].orderId,
    };
  }, [filteredOrders, selectedOrder]);

  const updateSelectedOrder = (orderId: string) => {
    const order = filteredOrders.find(o => o.orderId === orderId);
    if (order) setSelectedOrder(order);
  };

  const buttonOnClick = (orderId: string) => {
    updateSelectedOrder(orderId);
    setShowSidebar(true);
  };

  React.useEffect(() => {
    if (router.query.orderId) {
      const order = store.orders.find(o => o.orderId === router.query.orderId);
      if (order) {
        setSelectedOrder(order);
        setShowSidebar(true);
      }
    }
  }, [router.query.orderId, setSelectedOrder, store.orders]);

  React.useEffect(() => {
    if (!showSidebar || !selectedOrder) return;
    if (!filteredOrders.some(o => o.orderId === selectedOrder.orderId)) {
      setShowSidebar(false);
    }
  }, [filteredOrders, selectedOrder, showSidebar]);

  // NOTE: this is needed to update the order status in the sidebar
  // TODO: find see if there is a better way to do this
  React.useEffect(() => {
    const updatedSelectedOrder = store.orders.find(
      order => order.orderId === selectedOrder?.orderId
    );
    setSelectedOrder(updatedSelectedOrder);
  }, [selectedOrder?.orderId, setSelectedOrder, store]);

  const showViewSelector =
    selectedView !== undefined && viewOptions.length > 1;
  const activeFilterCount =
    (searchTerm.trim().length > 0 ? 1 : 0) +
    (groupFilter ? 1 : 0) +
    (shippingFilter ? 1 : 0) +
    (orderViewOption !== 'All' ? 1 : 0);
  const hasActiveFilters = activeFilterCount > 0;

  const clearFilters = () => {
    setSearchTerm('');
    setGroupFilter('');
    setShippingFilter('');
    setOrderViewOption('All');
  };

  return (
    <OrdersTableStyles>
      <div className="orders-header">
        <div className="orders-header-row">
          <h3>Orders</h3>
          {store.orders && (
            <OrdersActionsMenu
              hasActiveFilters={hasActiveNarrowing}
              canPrintUnfulfilled={bulkPrintCounts.unfulfilled > 0}
              canPrintPersonalized={bulkPrintCounts.personalized > 0}
              canPrintFiltered={filteredOrders.length > 0}
              canDownloadCsv={bulkPrintCounts.total > 0}
              canCopyEmails={filteredOrders.length > 0}
              canTriggerShipment={canTriggerShipment}
              onPrintUnfulfilled={() => setPrintOption('unfulfilled')}
              onPrintPersonalized={() => setPrintOption('personalization')}
              onPrintFiltered={() => {
                setFilteredOrdersForPrint(filteredOrders);
                setPrintOption('filtered');
              }}
              onDownloadCsv={openCSVModal}
              onTriggerShipment={openTriggerStoreShipmentModal}
              onCopyEmails={handleCopyEmails}
              copyEmailsState={copyEmailsState}
            />
          )}
        </div>
        {totalDisplayed > 0 && (
          <p className="orders-stats">
            <span className="total">
              {totalDisplayed}
              {hasActiveNarrowing ? ' matching' : ''}{' '}
              {totalDisplayed === 1 ? 'order' : 'orders'}
            </span>
            {statsBreakdown.length > 0 && (
              <>
                <span className="separator" aria-hidden="true">
                  {' — '}
                </span>
                {statsBreakdown.join(' · ')}
              </>
            )}
          </p>
        )}
      </div>

      {store.orders && (
        <>
          <div className="orders-toolbar">
            <div className="search">
              <MagnifyingGlassIcon className="search-icon" aria-hidden="true" />
              <label htmlFor="orders-search" className="sr-only">
                Search orders
              </label>
              <input
                id="orders-search"
                type="search"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                placeholder="Search by name, email, phone, or order #"
                autoComplete="off"
              />
            </div>
            {showViewSelector && (
              <OrderViewSelector
                viewOptions={viewOptions}
                selectedView={selectedView as OrderView}
                setSelectedView={setSelectedView}
              />
            )}
            {showGroupControls && (
              <div className="toolbar-select">
                <label htmlFor="orders-group-filter" className="sr-only">
                  Filter by {store.groupTerm}
                </label>
                <select
                  id="orders-group-filter"
                  value={groupFilter}
                  onChange={e => setGroupFilter(e.target.value)}
                >
                  <option value="">All {store.groupTerm}s</option>
                  {distinctGroups.map(g => (
                    <option key={g} value={g}>
                      {g}
                    </option>
                  ))}
                </select>
              </div>
            )}
            {showShippingFilter && (
              <div className="toolbar-select">
                <label htmlFor="orders-shipping-filter" className="sr-only">
                  Filter by shipping method
                </label>
                <select
                  id="orders-shipping-filter"
                  value={shippingFilter}
                  onChange={e => setShippingFilter(e.target.value)}
                >
                  <option value="">All shipping</option>
                  {distinctShippingMethods.map(s => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
            )}
            <div className="toolbar-select">
              <label htmlFor="orders-sort" className="sr-only">
                Sort orders
              </label>
              <select
                id="orders-sort"
                value={sortOption}
                onChange={e => setSortOption(e.target.value as SortOption)}
              >
                <option value="newest">Newest first</option>
                <option value="oldest">Oldest first</option>
                {showGroupControls && (
                  <option value="group">{store.groupTerm} A→Z</option>
                )}
                {showShippingFilter && (
                  <option value="shipping">Shipping method</option>
                )}
              </select>
            </div>
            {hasActiveFilters && (
              <button
                type="button"
                className="clear-filters-button"
                onClick={clearFilters}
              >
                <XMarkIcon className="clear-icon" aria-hidden="true" />
                <span>Clear filters</span>
                <span className="clear-count" aria-hidden="true">
                  {activeFilterCount}
                </span>
                <span className="sr-only">
                  ({activeFilterCount} active)
                </span>
              </button>
            )}
          </div>

          <div className="buttons">
            <div className="container">
              {visibleFilterItems.map(item => (
                <button
                  key={item.id}
                  type="button"
                  className={orderViewOption === item.option ? 'active' : ''}
                  onClick={() => setOrderViewOption(item.option)}
                >
                  {item.option === 'PartiallyShipped'
                    ? 'Partially Shipped'
                    : item.option}{' '}
                  <span className="status-total">
                    {scopedStatusTotals[item.option]}
                  </span>
                </button>
              ))}
            </div>
          </div>
          <div className="table-scroll-area">
            <Table customClass="table-container">
              <table>
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Customer</th>
                    {store.requireGroupSelection && <th>{store.groupTerm}</th>}
                    <th>Shipping</th>
                    <th className="text-center">Unique / Total</th>
                    <th className="text-center">Items status</th>
                    <th className="text-center">Order Status</th>
                    <th className="text-center">Personlized</th>
                    <th className="text-right">Note</th>
                    <th />
                  </tr>
                </thead>
                <tbody>
                  {filteredOrders.length === 0 ? (
                    <tr>
                      <td className="empty">
                        {isSearching
                          ? `No orders match “${throttledSearchTerm.trim()}”`
                          : `There are no${
                              orderViewOption !== 'All'
                                ? ' ' + orderViewOption.toLowerCase()
                                : ''
                            } orders`}
                      </td>
                    </tr>
                  ) : (
                    <>
                      {filteredOrders.map((o, index) => {
                        const orderHasUnfulfilledOrBackorderedItems =
                          o.items.some(
                            i =>
                              i.status.current === 'Unfulfilled' ||
                              i.status.current === 'Backordered'
                          );
                        return (
                          <tr key={o.orderId}>
                            <td>
                              <ButtonWrapper
                                onClick={() => buttonOnClick(o.orderId)}
                              >
                                {index + 1}.
                              </ButtonWrapper>
                            </td>
                            <td>
                              <ButtonWrapper
                                onClick={() => buttonOnClick(o.orderId)}
                              >
                                <div className="customer-name">
                                  {o.customer.firstName} {o.customer.lastName}
                                </div>
                                <div className="create-at-date">
                                  {format(
                                    new Date(o.createdAt),
                                    'MM/dd/yyyy h:mmaa'
                                  )}
                                </div>
                                <div className="order-id">#{o.orderId}</div>
                                <div className="order-total">
                                  {formatToMoney(o.summary.total, true)}
                                </div>
                              </ButtonWrapper>
                            </td>
                            {store.requireGroupSelection && (
                              <td>
                                <ButtonWrapper
                                  onClick={() => buttonOnClick(o.orderId)}
                                >
                                  {o.group}
                                </ButtonWrapper>
                              </td>
                            )}
                            <td>
                              <ButtonWrapper
                                onClick={() => buttonOnClick(o.orderId)}
                              >
                                {o.shippingMethod}
                              </ButtonWrapper>
                            </td>
                            <td className="text-center">
                              <ButtonWrapper
                                onClick={() => buttonOnClick(o.orderId)}
                              >
                                {o.orderStatus === 'Canceled'
                                  ? 0
                                  : o.items.length}{' '}
                                /{' '}
                                {o.orderStatus === 'Canceled'
                                  ? 0
                                  : calculateTotalItems(o.items)}
                              </ButtonWrapper>
                            </td>
                            <td className="text-center">
                              <ButtonWrapper
                                customClassName="order-items-button-wrapper"
                                onClick={() => buttonOnClick(o.orderId)}
                              >
                                <OrdersTableItemsBreakdown
                                  orderItems={o.items}
                                />
                              </ButtonWrapper>
                            </td>
                            <td className="text-center order-status">
                              <ButtonWrapper
                                onClick={() => buttonOnClick(o.orderId)}
                              >
                                <OrderStatusComponent
                                  order={o}
                                  customClass="custom-table-order-status"
                                />
                              </ButtonWrapper>
                            </td>
                            <td className="text-center personalized">
                              <ButtonWrapper
                                onClick={() => buttonOnClick(o.orderId)}
                                customClassName="note-button"
                              >
                                {o.items.some(
                                  item => item.personalizationAddons.length > 0
                                ) ? (
                                  <span className="personalized-span">P</span>
                                ) : null}
                              </ButtonWrapper>
                            </td>
                            <td className="note">
                              <ButtonWrapper
                                onClick={() => buttonOnClick(o.orderId)}
                                customClassName="note-button"
                              >
                                {o.note ? (
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 20 20"
                                    fill="currentColor"
                                  >
                                    <path
                                      fillRule="evenodd"
                                      d="M3.43 2.524A41.29 41.29 0 0110 2c2.236 0 4.43.18 6.57.524 1.437.231 2.43 1.49 2.43 2.902v5.148c0 1.413-.993 2.67-2.43 2.902a41.202 41.202 0 01-5.183.501.78.78 0 00-.528.224l-3.579 3.58A.75.75 0 016 17.25v-3.443a41.033 41.033 0 01-2.57-.33C1.993 13.244 1 11.986 1 10.573V5.426c0-1.413.993-2.67 2.43-2.902z"
                                      clipRule="evenodd"
                                    />
                                  </svg>
                                ) : null}
                              </ButtonWrapper>
                            </td>
                            <td
                              className={
                                orderHasUnfulfilledOrBackorderedItems
                                  ? ''
                                  : 'blank-td'
                              }
                            >
                              {orderHasUnfulfilledOrBackorderedItems ? (
                                <UnfulfilledToFulfulledButton
                                  {...{
                                    order: o,
                                    store,
                                    userId,
                                    orderHasUnfulfilledOrBackorderedItems,
                                  }}
                                />
                              ) : (
                                <ButtonWrapper
                                  onClick={() => buttonOnClick(o.orderId)}
                                >
                                  <span />
                                </ButtonWrapper>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </>
                  )}
                </tbody>
              </table>
            </Table>
          </div>
          <OrderSidebar
            {...{
              closeSidebar,
              isOpen: showSidebar,
              selectedOrder,
              selectedOrderIndex,
              totalCount: filteredOrders.length,
              prevOrderId,
              nextOrderId,
              updateSelectedOrder,
              store,
              setPrintOption,
              showCancelOrderModal,
              setShowCancelOrderModal,
              openTriggerStoreShipmentModal,
            }}
          />
        </>
      )}
    </OrdersTableStyles>
  );
}

const OrdersTableStyles = styled.div`
  .orders-header {
    margin: 0 0 1.25rem;
  }

  .orders-header-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 1rem;
  }

  h3 {
    margin: 0;
  }

  .orders-stats {
    margin: 0.375rem 0 0;
    font-size: 0.875rem;
    color: #4b5563;
    line-height: 1.4;

    .total {
      font-weight: 600;
      color: #1f2937;
    }

    .separator {
      color: #9ca3af;
    }
  }

  .orders-toolbar {
    margin: 0 0 1.25rem;
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 0.75rem;
  }

  .clear-filters-button {
    padding: 0.375rem 0.5rem 0.375rem 0.625rem;
    display: inline-flex;
    align-items: center;
    gap: 0.375rem;
    background-color: #fff;
    border: 1px solid #d1d5db;
    border-radius: 0.375rem;
    box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05);
    font-size: 0.8125rem;
    font-weight: 500;
    color: #4b5563;
    cursor: pointer;
    transition: color 100ms ease-in-out, border-color 100ms ease-in-out,
      background-color 100ms ease-in-out;

    .clear-icon {
      height: 0.875rem;
      width: 0.875rem;
      color: #9ca3af;
    }

    .clear-count {
      padding: 0 0.375rem;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      min-width: 1.125rem;
      height: 1.125rem;
      background-color: #e5e7eb;
      border-radius: 9999px;
      font-size: 0.6875rem;
      font-weight: 600;
      color: #374151;
      line-height: 1;
    }

    &:hover {
      color: #1f2937;
      border-color: #9ca3af;
      background-color: #f9fafb;

      .clear-icon {
        color: #4b5563;
      }
    }

    &:focus {
      outline: 2px solid transparent;
      outline-offset: 2px;
    }

    &:focus-visible {
      border-color: #1c44b9;
      box-shadow: rgb(255, 255, 255) 0px 0px 0px 0px,
        #1c44b9 0px 0px 0px 1px, rgba(0, 0, 0, 0.05) 0px 1px 2px 0px;
    }
  }

  .toolbar-select select {
    padding: 0.4375rem 2rem 0.4375rem 0.75rem;
    background-color: #fff;
    background-image: url("data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 20 20' fill='%236b7280'%3E%3Cpath fill-rule='evenodd' d='M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z' clip-rule='evenodd' /%3E%3C/svg%3E");
    background-repeat: no-repeat;
    background-position: right 0.5rem center;
    background-size: 1rem;
    border: 1px solid #d1d5db;
    border-radius: 0.375rem;
    box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05);
    font-size: 0.875rem;
    font-weight: 500;
    color: #1f2937;
    cursor: pointer;
    appearance: none;

    &:focus {
      outline: 2px solid transparent;
      outline-offset: 2px;
      border-color: #1c44b9;
      box-shadow: rgb(255, 255, 255) 0px 0px 0px 0px,
        #1c44b9 0px 0px 0px 1px, rgba(0, 0, 0, 0.05) 0px 1px 2px 0px;
    }

    &:hover {
      border-color: #9199a6;
    }
  }

  .search {
    position: relative;
    flex: 1;
    min-width: 0;

    .search-icon {
      position: absolute;
      top: 50%;
      left: 0.75rem;
      transform: translateY(-50%);
      height: 1.125rem;
      width: 1.125rem;
      color: #9ca3af;
      pointer-events: none;
    }

    input {
      padding: 0.5rem 0.75rem 0.5rem 2.25rem;
      width: 100%;
      background-color: #fff;
      border: 1px solid #d1d5db;
      border-radius: 0.375rem;
      box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05);
      font-size: 0.875rem;
      color: #1f2937;

      &::placeholder {
        color: #9ca3af;
      }

      &:focus {
        outline: 2px solid transparent;
        outline-offset: 2px;
        border-color: #1c44b9;
        box-shadow: rgb(255, 255, 255) 0px 0px 0px 0px,
          #1c44b9 0px 0px 0px 1px, rgba(0, 0, 0, 0.05) 0px 1px 2px 0px;
      }
    }
  }

  .buttons {
    margin: 0 0 1.75rem;
    width: 100%;

    .container {
      padding: 0.1875rem;
      width: 100%;
      display: flex;
      gap: 0.25rem;
      background-color: #e8eaee;
      border: 1px solid #d1d5db;
      border-radius: 0.375rem;
      box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05);
    }

    button {
      flex: 1 1 0;
      padding: 0.625rem 0.9375rem;
      display: flex;
      justify-content: center;
      align-items: center;
      gap: 0.375rem;
      background-color: transparent;
      border: 1px solid transparent;
      font-size: 0.875rem;
      font-weight: 500;
      color: #1f2937;
      border-radius: 0.375rem;
      cursor: pointer;

      .status-total {
        display: inline-flex;
        justify-content: center;
        align-items: center;
        height: 1.25rem;
        width: 1.25rem;
        background-color: #d1d5dd;
        font-size: 0.625rem;
        font-weight: 600;
        border-radius: 9999px;
        color: #323843;
      }

      &:hover {
        color: #1f2937;
      }

      &.active {
        background-color: #fff;
        border-color: #c6cbd2;
        color: #1f2937;
        box-shadow: rgba(0, 0, 0, 0) 0px 0px 0px 0px,
          rgba(0, 0, 0, 0) 0px 0px 0px 0px, rgba(0, 0, 0, 0.05) 0px 1px 2px 0px;
      }
    }
  }

  .table-scroll-area {
    overflow-x: auto;
  }

  .table-container {
    margin-bottom: 0.1875rem;
    min-width: 67rem;
  }

  th:first-of-type,
  td:first-of-type button {
    padding-left: 2rem;
    padding-right: 0;
  }

  .order-items-button-wrapper {
    display: flex;
    justify-content: center;
    align-items: center;
    padding-top: 0.5rem;
    padding-bottom: 0.5rem;
  }

  th {
    padding-top: 0.75rem;
    padding-bottom: 0.75rem;
  }

  td {
    background-color: #fdfdfd;
  }

  tr:last-of-type {
    td:first-of-type {
      border-bottom-left-radius: 0.375rem;
    }
    td:last-of-type {
      border-bottom-right-radius: 0.375rem;
    }
  }

  td,
  td:first-of-type {
    padding: 0;
    &.empty {
      padding: 1.25rem 2rem;
      color: #1f2937;
      font-size: 0.9375rem;
    }

    &.order-number {
      padding-right: 0;
      padding-left: 0;
      .order-number-button {
        padding-right: 0;
        padding-left: 0;
      }
    }

    &.order-status {
      padding-left: 1rem;
      padding-right: 1rem;
      .custom-table-order-status {
        padding: 0.3125rem 0;
        min-width: 7.25rem;
        font-size: 0.625rem;
      }
    }

    &.personalized {
      .personalized-span {
        margin: 0 auto;
        padding: 0 0 0 0.0625rem;
        height: 1.25rem;
        width: 1.25rem;
        display: flex;
        justify-content: center;
        align-items: center;
        background-color: #4b5563;
        color: #fff;
        font-size: 0.5625rem;
        font-weight: 700;
        text-align: center;
        line-height: 100%;
        border-radius: 9999px;
      }
    }

    &.note {
      padding: 0;
      .note-button {
        padding-left: 0;
        width: 100%;
        display: flex;
        align-items: center;
        svg {
          height: 1.0625rem;
          width: 1.0625rem;
          color: #4b5563;
        }
      }
    }

    &.blank-td {
      padding: 0;
    }
  }

  .customer-name {
    font-size: 0.875rem;
    font-weight: 600;
    color: #09090b;
    line-height: 100%;
  }

  .create-at-date,
  .order-id,
  .order-total {
    margin-top: 0.25rem;
    font-size: 0.75rem;
    font-weight: 500;
    color: #71717a;
  }

  .order-actions {
    padding-left: 0;
    position: relative;
  }
`;
