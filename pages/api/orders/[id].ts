import { NextApiResponse } from 'next';
import nc from 'next-connect';
import { withAuth } from '../../../utils/withAuth';
import { Request } from '../../../interfaces';
import database from '../../../middleware/db';
import { order } from '../../../db';

const handler = nc<Request, NextApiResponse>()
  .use(database)
  .get(async (req, res) => {
    if (!req.query.sid) {
      throw new Error('Store ID is required.');
    }

    const result = await order.getOrderById(
      req.db,
      req.query.sid,
      req.query.id
    );
    res.json({ order: result });
  });

export default withAuth(handler);
