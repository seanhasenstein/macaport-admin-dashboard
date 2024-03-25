import { getStoreStatus } from '.';
import {
  Order,
  Store,
  StoresTableOrders,
  StoresTableStore,
} from '../interfaces';

export function getStoresTableOrders(orders: Order[]) {
  return orders.reduce(
    (acc: StoresTableOrders, currOrder) => {
      switch (currOrder.orderStatus) {
        case 'Unfulfilled':
          acc = { ...acc, unfulfilled: acc.unfulfilled + 1 };
          break;
        case 'Printed':
          acc = { ...acc, printed: acc.printed + 1 };
          break;
        case 'Fulfilled':
          acc = { ...acc, fulfilled: acc.fulfilled + 1 };
          break;
        case 'PartiallyShipped':
          acc = { ...acc, partiallyShipped: acc.partiallyShipped + 1 };
          break;
        case 'Shipped':
          acc = { ...acc, shipped: acc.shipped + 1 };
          break;
        case 'Canceled':
          acc = { ...acc, canceled: acc.canceled + 1 };
          break;
        default:
          break;
      }

      return { ...acc, total: acc.total + 1 };
    },
    {
      unfulfilled: 0,
      printed: 0,
      fulfilled: 0,
      partiallyShipped: 0,
      shipped: 0,
      canceled: 0,
      total: 0,
    }
  );
}

export function convertStoreToStoresTableStore(store: Store): StoresTableStore {
  const storesTableStoreOrders = getStoresTableOrders(store.orders);
  return {
    ...store,
    products: store.products.length,
    orders: store.orders,
    ordersStatusTotals: storesTableStoreOrders,
  };
}

interface StoreAccumulator {
  upcomingStores: StoresTableStore[];
  openStores: StoresTableStore[];
  closedStores: StoresTableStore[];
}

export function getStoresTableStores(stores: Store[]) {
  return stores.reduce(
    (acc: StoreAccumulator, currentStore) => {
      const storeStatus = getStoreStatus(
        currentStore.openDate,
        currentStore.closeDate
      );

      if (storeStatus === 'open') {
        const storesTableStore = convertStoreToStoresTableStore(currentStore);
        const sortedOpenStores = sortStoresByCloseDate(
          [...acc.openStores, storesTableStore],
          false
        );
        return { ...acc, openStores: sortedOpenStores };
      }

      if (storeStatus === 'upcoming') {
        const storesTableStore = convertStoreToStoresTableStore(currentStore);
        const sortedUpcomingStores = sortStoresByOpenDate(
          [...acc.upcomingStores, storesTableStore],
          false
        );
        return { ...acc, upcomingStores: sortedUpcomingStores };
      }

      const storeHasOrdersNotShippedOrCanceled = currentStore.orders.some(
        order =>
          order.orderStatus !== 'Shipped' && order.orderStatus !== 'Canceled'
      );

      if (storeStatus === 'closed' && storeHasOrdersNotShippedOrCanceled) {
        const storesTableStore = convertStoreToStoresTableStore(currentStore);
        const sortedClosedStores = sortStoresByCloseDate(
          [...acc.closedStores, storesTableStore],
          false
        );
        return { ...acc, closedStores: sortedClosedStores };
      }

      return acc;
    },
    { upcomingStores: [], openStores: [], closedStores: [] }
  );
}

function sortStoresByOpenDate(
  stores: StoresTableStore[],
  isDescending: boolean
) {
  return stores.sort((storeA, storeB) => {
    const result = () => {
      if (storeA.openDate > storeB.openDate) {
        return 1;
      } else if (storeA.openDate < storeB.openDate) {
        return -1;
      } else {
        return 0;
      }
    };

    return isDescending ? result() * -1 : result();
  });
}

function sortStoresByCloseDate(
  stores: StoresTableStore[],
  isDescending: boolean
) {
  return stores.sort((storeA, storeB) => {
    const storeACloseDate = storeA.closeDate
      ? storeA.closeDate
      : '9999-01-01T00:00:00-05:00';
    const storeBCloseDate = storeB.closeDate
      ? storeB.closeDate
      : '9999-01-01T00:00:00-05:00';

    const result = () => {
      if (storeACloseDate > storeBCloseDate) {
        return 1;
      } else if (storeACloseDate < storeBCloseDate) {
        return -1;
      } else {
        return 0;
      }
    };

    return isDescending ? result() * -1 : result();
  });
}
