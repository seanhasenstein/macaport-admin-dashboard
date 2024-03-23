import { NextApiResponse } from 'next';
import nc from 'next-connect';
import { withAuth } from '../../../utils/withAuth';
import {
  Order,
  OrderItem,
  OrderItemStatus,
  Request,
} from '../../../interfaces';
import database from '../../../middleware/db';
import { order as orderModel, inventoryProduct } from '../../../db';

interface ExtendedRequest extends Request {
  body: {
    inventoryProductId: string;
    inventoryProductSkuId: string;
    storeId: string | undefined;
    orderId: string | undefined;
    orderItemId: string | undefined;
    order: Order | undefined;
    orderItems: OrderItem[] | undefined;
    userId: string | undefined;
    statusToSet?: OrderItemStatus;
    returnToInventory?: boolean;
    orderItemQuantity: number;
  };
}

const handler = nc<ExtendedRequest, NextApiResponse>()
  .use(database)
  .post(async (req, res) => {
    const {
      storeId,
      orderId,
      orderItemId,
      order,
      orderItems,
      userId,
      inventoryProductId,
      inventoryProductSkuId,
      statusToSet,
      returnToInventory,
      orderItemQuantity,
    } = req.body;

    if (
      !storeId ||
      !orderId ||
      !orderItemId ||
      !order ||
      !orderItems ||
      !userId
    ) {
      return res.status(400).send('Missing required fields');
    }

    const input = {
      storeId,
      orderId,
      orderItemId,
      order,
      orderItems,
      userId,
      ...(statusToSet && { statusToSet }),
    };

    const result = await orderModel.updateOrderItemStatus(req.db, input);

    if (statusToSet === 'Canceled' && returnToInventory) {
      const invProdSkuToUpdate = await inventoryProduct.getInventoryProductSku(
        req.db,
        inventoryProductId,
        inventoryProductSkuId
      );

      if (!invProdSkuToUpdate) {
        res.json({
          error:
            'Inventory Product sku with that inventoryProductId and inventoryProductSkuId not found.',
        });
        return;
      }

      const updatedInventory = invProdSkuToUpdate.inventory + orderItemQuantity;

      await inventoryProduct.updateInventoryProductSkusInventory(
        req.db,
        inventoryProductId,
        inventoryProductSkuId,
        updatedInventory
      );
    }

    res.json({ store: result });
  });

export default withAuth(handler);
