import { NextApiResponse } from 'next';
import nc from 'next-connect';
import database from '../../../middleware/db';
import { store } from '../../../db';
import { withAuth } from '../../../utils/withAuth';
import { Request } from '../../../interfaces';

const handler = nc<Request, NextApiResponse>()
  .use(database)
  .get(async (req, res) => {
    const stores = await store.getHomepageStores(req.db);
    res.json({ stores });
  });

export default withAuth(handler);
