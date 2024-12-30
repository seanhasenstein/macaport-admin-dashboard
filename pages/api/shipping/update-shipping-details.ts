import { NextApiResponse } from 'next';
import nc from 'next-connect';
import { withAuth } from '../../../utils/withAuth';
import { Request, ShippingDataForm } from '../../../interfaces';
import database from '../../../middleware/db';
import { shipping } from '../../../db';

interface ExtendedRequest extends Request {
  body: ShippingDataForm;
}

const handler = nc<ExtendedRequest, NextApiResponse>()
  .use(database)
  .post(async (req, res) => {
    const result = await shipping.updateShippingData(req.db, req.body);
    res.json({ shipping: result });
  });

export default withAuth(handler);
