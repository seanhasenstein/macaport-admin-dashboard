import { NextApiRequest, NextApiResponse } from 'next';
import nc from 'next-connect';
import { Db, ObjectId } from 'mongodb';

import { withAuth } from '../../../../utils/withAuth';

import database from '../../../../middleware/db';
import { size } from '../../../../db';

import { UpdateSize } from '../../../../types';

interface Request extends NextApiRequest {
  db: Db;
  body: UpdateSize;
}

const handler = nc<Request, NextApiResponse>()
  .use(database)
  .post(async (req, res) => {
    try {
      const { _id, code, name, sizeGroupId, orderIndex, active } = req.body;

      const formattedCode = code ? code.trim().toUpperCase() : undefined;
      const formattedName = name ? name.trim() : undefined;

      if (!_id) {
        return res.status(400).send('Missing required _id.');
      }

      const currentSize = await size.findSize(req.db, { _id });

      const { code: currentCode, name: currentName } = currentSize || {};

      if (currentCode !== formattedCode) {
        const existingCode = await req.db
          .collection('sizes')
          .findOne({ code: formattedCode });

        if (existingCode) {
          return res.status(400).send('Size with this code already exists.');
        }
      }

      if (currentName !== formattedName) {
        const existingName = await req.db
          .collection('sizes')
          .findOne({ name: formattedName });

        if (existingName) {
          return res.status(400).send('Size with this name already exists.');
        }
      }

      const update: UpdateSize = {
        _id,
        ...(formattedCode && { code: formattedCode }),
        ...(formattedName && { name: formattedName }),
        ...(sizeGroupId && { sizeGroupId: new ObjectId(sizeGroupId) }),
        ...(orderIndex && { orderIndex }),
        ...(active && { active }),
      };

      const updatedSize = await size.updateSize(req.db, update);

      return res.json({ size: updatedSize });
    } catch (error) {
      console.log('Error: /api/v2/size/update');
      console.error({
        error:
          error instanceof Error ? error.message : 'An unknown error occurred.',
      });
      res.status(400).json({
        error:
          error instanceof Error
            ? error.message
            : 'An unknown error occurred updating the size.',
      });
    }
  });

export default withAuth(handler);
