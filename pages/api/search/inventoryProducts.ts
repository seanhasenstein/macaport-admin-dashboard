import { NextApiResponse } from 'next';
import nc from 'next-connect';
import { Db, Document, MongoClient } from 'mongodb';

import { withAuth } from '../../../utils/withAuth';

import database from '../../../middleware/db';

import { InventoryProduct } from '../../../interfaces';

interface ExtendedRequest {
  db: Db;
  dbClient: MongoClient;
  query: {
    searchTerm?: string;
    page?: number;
    limit?: number;
    returnAll?: boolean;
  };
}

const handler = nc<ExtendedRequest, NextApiResponse>()
  .use(database)
  .get(async (req, res) => {
    try {
      const { searchTerm, page = 1, limit = 1000, returnAll } = req.query;

      const trimmedSearchTerm = searchTerm?.trim();

      if (!trimmedSearchTerm || trimmedSearchTerm.length < 3) {
        res.json({ results: [] });
        return;
      }

      const pipeline: Document[] = [
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
                {
                  text: {
                    query: trimmedSearchTerm,
                    path: ['merchandiseCode'],
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
      ];

      if (!returnAll) {
        pipeline.push({
          $project: {
            _id: 1,
            name: 1,
            merchandiseCode: 1,
            tag: 1,
            updatedAt: 1,
            colorsCount: { $size: '$colors' },
            sizesCount: { $size: '$sizes' },
          },
        });
      }

      const invProdResult = await req.db
        .collection('inventoryProducts')
        .aggregate<InventoryProduct>(pipeline)
        .toArray();

      if (invProdResult.length === 0) {
        res.json({ results: [] });
        return;
      }

      res.json({ results: invProdResult });
    } catch (error) {
      console.error('Search error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

export default withAuth(handler);
