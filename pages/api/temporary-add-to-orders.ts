import { NextApiResponse } from 'next';
import nc from 'next-connect';
import { withAuth } from '../../utils/withAuth';
import { Request } from '../../interfaces';
import database from '../../middleware/db';
import { store } from '../../db';

const handler = nc<Request, NextApiResponse>()
  .use(database)
  .get(async (req, res) => {
    const allStores = await store.getStores(req.db);

    // loop over stores and add stripeFee and refund obj to every order
    for (const currentStore of allStores) {
      if (currentStore.orders.length > 0) {
        const updatedOrders = currentStore.orders.map(o => {
          const stripeFee = Math.round(o.summary.total * 0.029 + 30);

          return {
            ...o,
            summary: { ...o.summary, stripeFee },
            refund: { ...o.refund, status: 'None', amount: 0 },
          };
        });

        await store.updateStore(req.db, currentStore._id, {
          orders: updatedOrders,
        });
      }
    }

    res.json({ success: true });
  });

export default withAuth(handler);
