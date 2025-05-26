import { NextApiRequest, NextApiResponse } from 'next';
import nc from 'next-connect';
import { Db } from 'mongodb';

import { withAuth } from '../../../../utils/withAuth';

import database from '../../../../middleware/db';
import { size } from '../../../../db';

interface Request extends NextApiRequest {
  db: Db;
  body: {
    _id?: string;
    code?: string;
    name?: string;
  };
}

const handler = nc<Request, NextApiResponse>()
  .use(database)
  .get(async (req, res) => {
    try {
      const { _id, code, name } = req.body;

      if (!_id && !code && !name) {
        return res
          .status(400)
          .send(
            'At least one field (_id, code, or name) is required to find a size.'
          );
      }

      const formattedCode = code ? code.trim().toUpperCase() : undefined;
      const formattedName = name ? name.trim() : undefined;

      const query = {
        _id,
        code: formattedCode,
        name: formattedName,
      };

      const queryResult = await size.findSize(req.db, query);

      return res.json({ size: queryResult });
    } catch (error) {
      console.log('Error: /api/v2/size/index');
      console.error({
        error:
          error instanceof Error ? error.message : 'An unknown error occurred.',
      });
      res.status(400).json({
        error:
          error instanceof Error
            ? error.message
            : 'An unknown error occurred finding the size.',
      });
    }
  });

export default withAuth(handler);
