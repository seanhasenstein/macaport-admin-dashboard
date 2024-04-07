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

    const result = await order.addReceiptPrintedToAllUnfulfilledOrders(
      req.db,
      storeId
    );

    res.json({ store: result });
  });

export default withAuth(handler);
