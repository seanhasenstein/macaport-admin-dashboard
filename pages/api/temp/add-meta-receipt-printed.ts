import { NextApiResponse } from 'next';
import nc from 'next-connect';

import { withAuth } from '../../../utils/withAuth';

import database from '../../../middleware/db';
import { store } from '../../../db';

import { Order, Request } from '../../../interfaces';

const handler = nc<Request, NextApiResponse>()
  .use(database)
  .get(async (req, res) => {
    // get all stores
    const allStores = await store.getStores(req.db);
    let totalStores = 0;

    for (let i = 0; i < allStores.length; i++) {
      totalStores++;
      const currentStore = allStores[i];
      console.log(currentStore.name);

      const updatedOrders: Order[] = currentStore.orders.map(order => {
        const currentOrderStatus = order.orderStatus;
        const currentOrderStatusIsPrinted = currentOrderStatus === 'Printed';
        const receiptWasPrinted = [
          'Printed',
          'Fulfilled',
          'PartiallyShipped',
          'Shipped',
          'Canceled',
          'Completed',
        ].includes(order.orderStatus);

        return {
          ...order,
          orderStatus: currentOrderStatusIsPrinted
            ? 'Unfulfilled'
            : currentOrderStatus,
          meta: {
            receiptPrinted: receiptWasPrinted ? true : false,
          },
        };
      });

      const updatedStore = { ...currentStore, orders: updatedOrders };
      await store.updateStore(req.db, currentStore._id, updatedStore);
    }
    res.json({ result: 'success', totalStores });
  });

export default withAuth(handler);
