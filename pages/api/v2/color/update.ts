import { NextApiRequest, NextApiResponse } from 'next';
import nc from 'next-connect';
import { Db } from 'mongodb';

import { withAuth } from '../../../../utils/withAuth';
import { formatSingleHexColor } from '../../../../utils';

import database from '../../../../middleware/db';
import { color } from '../../../../db';

import { UpdateColor } from '../../../../types';

interface Request extends NextApiRequest {
  db: Db;
  body: UpdateColor;
}

const handler = nc<Request, NextApiResponse>()
  .use(database)
  .post(async (req, res) => {
    try {
      const { _id, code, name, hex, orderIndex, active } = req.body;

      const formattedCode = code ? code.trim().toUpperCase() : undefined;
      const formattedName = name ? name.trim() : undefined;
      const formattedHex = hex ? formatSingleHexColor(hex) : undefined;

      if (!_id) {
        return res.status(400).send('Missing required _id.');
      }

      const currentColor = await color.findColor(req.db, { _id });

      const {
        code: currentCode,
        name: currentName,
        hex: currentHex,
      } = currentColor || {};

      if (currentCode !== formattedCode) {
        const existingCode = await req.db
          .collection('colors')
          .findOne({ code: formattedCode });

        if (existingCode) {
          return res.status(400).send('Color with this code already exists.');
        }
      }

      if (currentName !== formattedName) {
        const existingName = await req.db
          .collection('colors')
          .findOne({ name: formattedName });

        if (existingName) {
          return res.status(400).send('Color with this name already exists.');
        }
      }

      if (currentHex !== formattedHex) {
        const existingHex = await req.db
          .collection('colors')
          .findOne({ hex: formattedHex });

        if (existingHex) {
          return res.status(400).send('Color with this hex already exists.');
        }
      }

      const update: UpdateColor = {
        _id,
        ...(code && { code }),
        ...(name && { name }),
        ...(hex && { hex: formattedHex }),
        ...(orderIndex && { orderIndex }),
        ...(active && { active }),
      };

      const updatedColor = await color.updateColor(req.db, update);

      return res.json({ color: updatedColor });
    } catch (error) {
      console.log('Error: /api/v2/color/update');
      console.error({
        error:
          error instanceof Error ? error.message : 'An unknown error occurred.',
      });
      res.status(400).json({
        error:
          error instanceof Error
            ? error.message
            : 'An unknown error occurred updating the color.',
      });
    }
  });

export default withAuth(handler);
