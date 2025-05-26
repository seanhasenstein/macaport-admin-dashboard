import { NextApiRequest, NextApiResponse } from 'next';
import nc from 'next-connect';
import { Db } from 'mongodb';

import { withAuth } from '../../../../utils/withAuth';
import { formatSingleHexColor } from '../../../../utils';

import database from '../../../../middleware/db';
import { color } from '../../../../db';

import { CreateColor } from '../../../../types';

interface Request extends NextApiRequest {
  db: Db;
  body: {
    code?: string;
    name?: string;
    hex?: string;
    orderIndex?: number;
    active?: boolean;
  };
}

const handler = nc<Request, NextApiResponse>()
  .use(database)
  .post(async (req, res) => {
    try {
      const { code, name, hex, orderIndex, active } = req.body;

      if (!code || !name || !hex) {
        return res.status(400).send('Missing required fields.');
      }

      const formattedCode = code.trim().toUpperCase();
      const formattedName = name.trim();
      const formattedHex = formatSingleHexColor(hex);

      const query = {
        $or: [
          { code: formattedCode },
          { name: formattedName },
          { hex: formattedHex },
        ],
      };

      const existingColor = await req.db.collection('colors').findOne(query);

      if (existingColor) {
        return res
          .status(400)
          .send('Color with this code, name, and/or hex already exists.');
      }

      const input: CreateColor = {
        code: formattedCode,
        name: formattedName,
        orderIndex: orderIndex ?? 0,
        hex: formattedHex,
        active: active ?? true,
      };

      const createdColor = await color.createColor(req.db, input);

      return res.json({ color: createdColor });
    } catch (error) {
      console.log('Error: /api/v2/color/create');
      console.error({
        error:
          error instanceof Error ? error.message : 'An unknown error occurred.',
      });
      res.status(400).json({
        error:
          error instanceof Error
            ? error.message
            : 'An unknown error occurred creating the color.',
      });
    }
  });

export default withAuth(handler);
