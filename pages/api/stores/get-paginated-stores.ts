import { NextApiResponse } from 'next';
import nc from 'next-connect';
import { Db } from 'mongodb';

import { StoreStatusFilter, StoresTableStore } from '../../../interfaces';
import { withAuth } from '../../../utils/withAuth';
import database from '../../../middleware/db';
import { store } from '../../../db';

interface ExtendedRequest {
  db: Db;
  query: {
    page: number;
    pageSize: number;
    statusFilter: StoreStatusFilter;
    onlyUnfulfilled: boolean;
  };
}

interface Result {
  stores: StoresTableStore[];
  count: number;
}

const handler = nc<ExtendedRequest, NextApiResponse>()
  .use(database)
  .get(async (req, res) => {
    const { page, pageSize, statusFilter, onlyUnfulfilled } = req.query;

    const result: Result = await store.getPaginatedStores({
      db: req.db,
      currentPage: page,
      pageSize,
      statusFilter,
      onlyUnfulfilled,
    });
    res.json(result);
  });

export default withAuth(handler);
