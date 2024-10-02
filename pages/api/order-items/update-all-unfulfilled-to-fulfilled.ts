import { NextApiResponse } from 'next';
import nc from 'next-connect';

import { withAuth } from '../../../utils/withAuth';

import { Request } from '../../../interfaces';
import database from '../../../middleware/db';
import { updateAllUnfulfilledOrderItemsToFulfilled } from '../../../db/order';

interface ExtendedRequest extends Request {
  body: {
    storeId: string;
    orderId: string;
    userId: string;
  };
}

const handler = nc<ExtendedRequest, NextApiResponse>()
  .use(database)
  .post(async (req, res) => {
    const { storeId, orderId, userId } = req.body;

    if (!storeId || !orderId || !userId) {
      return res.status(400).send('Missing required fields.');
    }

    const result = await updateAllUnfulfilledOrderItemsToFulfilled(
      req.db,
      storeId,
      orderId,
      userId
    );

    return res.status(200).send({ store: result });
  });

export default withAuth(handler);
