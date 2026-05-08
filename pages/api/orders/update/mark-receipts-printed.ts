import { NextApiResponse, NextApiRequest } from 'next';
import nc from 'next-connect';
import { Db, MongoClient } from 'mongodb';

import { withAuth } from '../../../../utils/withAuth';

import database from '../../../../middleware/db';
import { order } from '../../../../db';

interface ExtendedRequest extends NextApiRequest {
  db: Db;
  dbClient: MongoClient;
  query: {
    storeId: string;
  };
}

const handler = nc<ExtendedRequest, NextApiResponse>()
  .use(database)
  .post(async (req, res) => {
    const { storeId } = req.query;
    const orderIds: unknown = req.body?.orderIds;

    if (!Array.isArray(orderIds) || orderIds.some(id => typeof id !== 'string')) {
      res.status(400).json({ error: 'orderIds must be an array of strings' });
      return;
    }

    const result = await order.markReceiptsPrintedForOrders(
      req.db,
      storeId,
      orderIds as string[]
    );

    res.json({ store: result });
  });

export default withAuth(handler);
