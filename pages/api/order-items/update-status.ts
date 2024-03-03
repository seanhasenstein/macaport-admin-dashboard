import { NextApiResponse } from 'next';
import nc from 'next-connect';
import { withAuth } from '../../../utils/withAuth';
import { OrderItem, OrderItemStatus, Request } from '../../../interfaces';
import database from '../../../middleware/db';
import { order } from '../../../db';

interface ExtendedRequest extends Request {
  body: {
    storeId: string | undefined;
    orderId: string | undefined;
    orderItemId: string | undefined;
    orderItems: OrderItem[] | undefined;
    userId: string | undefined;
    statusToSet?: OrderItemStatus;
  };
}

const handler = nc<ExtendedRequest, NextApiResponse>()
  .use(database)
  .post(async (req, res) => {
    const { storeId, orderId, orderItemId, orderItems, userId, statusToSet } =
      req.body;

    if (!storeId || !orderId || !orderItemId || !orderItems || !userId) {
      return res.status(400).send('Missing required fields');
    }

    const input = {
      storeId,
      orderId,
      orderItemId,
      orderItems,
      userId,
      ...(statusToSet && { statusToSet }),
    };

    const result = await order.updateOrderItemStatus(req.db, input);

    res.json({ store: result });
  });

export default withAuth(handler);
