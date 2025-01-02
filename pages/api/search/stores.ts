import { NextApiResponse } from 'next';
import nc from 'next-connect';
import { Db, MongoClient } from 'mongodb';

import { withAuth } from '../../../utils/withAuth';

import database from '../../../middleware/db';

import { Store } from '../../../interfaces';

interface ExtendedRequest {
  db: Db;
  dbClient: MongoClient;
  query: {
    searchTerm?: string;
    page?: number;
    limit?: number;
  };
}

const handler = nc<ExtendedRequest, NextApiResponse>()
  .use(database)
  .get(async (req, res) => {
    try {
      const { searchTerm, page = 1, limit = 1000 } = req.query;

      const trimmedSearchTerm = searchTerm?.trim();

      if (!trimmedSearchTerm || trimmedSearchTerm.length < 3) {
        res.json({ results: [] });
        return;
      }

      const pipeline = [
        {
          $search: {
            index: 'default',
            compound: {
              should: [
                {
                  phrase: {
                    query: trimmedSearchTerm,
                    path: ['name'],
                  },
                },
              ],
            },
          },
        },
        {
          $skip: (page - 1) * limit,
        },
        {
          $limit: limit,
        },
        {
          $project: {
            _id: 1,
            name: 1,
            openDate: 1,
            closeDate: 1,
            permanentlyOpen: 1,
            productsCount: { $size: '$products' },
            ordersCount: { $size: '$orders' },
          },
        },
      ];

      const storesResult = await req.db
        .collection('stores')
        .aggregate<Store>(pipeline)
        .toArray();

      if (storesResult.length === 0) {
        res.json({ results: [] });
        return;
      }

      res.json({ results: storesResult });
    } catch (error) {
      console.error('Search error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

export default withAuth(handler);
