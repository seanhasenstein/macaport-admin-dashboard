import { getStoreStatus } from '.';
import { Store, StoresTableStore, StoreStatusFilter } from '../interfaces';
import { convertStoreToStoresTableStore } from './storesTable';

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
  return stores.reduce((acc: StoresTableStore[], currStore) => {
    // if 'only stores with unfulfilled orders' is checked
    if (onlyUnfulfilled) {
      if (currStore.orders.some(order => order.orderStatus === 'Unfulfilled')) {
        if (storeStatusMatches(storeStatus, currStore)) {
          const storesTableStore = convertStoreToStoresTableStore(currStore);
          return [...acc, storesTableStore];
        } else {
          return acc;
        }
      } else {
        return acc;
      }
    } else {
      if (storeStatusMatches(storeStatus, currStore)) {
        const storesTableStore = convertStoreToStoresTableStore(currStore);
        return [...acc, storesTableStore];
      } else {
        return acc;
      }
    }
  }, []);
}
