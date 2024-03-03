import { NextApiResponse } from 'next';
import nc from 'next-connect';
import { withAuth } from '../../../utils/withAuth';
import { Request } from '../../../interfaces';
import database from '../../../middleware/db';
import { store } from '../../../db';

const handler = nc<Request, NextApiResponse>()
  .use(database)
  .get(async (req, res) => {
    const allStores = await store.getStores(req.db);

    const allOrderItems: any = [];

    for (let i = 0; i < allStores.length; i++) {
      const store = allStores[i];
      const storeOrders = store.orders;
      for (let j = 0; j < storeOrders.length; j++) {
        const order = storeOrders[j];
        const orderItems = order.items;
        for (let k = 0; k < orderItems.length; k++) {
          console.log(orderItems[k].id);
          if (!orderItems[k].id) {
            console.log(
              `!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!! ${store.name} (${store._id}) ${order.customer.firstName} ${order.customer.lastName}`
            );
          }
          const orderItem = orderItems[k];
          allOrderItems.push(orderItem);
        }
      }
    }

    res.json({ success: 'true', totalOrderItems: allOrderItems.length });
  });

export default withAuth(handler);
