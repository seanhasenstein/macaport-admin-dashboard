import { NextApiResponse } from 'next';
import nc from 'next-connect';
import { withAuth } from '../../../../utils/withAuth';
import { Request, Store } from '../../../../interfaces';
import database from '../../../../middleware/db';
import { store } from '../../../../db';

const handler = nc<Request, NextApiResponse>()
  .use(database)
  .get(async (req, res) => {
    const result: Store = await store.getStoreById(req.db, req.query.id);
    res.json({ store: result });
  });

export default withAuth(handler);
