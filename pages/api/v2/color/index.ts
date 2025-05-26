import { NextApiRequest, NextApiResponse } from 'next';
import nc from 'next-connect';
import { Db } from 'mongodb';

import { withAuth } from '../../../../utils/withAuth';
import { formatSingleHexColor } from '../../../../utils';

import database from '../../../../middleware/db';
import { color } from '../../../../db';

interface Request extends NextApiRequest {
  db: Db;
  body: {
    _id?: string;
    code?: string;
    name?: string;
    hex?: string;
  };
}

const handler = nc<Request, NextApiResponse>()
  .use(database)
  .get(async (req, res) => {
    try {
      const { _id, code, name, hex } = req.body;

      if (!_id && !code && !name && !hex) {
        return res
          .status(400)
          .send(
            'At least one field (_id, code, name, or hex) is required to find a color.'
          );
      }

      const formattedCode = code ? code.trim().toUpperCase() : undefined;
      const formattedName = name ? name.trim() : undefined;
      const formattedHex = hex ? formatSingleHexColor(hex) : undefined;

      const query = {
        _id,
        code: formattedCode,
        name: formattedName,
        hex: formattedHex,
      };

      const queryResult = await color.findColor(req.db, query);

      return res.json({ color: queryResult });
    } catch (error) {
      console.log('Error: /api/v2/color/index');
      console.error({
        error:
          error instanceof Error ? error.message : 'An unknown error occurred.',
      });
      res.status(400).json({
        error:
          error instanceof Error
            ? error.message
            : 'An unknown error occurred finding the color.',
      });
    }
  });

export default withAuth(handler);
