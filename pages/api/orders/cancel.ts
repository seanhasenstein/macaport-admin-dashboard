import { NextApiResponse } from 'next';
import nc from 'next-connect';
import { withAuth } from '../../../utils/withAuth';
import { getSession } from 'next-auth/react';
import { ObjectId } from 'mongodb';
import { Order, OrderItem, Request } from '../../../interfaces';
import database from '../../../middleware/db';
import { inventoryProduct, memberBenefit, order } from '../../../db';

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

    const result = await order.cancelOrder(
      req.db,
      req.query.sid,
      req.query.oid,
      canceledOrder,
      userId
    );

    // The member's credit comes back only when the admin asked for it, and
    // only what this order drew down and has not already been restored.
    let creditRestored = 0;
    if (req.body.restoreCredit === true && canceledOrder.benefit) {
      const already = canceledOrder.refund?.creditRestored ?? 0;
      const amount = Math.max(0, (canceledOrder.benefit.used ?? 0) - already);
      if (amount > 0) {
        const restored = await memberBenefit.restoreUsed(
          req.db,
          canceledOrder.benefit.benefitId,
          canceledOrder.benefit.email,
          amount
        );
        if (restored === 'restored') {
          creditRestored = amount;
          await req.db.collection('stores').updateOne(
            {
              _id: new ObjectId(req.query.sid),
              'orders.orderId': req.query.oid,
            },
            {
              $set: {
                'orders.$.refund.creditRestored': already + amount,
                'orders.$.refund.updatedAt': new Date().toISOString(),
              },
            }
          );
        } else {
          console.warn(
            `Cancel of ${req.query.oid}: could not restore ${amount} to ${canceledOrder.benefit.email} (${restored}).`
          );
        }
      }
    }

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

    res.json({ store: result, creditRestored });
  });

export default withAuth(handler);
