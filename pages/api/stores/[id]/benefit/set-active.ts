import { NextApiResponse } from 'next';
import nc from 'next-connect';
import { withAuth } from '../../../../../utils/withAuth';
import { Request } from '../../../../../interfaces';
import database from '../../../../../middleware/db';
import { memberBenefit } from '../../../../../db';
import { benefitForStore } from '../../../../../utils/benefitApi';

const handler = nc<Request, NextApiResponse>()
  .use(database)
  .post(async (req, res) => {
    const active: unknown = req.body?.active;
    if (typeof active !== 'boolean') {
      return res.status(400).json({ error: 'active must be a boolean.' });
    }
    const benefit = await benefitForStore(req, res);
    if (!benefit) return;
    const updated = await memberBenefit.setActive(req.db, benefit._id, active);
    res.json({ benefit: updated });
  });

export default withAuth(handler);
