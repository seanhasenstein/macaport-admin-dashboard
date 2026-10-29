import { NextApiResponse } from 'next';
import nc from 'next-connect';
import { withAuth } from '../../../../../../utils/withAuth';
import { Request } from '../../../../../../interfaces';
import database from '../../../../../../middleware/db';
import { memberBenefit } from '../../../../../../db';
import { benefitForStore } from '../../../../../../utils/benefitApi';

const handler = nc<Request, NextApiResponse>()
  .use(database)
  .post(async (req, res) => {
    const email: unknown = req.body?.email;
    if (typeof email !== 'string' || !email) {
      return res.status(400).json({ error: 'email is required.' });
    }
    const benefit = await benefitForStore(req, res);
    if (!benefit) return;
    const updated = await memberBenefit.removeMember(
      req.db,
      benefit._id,
      email
    );
    if (updated === 'notFound') {
      return res.status(404).json({ error: 'No member with that email.' });
    }
    if (updated === 'hasUsage') {
      return res.status(409).json({
        error:
          'This member has used their benefit, so they cannot be removed. End their benefit instead; it keeps their history.',
      });
    }
    res.json({ benefit: updated });
  });

export default withAuth(handler);
