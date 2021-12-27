import { NextApiResponse } from 'next';
import nc from 'next-connect';
import { withAuth } from '../../../../utils/withAuth';
import { Request, Store } from '../../../../interfaces';
import database from '../../../../middleware/db';
import { order } from '../../../../db';

const handler = nc<Request, NextApiResponse>()
  .use(database)
  .post(async (req, res) => {
    const result: Store = await order.updateOrderNotes(
      req.db,
      req.query.id,
      req.query.oid,
      req.body.notes
    );
    res.json({ store: result });
  });

export default withAuth(handler);
