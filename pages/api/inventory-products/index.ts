import { NextApiResponse } from 'next';
import nc from 'next-connect';
import { withAuth } from '../../../utils/withAuth';
import { Request, InventoryProduct } from '../../../interfaces';
import database from '../../../middleware/db';
import { inventoryProduct } from '../../../db';

type Data = {
  inventoryProducts: InventoryProduct[];
  count: number;
};

const handler = nc<Request, NextApiResponse>()
  .use(database)
  .get(async (req, res) => {
    const data: Data = await inventoryProduct.getInventoryProducts(
      req.db,
      req.query.page,
      req.query.pageSize
    );
    res.json(data);
  });

export default withAuth(handler);
