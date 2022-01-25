import { NextApiResponse } from 'next';
import nc from 'next-connect';
import { withAuth } from '../../../utils/withAuth';
import { Request, InventoryProduct } from '../../../interfaces';
import database from '../../../middleware/db';
import { inventoryProduct } from '../../../db';

const handler = nc<Request, NextApiResponse>()
  .use(database)
  .post(async (req, res) => {
    const result: InventoryProduct =
      await inventoryProduct.updateInventoryProduct(
        req.db,
        req.body.id,
        req.body.update
      );
    res.json({ inventoryProduct: result });
  });

export default withAuth(handler);
