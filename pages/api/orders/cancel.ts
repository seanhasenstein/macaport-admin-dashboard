import { NextApiResponse } from 'next';
import nc from 'next-connect';
import { withAuth } from '../../../utils/withAuth';
import { Order, Request, Store } from '../../../interfaces';
import database from '../../../middleware/db';
import { inventoryProduct, order } from '../../../db';

const handler = nc<Request, NextApiResponse>()
  .use(database)
  .post(async (req, res) => {
    const canceledOrder: Order = req.body.order;
    const result: Store = await order.cancelOrder(
      req.db,
      req.query.sid,
      req.query.oid,
      canceledOrder
    );

    for (const orderItem of canceledOrder.items) {
      const inventoryProductSku = await inventoryProduct.getInventoryProductSku(
        req.db,
        orderItem.sku.inventoryProductId,
        orderItem.sku.inventorySkuId
      );

      if (inventoryProductSku) {
        const updatedInventory =
          inventoryProductSku?.inventory + orderItem.quantity;

        await inventoryProduct.updateInventoryProductSku(
          req.db,
          orderItem.sku.inventoryProductId,
          orderItem.sku.inventorySkuId,
          updatedInventory
        );
      }
    }

    res.json({ store: result });
  });

export default withAuth(handler);
