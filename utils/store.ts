import { getStoreStatus } from '.';
import {
  InventoryProduct,
  OrderStatusKey,
  Store,
  StoresTableStore,
  StoreStatusFilter,
} from '../interfaces';
import { hydrateOrderItemsWithArtworkId } from './orderItem';
import { convertStoreToStoresTableStore } from './storesTable';

export function addArtworkIdToStoreOrders(store: Store) {
  return store.orders.map(order => {
    const updatedOrderItems = hydrateOrderItemsWithArtworkId(
      order.items,
      store.products
    );

    return { ...order, items: updatedOrderItems };
  });
}

type OrderStatusNumbersAccumulator = Record<OrderStatusKey, number>;

export function getStoresOrderStatusNumbers(store: Store) {
  return store.orders.reduce(
    (accumulator: OrderStatusNumbersAccumulator, currentOrder) => {
      return {
        ...accumulator,
        [currentOrder.orderStatus]: accumulator[currentOrder.orderStatus] + 1,
      };
    },
    {
      All: store.orders.length,
      Unfulfilled: 0,
      Printed: 0,
      Fulfilled: 0,
      Completed: 0,
      Canceled: 0,
    }
  );
}

// hydrate store products to include active, inventory, and inventorySkuActive
export function hydrateStoreProducts(
  store: Store,
  inventoryProducts: InventoryProduct[]
) {
  return store.products.map(storeProduct => {
    const ip = inventoryProducts.find(
      currInvProd =>
        currInvProd.inventoryProductId === storeProduct.inventoryProductId
    );

    const updatedProductSkus = storeProduct.productSkus.map(productSku => {
      const inventorySku = ip?.skus.find(
        ipSku => ipSku.id === productSku.inventorySkuId
      );

      return {
        ...productSku,
        active: productSku.active,
        inventory: inventorySku?.inventory,
        inventorySkuActive: inventorySku?.active,
      };
    });

    return { ...storeProduct, productSkus: updatedProductSkus };
  });
}

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
  selectedStatus: StoreStatusFilter,
  onlyUnfulfilled: boolean
) {
  return stores.reduce((acc: StoresTableStore[], currStore) => {
    // if 'only stores with unfulfilled orders' is checked
    // if (onlyUnfulfilled) {
    //   if (currStore.orders.some(order => order.orderStatus === 'Unfulfilled')) {
    //     if (storeStatusMatches(storeStatus, currStore)) {
    //       const storesTableStore = convertStoreToStoresTableStore(currStore);
    //       return [...acc, storesTableStore];
    //     } else {
    //       return acc;
    //     }
    //   } else {
    //     return acc;
    //   }
    // } else {
    if (storeStatusMatches(selectedStatus, currStore)) {
      if (onlyUnfulfilled) {
        if (
          currStore.orders.some(order => order.orderStatus === 'Unfulfilled')
        ) {
          const storesTableStore = convertStoreToStoresTableStore(currStore);
          return [...acc, storesTableStore];
        }
        return acc;
      }
      const storesTableStore = convertStoreToStoresTableStore(currStore);
      return [...acc, storesTableStore];
    } else {
      return acc;
      // }
    }
  }, []);
}
