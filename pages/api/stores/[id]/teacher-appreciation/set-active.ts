import { NextApiResponse } from 'next';
import nc from 'next-connect';
import { withAuth } from '../../../../../utils/withAuth';
import { Request } from '../../../../../interfaces';
import database from '../../../../../middleware/db';
import { teacherAppreciation } from '../../../../../db';

const handler = nc<Request, NextApiResponse>()
  .use(database)
  .post(async (req, res) => {
    const active: unknown = req.body?.active;
    if (typeof active !== 'boolean') {
      return res.status(400).json({ error: 'active must be a boolean.' });
    }

    const result = await teacherAppreciation.setActive(
      req.db,
      req.query.id,
      active
    );
    res.json({ teacherAppreciation: result });
  });

export default withAuth(handler);
