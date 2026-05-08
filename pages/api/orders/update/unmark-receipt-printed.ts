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
    const orderId: unknown = req.body?.orderId;

    if (typeof orderId !== 'string' || !orderId) {
      res.status(400).json({ error: 'orderId must be a non-empty string' });
      return;
    }

    const result = await order.unmarkReceiptPrintedForOrder(
      req.db,
      storeId,
      orderId
    );

    res.json({ store: result });
  });

export default withAuth(handler);
