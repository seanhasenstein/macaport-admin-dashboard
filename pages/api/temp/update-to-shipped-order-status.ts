import { NextApiResponse } from 'next';
import nc from 'next-connect';

import database from '../../../middleware/db';
import { store } from '../../../db';

import { Request, Store as StoreInterface } from '../../../interfaces';
import { getStoreStatus } from '../../../utils';

const handler = nc<Request, NextApiResponse>()
  .use(database)
  .get(async (req, res) => {
    const allStores: StoreInterface[] = await store.getStores(req.db);

    // loop over allStores and update all orders with a status of 'Completed' to 'Shipped'
    allStores.forEach(async currentStore => {
      const storeStatus = getStoreStatus(
        currentStore.openDate,
        currentStore.closeDate
      );
      const storeIsOpen = storeStatus === 'open';
      const updatedStoreOrders = currentStore.orders.map(order => {
        if (order.orderStatus === 'Completed') {
          return {
            ...order,
            orderStatus: storeIsOpen ? 'Fulfilled' : 'Shipped',
          };
        } else {
          return { ...order, orderStatus: order.orderStatus };
        }
      });

      // update the store with the updated orders
      await store.updateStore(req.db, currentStore._id, {
        ...store,
        orders: updatedStoreOrders,
      });
    });

    res.json({ result: 'success' });
  });

export default handler;
