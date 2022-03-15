import { Store } from '../interfaces';
import { getStoreStatus } from '../utils';

interface StoreAccumulator {
  upcomingStores: Store[];
  openStores: Store[];
  closedStores: Store[];
}

function sortStoresByOpenDate(stores: Store[], isDescending: boolean) {
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

function sortStoresByCloseDate(stores: Store[], isDescending: boolean) {
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

export async function fetchHomepageStores() {
  const response = await fetch('/api/stores');

  if (!response.ok) {
    throw new Error('Failed to fetch the stores.');
  }

  const data: { stores: Store[] } = await response.json();

  const storeReducer = data.stores.reduce(
    (accumulator: StoreAccumulator, currentStore) => {
      const storeStatus = getStoreStatus(
        currentStore.openDate,
        currentStore.closeDate
      );

      if (storeStatus === 'open') {
        const sortedOpenStores = sortStoresByCloseDate(
          [...accumulator.openStores, currentStore],
          false
        );
        return { ...accumulator, openStores: sortedOpenStores };
      }

      if (storeStatus === 'upcoming') {
        const sortedUpcomingStores = sortStoresByOpenDate(
          [...accumulator.upcomingStores, currentStore],
          false
        );
        return { ...accumulator, upcomingStores: sortedUpcomingStores };
      }

      const storeHasUnfulfilledOrders = currentStore.orders.some(
        order => order.orderStatus === 'Unfulfilled'
      );

      if (storeStatus === 'closed' && storeHasUnfulfilledOrders) {
        const sortedClosedStores = sortStoresByCloseDate(
          [...accumulator.closedStores, currentStore],
          false
        );
        return { ...accumulator, closedStores: sortedClosedStores };
      }

      return accumulator;
    },
    { upcomingStores: [], openStores: [], closedStores: [] }
  );

  const stores = [
    ...storeReducer.closedStores,
    ...storeReducer.openStores,
    ...storeReducer.upcomingStores,
  ];

  return stores;
}

export async function fetchAllStores() {
  const response = await fetch('/api/stores');

  if (!response.ok) {
    throw new Error('Failed to fetch the stores.');
  }

  const data: { stores: Store[] } = await response.json();

  const storesReducer = data.stores.reduce(
    (accumulator: StoreAccumulator, currentStore) => {
      const storeStatus = getStoreStatus(
        currentStore.openDate,
        currentStore.closeDate
      );

      if (storeStatus === 'open') {
        const sortedOpenStores = sortStoresByCloseDate(
          [...accumulator.openStores, currentStore],
          false
        );
        return { ...accumulator, openStores: sortedOpenStores };
      }

      if (storeStatus === 'upcoming') {
        const sortedUpcomingStores = sortStoresByOpenDate(
          [...accumulator.upcomingStores, currentStore],
          false
        );
        return { ...accumulator, upcomingStores: sortedUpcomingStores };
      }

      if (storeStatus === 'closed') {
        const sortedClosedStores = sortStoresByCloseDate(
          [...accumulator.closedStores, currentStore],
          true
        );
        return { ...accumulator, closedStores: sortedClosedStores };
      }

      return accumulator;
    },
    { openStores: [], upcomingStores: [], closedStores: [] }
  );

  return [
    ...storesReducer.upcomingStores,
    ...storesReducer.openStores,
    ...storesReducer.closedStores,
  ];
}
