import { getStoreStatus } from '.';
import { Store, StoreStatusFilter } from '../interfaces';

export function storeStatusMatches(
  storeStatusFilter: StoreStatusFilter,
  store: Store
) {
  if (storeStatusFilter === 'all') {
    return true;
  } else {
    return (
      getStoreStatus(store.openDate, store.closeDate) === storeStatusFilter
    );
  }
}

export function paginatedStoresReducer(
  stores: Store[],
  storeStatus: StoreStatusFilter,
  onlyUnfulfilled: boolean
) {
  return stores.reduce((acc: Store[], currResult) => {
    if (onlyUnfulfilled) {
      if (
        currResult.orders.some(order => order.orderStatus === 'Unfulfilled')
      ) {
        if (storeStatusMatches(storeStatus, currResult)) {
          return [...acc, currResult];
        } else {
          return acc;
        }
      } else {
        return acc;
      }
    } else {
      if (storeStatusMatches(storeStatus, currResult)) {
        return [...acc, currResult];
      } else {
        return acc;
      }
    }
  }, []);
}
