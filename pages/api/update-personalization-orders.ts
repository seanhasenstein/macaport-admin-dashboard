import { NextApiResponse } from 'next';
import nc from 'next-connect';
import {
  Order,
  OrderItem,
  PersonalizationAddon,
  Request,
  Store,
} from '../../interfaces';
import database from '../../middleware/db';
import { store } from '../../db';
import { withAuth } from '../../utils/withAuth';
import { createId } from '../../utils';

interface TempOrderItem extends OrderItem {
  customName?: string;
  customNumber?: string;
}

interface TempOrder extends Omit<Order, 'items'> {
  items: TempOrderItem[];
}

interface TempStore extends Omit<Store, 'orders'> {
  orders: TempOrder[];
}

const handler = nc<Request, NextApiResponse>()
  .use(database)
  .get(async (req, res) => {
    const stores: TempStore[] = await store.getStores(req.db);

    const updatedStores: Store[] = stores.map(store => {
      const updatedOrders = store.orders.map(order => {
        const orderItems = order.items.map(orderItem => {
          const { customName, customNumber, ...restOfOrderItem } = orderItem;
          const nameAddonItem: PersonalizationAddon | undefined =
            orderItem.customName
              ? {
                  id: createId('base'),
                  itemId: 'pi_lQjYg2PJG0X5g3',
                  addon: 'Name',
                  value: orderItem.customName,
                  location: 'Back',
                  lines: 1,
                  price: 500,
                  subItems: [],
                }
              : undefined;
          const numberAddonItem: PersonalizationAddon | undefined =
            orderItem.customNumber
              ? {
                  id: createId('base'),
                  itemId: 'pi_9sIf1y1GpvkmFm',
                  addon: 'Number',
                  value: orderItem.customNumber,
                  location: 'Back',
                  lines: 1,
                  price: 500,
                  subItems: [],
                }
              : undefined;

          const filterUndefinedValues = (
            value: PersonalizationAddon | undefined
          ): value is PersonalizationAddon => value !== undefined;
          const personalizationAddons = [nameAddonItem, numberAddonItem].filter(
            filterUndefinedValues
          );

          return { ...restOfOrderItem, personalizationAddons };
        });

        return { ...order, items: orderItems };
      });

      return { ...store, orders: updatedOrders };
    });

    // update each store in the database
    for (const updatedStore of updatedStores) {
      const { _id, ...update } = updatedStore;
      await store.updateStore(req.db, updatedStore._id, update);
    }

    res.json({ success: true });
  });

export default withAuth(handler);
