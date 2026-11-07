import { NextApiResponse } from 'next';
import nc from 'next-connect';
import { withAuth } from '../../../../../utils/withAuth';
import { Request } from '../../../../../interfaces';
import database from '../../../../../middleware/db';
import { memberBenefit } from '../../../../../db';
import { benefitForStore } from '../../../../../utils/benefitApi';
import {
  fundingError,
  readAccess,
  readAmount,
  readCopy,
  readFunding,
  readProductIds,
} from '../../../../../utils/benefitApi';

// Copy, amount, access, funding and qualifying products. The type is fixed:
// members' `used` values are counted in that type's unit.
const handler = nc<Request, NextApiResponse>()
  .use(database)
  .post(async (req, res) => {
    const benefit = await benefitForStore(req, res);
    if (!benefit) return;

    const body = req.body ?? {};
    const amount = readAmount(benefit.type, body.amount);
    if (typeof amount === 'string')
      return res.status(400).json({ error: amount });
    const copy = readCopy(body);
    if (typeof copy === 'string') return res.status(400).json({ error: copy });
    const fundingProblem = fundingError(
      benefit.type,
      readFunding(body.funding)
    );
    if (fundingProblem) return res.status(400).json({ error: fundingProblem });

    const updated = await memberBenefit.update(req.db, benefit._id, {
      amount,
      productIds: readProductIds(benefit.type, body.productIds),
      access: readAccess(body.access),
      funding: readFunding(body.funding),
      copy,
    });
    res.json({ benefit: updated });
  });

export default withAuth(handler);
