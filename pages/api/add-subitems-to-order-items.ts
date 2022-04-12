import { NextApiResponse } from 'next';
import nc from 'next-connect';
import { Request, Store } from '../../interfaces';
import database from '../../middleware/db';
import { store } from '../../db';
import { withAuth } from '../../utils/withAuth';

const handler = nc<Request, NextApiResponse>()
  .use(database)
  .get(async (req, res) => {
    const stores: Store[] = await store.getStores(req.db);

    const updatedStores = stores.map(store => {
      const updatedOrders = store.orders.map(order => {
        const updatedOrderItems = order.items.map(orderItem => {
          const updatedPersonalizationItems =
            orderItem.personalizationAddons.map(addon => {
              return {
                ...addon,
                subItems: [],
              };
            });

          return {
            ...orderItem,
            personalizationAddons: updatedPersonalizationItems,
          };
        });

        return { ...order, items: updatedOrderItems };
      });

      return { ...store, orders: updatedOrders };
    });

    for (const updatedStore of updatedStores) {
      const { _id, ...update } = updatedStore;
      await store.updateStore(req.db, updatedStore._id, update);
    }

    res.json({ success: true });
  });

export default withAuth(handler);
