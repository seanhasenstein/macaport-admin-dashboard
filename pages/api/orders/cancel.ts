import { NextApiResponse } from 'next';
import nc from 'next-connect';
import { withAuth } from '../../../utils/withAuth';
import { ObjectId } from 'mongodb';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]';
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
    const session = await getServerSession(req, res, authOptions);
    const userId = session?.user.id || '';

    // Everything about the order comes from the database. The body only
    // says which items go back into inventory, so a stale tab cannot wipe
    // a refund, an invoice link, or a benefit recorded since it loaded.
    const fromBody: OrderWithExtendedOrderItems | undefined = req.body.order;
    const found = await order.getOrderById(
      req.db,
      req.query.sid,
      req.query.oid
    );
    if (!found) {
      return res.status(404).json({ error: 'Order not found.' });
    }
    const stored = found.order;
    const canceledOrder: OrderWithExtendedOrderItems = {
      ...stored,
      items: stored.items.map(item => ({
        ...item,
        shouldReturnToInventory:
          fromBody?.items?.find(i => i.id === item.id)
            ?.shouldReturnToInventory === true,
      })),
    };

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
    let restoreProblem: string | null = null;
    if (req.body.restoreCredit === true && stored.benefit) {
      const already = stored.refund?.creditRestored ?? 0;
      const amount = Math.max(0, (stored.benefit.used ?? 0) - already);
      if (amount > 0) {
        const restored = await memberBenefit.restoreUsed(
          req.db,
          stored.benefit.benefitId,
          stored.benefit.email,
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
          restoreProblem =
            restored === 'notFound'
              ? `The order is canceled, but ${stored.benefit.email} is no longer on the benefit, so nothing was restored.`
              : `The order is canceled, but ${stored.benefit.email} has less used than this order recorded, so nothing was restored. Use Restore used on the member benefit panel if some of it should come back.`;
          console.warn(
            `Cancel of ${req.query.oid}: could not restore ${amount} to ${stored.benefit.email} (${restored}).`
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

    res.json({ store: result, creditRestored, restoreProblem });
  });

export default withAuth(handler);
