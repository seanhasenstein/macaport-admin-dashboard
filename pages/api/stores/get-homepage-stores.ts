import { NextApiResponse } from 'next';
import nc from 'next-connect';
import { withAuth } from '../../../utils/withAuth';
import { Request, Store } from '../../../interfaces';
import database from '../../../middleware/db';
import { store } from '../../../db';
import { homepageStoresReducer } from '../../../utils/stores';

const handler = nc<Request, NextApiResponse>()
  .use(database)
  .get(async (req, res) => {
    const result: Store[] = await store.getStores(req.db);
    const homepageStores = homepageStoresReducer(result);
    res.json(homepageStores);
  });

export default withAuth(handler);
