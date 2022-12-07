import { NextApiResponse } from 'next';
import nc from 'next-connect';
import { withAuth } from '../../../../utils/withAuth';
import { Request, Store } from '../../../../interfaces';
import database from '../../../../middleware/db';
import { inventoryProduct, store } from '../../../../db';
import { hydrateOrderItemsWithArtworkId } from '../../../../utils/orderItem';

const handler = nc<Request, NextApiResponse>()
  .use(database)
  .get(async (req, res) => {
    const queriedStore: Store = await store.getStoreById(req.db, req.query.id);
    const inventoryProducts = await inventoryProduct.getAllInventoryProducts(
      req.db
    );

    // hydrate store products to include active, inventory, and inventorySkuActive
    const updatedStoreProducts = queriedStore.products.map(storeProduct => {
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

    // add artworkId from the storeProduct to every orderItem
    const updatedOrders = queriedStore.orders.map(order => {
      const updatedOrderItems = hydrateOrderItemsWithArtworkId(
        order.items,
        queriedStore.products
      );
      return { ...order, items: updatedOrderItems };
    });

    const result: Store = {
      ...queriedStore,
      products: updatedStoreProducts,
      orders: updatedOrders,
    };

    res.json({ store: result });
  });

export default withAuth(handler);
