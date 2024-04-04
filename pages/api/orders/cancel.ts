import { NextApiResponse } from 'next';
import nc from 'next-connect';
import { withAuth } from '../../../utils/withAuth';
import { getSession } from 'next-auth/client';
import { Order, OrderItem, Request, Store } from '../../../interfaces';
import database from '../../../middleware/db';
import { inventoryProduct, order } from '../../../db';

interface OrderItemWithShouldReturnToInventory extends OrderItem {
  shouldReturnToInventory: boolean;
}

interface OrderWithExtendedOrderItems extends Omit<Order, 'items'> {
  items: OrderItemWithShouldReturnToInventory[];
}

const handler = nc<Request, NextApiResponse>()
  .use(database)
  .post(async (req, res) => {
    const session = await getSession({ req });

    const userId = session?.user.id || '';
    const canceledOrder: OrderWithExtendedOrderItems = req.body.order;

    const result: Store = await order.cancelOrder(
      req.db,
      req.query.sid,
      req.query.oid,
      canceledOrder,
      userId
    );

    for (const orderItem of canceledOrder.items) {
      if (orderItem.shouldReturnToInventory) {
        const inventoryProductSku =
          await inventoryProduct.getInventoryProductSku(
            req.db,
            orderItem.sku.inventoryProductId,
            orderItem.sku.inventorySkuId
          );

        if (inventoryProductSku) {
          const updatedInventory =
            inventoryProductSku?.inventory + orderItem.quantity;

          await inventoryProduct.updateInventoryProductSkusInventory(
            req.db,
            orderItem.sku.inventoryProductId,
            orderItem.sku.inventorySkuId,
            updatedInventory
          );
        }
      }
    }

    res.json({ store: result });
  });

export default withAuth(handler);
