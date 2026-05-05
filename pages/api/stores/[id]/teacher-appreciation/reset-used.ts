import { NextApiResponse } from 'next';
import nc from 'next-connect';
import { withAuth } from '../../../../../utils/withAuth';
import { Request } from '../../../../../interfaces';
import database from '../../../../../middleware/db';
import { teacherAppreciation } from '../../../../../db';

const handler = nc<Request, NextApiResponse>()
  .use(database)
  .post(async (req, res) => {
    const email: unknown = req.body?.email;
    if (typeof email !== 'string' || !email) {
      return res.status(400).json({ error: 'email is required.' });
    }

    const result = await teacherAppreciation.resetUsedEmail(
      req.db,
      req.query.id,
      email.trim().toLowerCase()
    );
    res.json({ teacherAppreciation: result });
  });

export default withAuth(handler);
