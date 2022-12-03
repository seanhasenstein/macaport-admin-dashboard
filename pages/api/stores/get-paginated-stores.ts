import { NextApiResponse } from 'next';
import nc from 'next-connect';
import { withAuth } from '../../../utils/withAuth';
import { Request, StoresTableStore } from '../../../interfaces';
import database from '../../../middleware/db';
import { store } from '../../../db';

interface Result {
  stores: StoresTableStore[];
  count: number;
}

const handler = nc<Request, NextApiResponse>()
  .use(database)
  .get(async (req, res) => {
    const result: Result = await store.getPaginatedStores(
      req.db,
      req.query.page,
      req.query.pageSize,
      req.query.statusFilter,
      req.query.onlyUnfulfilled
    );
    res.json(result);
  });

export default withAuth(handler);
