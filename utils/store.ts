import { getStoreStatus } from '.';
import {
  InventoryProduct,
  Order,
  OrderStatusKey,
  Store,
  StoresTableStore,
  StoreStatusFilter,
} from '../interfaces';
import { hydrateOrderItemsWithArtworkId } from './orderItem';
import { convertStoreToStoresTableStore } from './storesTable';

export type OrderView = number | 'all' | 'outstanding';

export type OrderViewOption = {
  view: OrderView;
  count: number;
};

const SETTLED_ORDER_STATUSES: ReadonlySet<string> = new Set([
  'Shipped',
  'Canceled',
]);

export function isOrderOutstanding(order: Order): boolean {
  return !SETTLED_ORDER_STATUSES.has(order.orderStatus);
}

export function getOrderViewOptions(orders: Order[]): OrderViewOption[] {
  if (!orders || orders.length === 0) return [];

  const counts = new Map<number, number>();
  let outstandingCount = 0;
  for (const order of orders) {
    const year = new Date(order.createdAt).getFullYear();
    counts.set(year, (counts.get(year) ?? 0) + 1);
    if (isOrderOutstanding(order)) outstandingCount += 1;
  }

  const yearOptions: OrderViewOption[] = Array.from(counts.entries())
    .sort(([a], [b]) => b - a)
    .map(([year, count]) => ({ view: year, count }));

  const options: OrderViewOption[] = [];
  if (outstandingCount > 0) {
    options.push({ view: 'outstanding', count: outstandingCount });
  }
  options.push(...yearOptions);
  if (yearOptions.length > 1) {
    options.push({ view: 'all', count: orders.length });
  }

  return options;
}

export function filterOrdersByView(
  orders: Order[],
  selectedView: OrderView
): Order[] {
  if (selectedView === 'all') return orders;
  if (selectedView === 'outstanding') return orders.filter(isOrderOutstanding);
  return orders.filter(
    o => new Date(o.createdAt).getFullYear() === selectedView
  );
}

export function addArtworkIdToStoreOrders(store: Store) {
  return store.orders.map(order => {
    const updatedOrderItems = hydrateOrderItemsWithArtworkId(
      order.items,
      store.products
    );

    return { ...order, items: updatedOrderItems };
  });
}

type OrderStatusNumbersAccumulator = Record<
  OrderStatusKey | 'Personalized',
  number
>;

export function getStoresOrderStatusNumbers(store: Store) {
  return store.orders.reduce(
    (accumulator: OrderStatusNumbersAccumulator, currentOrder) => {
      const personalized =
        accumulator.Personalized +
        (currentOrder.items.some(item => item.personalizationAddons.length > 0)
          ? 1
          : 0);

      if (
        currentOrder.orderStatus === 'Unfulfilled' &&
        currentOrder.meta.receiptPrinted
      ) {
        return {
          ...accumulator,
          Printed: accumulator.Printed + 1,
          Personalized: personalized,
        };
      } else {
        return {
          ...accumulator,
          [currentOrder.orderStatus]: accumulator[currentOrder.orderStatus] + 1,
          Personalized: personalized,
        };
      }
    },
    {
      All: store.orders.length,
      Unfulfilled: 0,
      Printed: 0,
      Fulfilled: 0,
      PartiallyShipped: 0,
      Shipped: 0,
      Canceled: 0,
      Personalized: 0,
      Completed: 0, // todo: remove this
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
    }
  }, []);
}
