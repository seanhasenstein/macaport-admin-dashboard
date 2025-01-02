import { NextApiResponse } from 'next';
import nc from 'next-connect';
import { withAuth } from '../../../utils/withAuth';
import { Request } from '../../../interfaces';
import database from '../../../middleware/db';
import { store } from '../../../db';

const handler = nc<Request, NextApiResponse>()
  .use(database)
  .post(async (req, res) => {
    const { storeId, storeProductId, productSkuId, updatedProductSku } =
      req.body;
    const result = await store.updateStoreProductSkuStatus(req.db, {
      storeId,
      storeProductId,
      productSkuId,
      updatedProductSku,
    });
    res.json({ storeProduct: result });
  });

export default withAuth(handler);
