import { NextApiResponse } from 'next';
import nc from 'next-connect';
import { withAuth } from '../../../utils/withAuth';
import { Request, Store } from '../../../interfaces';
import database from '../../../middleware/db';
import {
  inventoryProduct as inventoryProductModel,
  store as storeModel,
} from '../../../db';

const handler = nc<Request, NextApiResponse>()
  .use(database)
  .get(async (req, res) => {
    const store: Store = await storeModel.getStoreById(req.db, req.query.sid);

    const storeProduct = store.products.find(p => p.id === req.query.pid);

    if (!storeProduct) {
      throw new Error('Failed to find storeProduct.');
    }

    const inventoryProduct =
      await inventoryProductModel.getInventoryProductById(
        req.db,
        storeProduct.inventoryProductId
      );

    const updatedProductSkus = storeProduct?.productSkus.map(productSku => {
      const inventorySku = inventoryProduct?.skus.find(
        s => s.id === productSku.inventorySkuId
      );
      return {
        ...productSku,
        active: productSku.active,
        inventory: inventorySku?.inventory,
        inventorySkuActive: inventorySku?.active,
      };
    });

    const result = { ...storeProduct, productSkus: updatedProductSkus };

    res.json({ storeProduct: result });
  });

export default withAuth(handler);
