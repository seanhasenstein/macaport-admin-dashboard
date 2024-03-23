import { NextApiResponse } from 'next';
import nc from 'next-connect';
import { getSession } from 'next-auth/client';

import database from '../../../middleware/db';
import { store } from '../../../db';

import { withAuth } from '../../../utils/withAuth';
import { handleUpdateOrderStatus } from '../../../utils/order';

import { Order, Request, Store } from '../../../interfaces';

const handler = nc<Request, NextApiResponse>()
  .use(database)
  .post(async (req, res) => {
    const storeId = req.query.sid as string;

    const session = await getSession({ req });
    const userId = session?.user.id || '';

    const queriedStore: Store = await store.getStoreById(req.db, storeId);

    const updatedOrders: Order[] = queriedStore.orders.map((order: Order) => {
      const updatedOrderItems = order.items.map(item => {
        if (item.status.current === 'Fulfilled') {
          return {
            ...item,
            status: {
              current: 'Shipped' as const,
              meta: {
                ...item.status.meta,
                Shipped: { user: userId, updatedAt: new Date().toISOString() },
              },
            },
          };
        } else {
          return item;
        }
      });

      const updatedOrder = handleUpdateOrderStatus(order, updatedOrderItems);
      return updatedOrder;
    });

    const updatedStore: Store = { ...queriedStore, orders: updatedOrders };

    const updatedStoreResult = await store.updateStore(
      req.db,
      queriedStore._id,
      updatedStore
    );

    res.json({ store: updatedStoreResult });
  });

export default withAuth(handler);
