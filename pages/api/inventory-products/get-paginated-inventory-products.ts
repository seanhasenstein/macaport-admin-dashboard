import { NextApiResponse } from 'next';
import nc from 'next-connect';
import { withAuth } from '../../../utils/withAuth';
import { Request } from '../../../interfaces';
import database from '../../../middleware/db';
import { inventoryProduct } from '../../../db';

const handler = nc<Request, NextApiResponse>()
  .use(database)
  .get(async (req, res) => {
    const data = await inventoryProduct.getPaginatedInventoryProducts(
      req.db,
      req.query.page,
      req.query.pageSize
    );
    res.json(data);
  });

export default withAuth(handler);
