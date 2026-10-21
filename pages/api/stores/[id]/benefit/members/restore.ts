import { NextApiResponse } from 'next';
import nc from 'next-connect';
import { withAuth } from '../../../../../../utils/withAuth';
import { Request } from '../../../../../../interfaces';
import database from '../../../../../../middleware/db';
import { memberBenefit } from '../../../../../../db';
import { benefitForStore } from '../../../../../../utils/benefitApi';

// The manual restore: lowers a member's `used` by a whole amount in the
// benefit's unit (cents, or garments). The db call refuses to go below zero.
const handler = nc<Request, NextApiResponse>()
  .use(database)
  .post(async (req, res) => {
    const email: unknown = req.body?.email;
    const amount = Number(req.body?.amount);
    if (typeof email !== 'string' || !email) {
      return res.status(400).json({ error: 'email is required.' });
    }
    if (!Number.isInteger(amount) || amount <= 0) {
      return res
        .status(400)
        .json({ error: 'amount must be a positive whole number.' });
    }
    const benefit = await benefitForStore(req, res);
    if (!benefit) return;

    const result = await memberBenefit.restoreUsed(
      req.db,
      benefit._id,
      email,
      amount
    );
    if (result === 'notFound') {
      return res.status(404).json({ error: 'No member with that email.' });
    }
    if (result === 'insufficient') {
      return res.status(409).json({
        error: 'That member has less used than the amount to restore.',
      });
    }
    const updated = await memberBenefit.getById(req.db, benefit._id);
    res.json({ benefit: updated });
  });

export default withAuth(handler);
