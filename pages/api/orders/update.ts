import { NextApiResponse } from 'next';
import nc from 'next-connect';
import { Request } from '../../../interfaces';
import { Order } from '../../../interfaces';
import database from '../../../middleware/db';
import { order } from '../../../db';

const handler = nc<Request, NextApiResponse>()
  .use(database)
  .post(async (req, res) => {
    try {
      const result: Order = await order.updateOrder(
        req.db,
        req.query.id,
        req.body
      );
      res.json({ order: result });
    } catch (error) {
      console.error(error);
      res.json({ error: error.message });
    }
  });

export default handler;
