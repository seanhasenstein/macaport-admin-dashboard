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
    page: string;
    pageSize: string;
    statusFilter: StoreStatusFilter;
    onlyUnfulfilled: 'true' | 'false';
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
    console.log({ page, pageSize, statusFilter, onlyUnfulfilled });
    console.log('page', typeof page);
    console.log('pageSize', typeof pageSize);
    console.log('statusFilter', typeof statusFilter);
    console.log('onlyUnfulfilled', typeof onlyUnfulfilled);
    const result: Result = await store.getPaginatedStores({
      db: req.db,
      currentPage: Number(page),
      pageSize: Number(pageSize),
      statusFilter,
      onlyUnfulfilled: onlyUnfulfilled === 'true' ? true : false,
    });
    res.json(result);
  });

export default withAuth(handler);
