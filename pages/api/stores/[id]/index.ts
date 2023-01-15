import { NextApiResponse } from 'next';
import nc from 'next-connect';

import {
  Request,
  Store,
  StoreWithOrderStatusTotals,
} from '../../../../interfaces';

import { withAuth } from '../../../../utils/withAuth';

import database from '../../../../middleware/db';
import { inventoryProduct, store } from '../../../../db';

import {
  addArtworkIdToStoreOrders,
  getStoresOrderStatusNumbers,
  hydrateStoreProducts,
} from '../../../../utils/store';

const handler = nc<Request, NextApiResponse>()
  .use(database)
  .get(async (req, res) => {
    const queriedStore: Store = await store.getStoreById(req.db, req.query.id);

    const queriedInventoryProducts =
      await inventoryProduct.getAllInventoryProducts(req.db);

    // hydrate store products to include active, inventory, and inventorySkuActive
    // TODO: should we query for only the inventory products for this store instead of all of them?
    const hydratedStoreProducts = hydrateStoreProducts(
      queriedStore,
      queriedInventoryProducts
    );

    const ordersUpdatedWithArtworkId = addArtworkIdToStoreOrders(queriedStore);

    const orderStatusTotals = getStoresOrderStatusNumbers(queriedStore);

    const result: StoreWithOrderStatusTotals = {
      ...queriedStore,
      products: hydratedStoreProducts,
      orders: ordersUpdatedWithArtworkId,
      orderStatusTotals,
    };

    res.json({ store: result });
  });

export default withAuth(handler);
