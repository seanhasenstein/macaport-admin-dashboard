import { NextApiResponse } from 'next';
import nc from 'next-connect';

import database from '../../../middleware/db';
import { store } from '../../../db';

import { Request, Store as StoreInterface } from '../../../interfaces';

const handler = nc<Request, NextApiResponse>()
  .use(database)
  .get(async (req, res) => {
    const allStores: StoreInterface[] = await store.getStores(req.db);

    // loop over each store
    allStores.forEach(async currentStore => {
      // loop over each order in the store
      currentStore.orders.forEach(async order => {
        if (order.orderStatus === 'Completed') {
          console.log(currentStore.name, order.orderStatus);
        }
      });
    });

    res.json({ result: 'success' });
  });

export default handler;
