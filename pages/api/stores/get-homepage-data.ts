import { NextApiResponse } from 'next';
import nc from 'next-connect';

import database from '../../../middleware/db';
import { shipping, store } from '../../../db';

import { withAuth } from '../../../utils/withAuth';
import { homepageStoresReducer } from '../../../utils/stores';

import { Request, Store } from '../../../interfaces';

const handler = nc<Request, NextApiResponse>()
  .use(database)
  .get(async (req, res) => {
    throw new Error('blahhhh');
    const storesData: Store[] = await store.getStores(req.db);
    const shippingData = await shipping.getShippingData(req.db);
    const homepageStores = homepageStoresReducer(storesData);
    console.log('homepageStores', homepageStores);
    res.json({ stores: homepageStores, shipping: shippingData });
  });

export default withAuth(handler);
