import { NextApiResponse } from 'next';
import nc from 'next-connect';
import { withAuth } from '../../../utils/withAuth';
import { Request, Store } from '../../../interfaces';
import database from '../../../middleware/db';
import { store } from '../../../db';

const handler = nc<Request, NextApiResponse>()
  .use(database)
  .post(async (req, res) => {
    try {
      const result: Store = await store.updateStoreProduct(
        req.db,
        req.query.id,
        req.query.prodId,
        req.body
      );
      res.json({ store: result });
    } catch (error) {
      console.error(error);
      res.json({ error: error.message });
    }
  });

export default withAuth(handler);
