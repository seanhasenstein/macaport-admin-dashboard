import { NextApiResponse } from 'next';
import nc from 'next-connect';
import { withAuth } from '../../../utils/withAuth';
import { Request } from '../../../interfaces';
import database from '../../../middleware/db';
import { store as storeModel } from '../../../db';

interface ExtendedRequest extends Request {
  body: {
    storeId: string;
    productIds: string[];
  };
}

const handler = nc<ExtendedRequest, NextApiResponse>()
  .use(database)
  .post(async (req, res) => {
    const store = await storeModel.getStoreById(req.db, req.body.storeId);

    const products = req.body.productIds.map(productId => {
      const storeProduct = store.products.find(
        storeProduct => storeProduct.id === productId
      );
      return storeProduct;
    });

    const result = await storeModel.updateStore(req.db, req.body.storeId, {
      products,
    });

    res.json({ store: result });
  });

export default withAuth(handler);
