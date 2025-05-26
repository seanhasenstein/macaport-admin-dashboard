import { NextApiRequest, NextApiResponse } from 'next';
import nc from 'next-connect';
import { Db, ObjectId } from 'mongodb';

import { withAuth } from '../../../../utils/withAuth';

import database from '../../../../middleware/db';
import { size } from '../../../../db';
import { CreateSize } from '../../../../types';

interface Request extends NextApiRequest {
  db: Db;
  body: {
    code?: string;
    name?: string;
    sizeGroupId?: string;
    orderIndex?: number;
    active?: boolean;
  };
}

const handler = nc<Request, NextApiResponse>()
  .use(database)
  .post(async (req, res) => {
    try {
      const { code, name, sizeGroupId, orderIndex, active } = req.body;

      if (!code || !name) {
        return res.status(400).send('Missing required fields.');
      }

      const formattedCode = code.trim().toUpperCase();
      const formattedName = name.trim();

      const query = {
        $or: [{ code: formattedCode }, { name: formattedName }],
      };

      const existingSize = await req.db.collection('sizes').findOne(query);

      if (existingSize) {
        return res
          .status(400)
          .send('A size with this code and/or name already exists.');
      }

      const input: CreateSize = {
        code: formattedCode,
        name: formattedName,
        sizeGroupId: new ObjectId(sizeGroupId),
        orderIndex: orderIndex ?? 0,
        active: active ?? true,
      };

      const createdSize = await size.createSize(req.db, input);

      return res.json({ size: createdSize });
    } catch (error) {
      console.log('Error: /api/v2/size/create');
      console.error({
        error:
          error instanceof Error ? error.message : 'An unknown error occurred.',
      });
      res.status(400).json({
        error:
          error instanceof Error
            ? error.message
            : 'An unknown error occurred creating the size.',
      });
    }
  });

export default withAuth(handler);
