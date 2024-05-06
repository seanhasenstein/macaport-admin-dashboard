import { NextApiResponse } from 'next';
import nc from 'next-connect';
import { withAuth } from '../../../utils/withAuth';
import { Request, Store } from '../../../interfaces';
import database from '../../../middleware/db';
import { store } from '../../../db';

const handler = nc<Request, NextApiResponse>()
  .use(database)
  .post(async (req, res) => {
    const storeQuery: Store = await store.getStoreById(
      req.db,
      req.body.storeId
    );

    const updatedProducts = storeQuery.products.filter(
      p => p.id !== req.body.storeProductId
    );

    const { _id, ...updatedStore } = {
      ...storeQuery,
      products: updatedProducts,
    };

    const result = await store.updateStore(req.db, req.body.storeId, {
      ...updatedStore,
    });

    res.json({ store: result });
  });

export default withAuth(handler);
