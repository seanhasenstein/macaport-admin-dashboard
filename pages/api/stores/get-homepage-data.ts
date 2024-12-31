import { NextApiResponse } from 'next';
import nc from 'next-connect';
import database from '../../../middleware/db';
import { store } from '../../../db';
import { withAuth } from '../../../utils/withAuth';
import { Request, Store } from '../../../interfaces';
import { getStoresTableStores } from '../../../utils/storesTable';

const handler = nc<Request, NextApiResponse>()
  .use(database)
  .get(async (req, res) => {
    const queriedStores: Store[] = await store.getStores(req.db);

    const { closedStores, openStores, upcomingStores } =
      getStoresTableStores(queriedStores);

    const homepageStores = [...closedStores, ...openStores, ...upcomingStores];

    res.json({ stores: homepageStores });
  });

export default withAuth(handler);
