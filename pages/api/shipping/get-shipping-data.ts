import { NextApiResponse } from 'next';
import nc from 'next-connect';
import database from '../../../middleware/db';
import { shipping } from '../../../db';
import { withAuth } from '../../../utils/withAuth';
import { Request } from '../../../interfaces';

const handler = nc<Request, NextApiResponse>()
  .use(database)
  .get(async (req, res) => {
    const shippingData = await shipping.getShippingData(req.db);

    res.json({ shipping: shippingData });
  });

export default withAuth(handler);
