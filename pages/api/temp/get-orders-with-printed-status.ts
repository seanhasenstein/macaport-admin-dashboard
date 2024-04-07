import { NextApiResponse } from 'next';
import nc from 'next-connect';

import { withAuth } from '../../../utils/withAuth';

import database from '../../../middleware/db';
import { store } from '../../../db';

import { Request } from '../../../interfaces';

const handler = nc<Request, NextApiResponse>()
  .use(database)
  .get(async (req, res) => {
    // get all stores
    const allStores = await store.getStores(req.db);

    allStores.forEach(async currentStore => {
      currentStore.orders.forEach(order => {
        if (order.orderStatus === 'Printed') {
          console.log(
            currentStore.name,
            order.orderId,
            order.meta.receiptPrinted
          );
        }
      });
    });

    res.json({ result: 'success' });
  });

export default withAuth(handler);
