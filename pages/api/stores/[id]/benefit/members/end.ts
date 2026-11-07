import { NextApiResponse } from 'next';
import nc from 'next-connect';
import { withAuth } from '../../../../../../utils/withAuth';
import { Request } from '../../../../../../interfaces';
import database from '../../../../../../middleware/db';
import { memberBenefit } from '../../../../../../db';
import { benefitForStore } from '../../../../../../utils/benefitApi';

// Ends a member's benefit: nothing left to use, history kept.
const handler = nc<Request, NextApiResponse>()
  .use(database)
  .post(async (req, res) => {
    const email: unknown = req.body?.email;
    if (typeof email !== 'string' || !email) {
      return res.status(400).json({ error: 'email is required.' });
    }
    const benefit = await benefitForStore(req, res);
    if (!benefit) return;
    try {
      const updated = await memberBenefit.endMember(req.db, benefit._id, email);
      if (updated === 'notFound') {
        return res.status(404).json({ error: 'No member with that email.' });
      }
      res.json({ benefit: updated });
    } catch (error) {
      res.status(409).json({
        error: error instanceof Error ? error.message : 'Could not end it.',
      });
    }
  });

export default withAuth(handler);
