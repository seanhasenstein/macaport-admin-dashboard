import { NextApiRequest, NextApiResponse } from 'next';
import nc from 'next-connect';
import { Db } from 'mongodb';

import { withAuth } from '../../../../utils/withAuth';

import database from '../../../../middleware/db';
import { sizeGroup } from '../../../../db';

import { CreateSizeGroup } from '../../../../types';

interface Request extends NextApiRequest {
  db: Db;
  body: {
    code?: string;
    name?: string;
    orderIndex?: number;
    active?: boolean;
  };
}

const handler = nc<Request, NextApiResponse>()
  .use(database)
  .post(async (req, res) => {
    try {
      const { code, name, orderIndex, active } = req.body;

      if (!code || !name) {
        return res.status(400).send('Missing required fields.');
      }

      const query = {
        $or: [{ code }, { name }],
      };

      const existingSizeGroup = await req.db
        .collection('sizeGroups')
        .findOne(query);

      if (existingSizeGroup) {
        return res
          .status(400)
          .send('A size group with this code and/or name already exists.');
      }

      const input: CreateSizeGroup = {
        code,
        name,
        orderIndex: orderIndex ?? 0,
        active: active ?? true,
      };

      const result = await sizeGroup.createSizeGroup(req.db, input);

      return res.json({ sizeGroup: result });
    } catch (error) {
      console.log('Error: /api/v2/sizeGroup/create');
      console.error({
        error:
          error instanceof Error ? error.message : 'An unknown error occurred.',
      });
      res.status(400).json({
        error:
          error instanceof Error
            ? error.message
            : 'An unknown error occurred creating the size group.',
      });
    }
  });

export default withAuth(handler);
