import { NextApiResponse } from 'next';
import nc from 'next-connect';
import { Request } from '../../../interfaces';
import { Order } from '../../../interfaces';
import database from '../../../middleware/db';
import { order } from '../../../db';

const handler = nc<Request, NextApiResponse>()
  .use(database)
  .get(async (req, res) => {
    try {
      const result: Order[] = await order.getOrders(req.db);
      res.json({ orders: result });
    } catch (error) {
      console.error(error);
      res.json({ error: error.message });
    }
  });

export default handler;
