import { NextApiResponse } from 'next';
import nc from 'next-connect';
import { withAuth } from '../../../utils/withAuth';
import { Request, Store } from '../../../interfaces';
import database from '../../../middleware/db';
import { store } from '../../../db';

interface Result {
  stores: Store[];
  count: number;
}

const handler = nc<Request, NextApiResponse>()
  .use(database)
  .get(async (req, res) => {
    const result: Result = await store.getPaginatedStores(
      req.db,
      req.query.page,
      req.query.pageSize
    );
    res.json(result);
  });

export default withAuth(handler);
