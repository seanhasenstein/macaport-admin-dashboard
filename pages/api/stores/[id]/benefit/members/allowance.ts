import { NextApiResponse } from 'next';
import nc from 'next-connect';
import { withAuth } from '../../../../../../utils/withAuth';
import { Request } from '../../../../../../interfaces';
import database from '../../../../../../middleware/db';
import { memberBenefit } from '../../../../../../db';
import {
  amountErrorMessage,
  parseBenefitAmount,
} from '../../../../../../utils/memberBenefit';
import { benefitForStore } from '../../../../../../utils/benefitApi';

// A per-member override of the benefit's amount. null clears it.
const handler = nc<Request, NextApiResponse>()
  .use(database)
  .post(async (req, res) => {
    const email: unknown = req.body?.email;
    if (typeof email !== 'string' || !email) {
      return res.status(400).json({ error: 'email is required.' });
    }
    const benefit = await benefitForStore(req, res);
    if (!benefit) return;

    let allowance: number | null = null;
    if (req.body?.allowance !== null && req.body?.allowance !== undefined) {
      allowance = parseBenefitAmount(benefit.type, req.body.allowance);
      if (allowance === null) {
        return res
          .status(400)
          .json({ error: amountErrorMessage(benefit.type) });
      }
    }

    const updated = await memberBenefit.setAllowance(
      req.db,
      benefit._id,
      email,
      allowance
    );
    res.json({ benefit: updated });
  });

export default withAuth(handler);
