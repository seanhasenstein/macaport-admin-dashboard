import { NextApiResponse } from 'next';
import nc from 'next-connect';
import { Db, MongoClient } from 'mongodb';

import { withAuth } from '../../../utils/withAuth';

import database from '../../../middleware/db';

import { OrderSearchResult, Store } from '../../../interfaces';

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
                // Search by orderId
                {
                  text: {
                    query: trimmedSearchTerm,
                    path: ['orders.orderId'],
                    fuzzy: { maxEdits: 1 },
                  },
                },
                // search by customer email
                {
                  text: {
                    query: trimmedSearchTerm,
                    path: ['orders.customer.email'],
                    fuzzy: { maxEdits: 1 },
                  },
                },
                // search by customer name
                {
                  text: {
                    query: trimmedSearchTerm,
                    path: {
                      wildcard: 'orders.customer.*Name',
                    },
                    fuzzy: { maxEdits: 1 },
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
            orders: 1,
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

      let ordersResult: OrderSearchResult[] = [];

      for (const store of storesResult) {
        const reducedOrders = store.orders.reduce((acc, o) => {
          if (
            o.orderId.includes(trimmedSearchTerm) ||
            o.customer.email.includes(trimmedSearchTerm) ||
            `${o.customer.firstName} ${o.customer.lastName}`.includes(
              trimmedSearchTerm
            )
          ) {
            const reducedOrder = {
              id: o.orderId,
              customer: o.customer,
              store: {
                _id: store._id,
                name: o.store.name,
              },
              total: o.summary.total,
              status: o.orderStatus,
              createdAt: o.createdAt,
            };
            return [...acc, reducedOrder];
          } else {
            return acc;
          }
        }, [] as OrderSearchResult[]);

        ordersResult = [...ordersResult, ...reducedOrders];
      }

      res.json({ results: ordersResult });
    } catch (error) {
      console.error('Search error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

export default withAuth(handler);
