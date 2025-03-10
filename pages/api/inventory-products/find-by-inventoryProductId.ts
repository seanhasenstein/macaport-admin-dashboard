import { NextApiResponse } from 'next';
import nc from 'next-connect';

import { withAuth } from '../../../utils/withAuth';

import database from '../../../middleware/db';
import { inventoryProduct } from '../../../db';

import { Request } from '../../../interfaces';

const handler = nc<Request, NextApiResponse>()
  .use(database)
  .get(async (req, res) => {
    const inventoryProductId = req.query.inventoryProductId;

    const result = await inventoryProduct.getInventoryProduct(req.db, {
      inventoryProductId,
    });
    res.json({ inventoryProduct: result });
  });

export default withAuth(handler);
