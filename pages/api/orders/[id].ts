import { NextApiResponse } from 'next';
import nc from 'next-connect';
import { withAuth } from '../../../utils/withAuth';
import { Request } from '../../../interfaces';
import { Order } from '../../../interfaces';
import database from '../../../middleware/db';
import { order } from '../../../db';

const handler = nc<Request, NextApiResponse>()
  .use(database)
  .get(async (req, res) => {
    try {
      if (!req.query.storeId) {
        throw new Error('Store ID is required.');
      }

      const result: Order = await order.getOrderById(
        req.db,
        req.query.storeId,
        req.query.id
      );
      res.json({ order: result });
    } catch (error) {
      console.error(error);
      res.json({ error: error.message });
    }
  });

export default withAuth(handler);
