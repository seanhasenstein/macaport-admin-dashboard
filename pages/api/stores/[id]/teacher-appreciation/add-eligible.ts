import { NextApiResponse } from 'next';
import nc from 'next-connect';
import { withAuth } from '../../../../../utils/withAuth';
import { Request } from '../../../../../interfaces';
import database from '../../../../../middleware/db';
import { teacherAppreciation } from '../../../../../db';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const handler = nc<Request, NextApiResponse>()
  .use(database)
  .post(async (req, res) => {
    const incoming: unknown = req.body?.emails;
    if (!Array.isArray(incoming)) {
      return res.status(400).json({ error: 'emails must be an array.' });
    }

    const cleaned = Array.from(
      new Set(
        incoming
          .filter((e): e is string => typeof e === 'string')
          .map(e => e.trim().toLowerCase())
          .filter(e => EMAIL_REGEX.test(e))
      )
    );

    if (cleaned.length === 0) {
      return res.status(400).json({ error: 'No valid emails provided.' });
    }

    const result = await teacherAppreciation.addEligibleEmails(
      req.db,
      req.query.id,
      cleaned
    );
    res.json({ teacherAppreciation: result });
  });

export default withAuth(handler);
