import { getStoreStatus } from '.';

import { Store } from '../interfaces';

export function sortStoresByOpenDate(stores: Store[], isDescending: boolean) {
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

export function sortStoresByCloseDate(stores: Store[], isDescending: boolean) {
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

interface StoreAccumulator {
  upcomingStores: Store[];
  openStores: Store[];
  closedStores: Store[];
}

export function homepageStoresReducer(stores: Store[]) {
  try {
    const { closedStores, openStores, upcomingStores } = stores.reduce(
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

        const storeHasOrdersNotCompletedOrCanceled = currentStore.orders.some(
          order =>
            order.orderStatus !== 'Completed' &&
            order.orderStatus !== 'Canceled'
        );

        if (storeStatus === 'closed' && storeHasOrdersNotCompletedOrCanceled) {
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

    return [...closedStores, ...openStores, ...upcomingStores];
  } catch (err) {
    console.log(err);
  }
}
