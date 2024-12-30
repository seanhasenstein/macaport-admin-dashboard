import { NextApiResponse } from 'next';
import nc from 'next-connect';
import { withAuth } from '../../../utils/withAuth';
import { Request } from '../../../interfaces';
import database from '../../../middleware/db';
import { inventoryProduct } from '../../../db';

const handler = nc<Request, NextApiResponse>()
  .use(database)
  .get(async (req, res) => {
    const result = await inventoryProduct.getInventoryProductById(
      req.db,
      req.query.id
    );
    res.json({ inventoryProduct: result });
  });

export default withAuth(handler);
