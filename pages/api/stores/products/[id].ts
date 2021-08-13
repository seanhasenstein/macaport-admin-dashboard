import { NextApiResponse } from 'next';
import nc from 'next-connect';
import { withAuth } from '../../../../utils/withAuth';
import { Request, Product } from '../../../../interfaces';
import database from '../../../../middleware/db';
import { product } from '../../../../db';

const handler = nc<Request, NextApiResponse>()
  .use(database)
  .get(async (req, res) => {
    try {
      const result: Product = await product.getStoreProduct(
        req.db,
        req.query.id
      );
      res.json({ product: result });
    } catch (error) {
      console.error(error);
      res.json({ error: error.message });
    }
  });

export default withAuth(handler);
