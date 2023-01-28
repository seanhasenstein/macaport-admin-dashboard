import { NextApiResponse } from 'next';
import nc from 'next-connect';
import { withAuth } from '../../../utils/withAuth';
import { Request } from '../../../interfaces';
import database from '../../../middleware/db';
// import { store } from '../../../db';

const handler = nc<Request, NextApiResponse>()
  .use(database)
  .get(async (req, res) => {
    // this adds tags as an empty array to every inventoryProduct
    // await req.db
    //   .collection('inventoryProducts')
    //   .updateMany({}, { $set: { tags: [] } });

    res.json({ success: true });
  });

export default withAuth(handler);
