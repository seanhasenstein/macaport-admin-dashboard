import { NextApiResponse } from 'next';
import nc from 'next-connect';
import { withAuth } from '../../../../../utils/withAuth';
import { Request } from '../../../../../interfaces';
import database from '../../../../../middleware/db';
import { memberBenefit } from '../../../../../db';
import { reviewMembers } from '../../../../../utils/memberBenefit';
import {
  fundingError,
  isBenefitType,
  readAccess,
  readAmount,
  readCopy,
  readFunding,
  readProductIds,
} from '../../../../../utils/benefitApi';

const handler = nc<Request, NextApiResponse>()
  .use(database)
  .post(async (req, res) => {
    const body = req.body ?? {};
    if (!isBenefitType(body.type)) {
      return res
        .status(400)
        .json({ error: 'A valid benefit type is required.' });
    }
    const amount = readAmount(body.type, body.amount);
    if (typeof amount === 'string')
      return res.status(400).json({ error: amount });
    const copy = readCopy(body);
    if (typeof copy === 'string') return res.status(400).json({ error: copy });
    const funding = readFunding(body.funding);
    const fundingProblem = fundingError(body.type, funding);
    if (fundingProblem) return res.status(400).json({ error: fundingProblem });

    const rows = Array.isArray(body.members) ? body.members : [];
    const { members } = reviewMembers(
      rows.map((r: any, i: number) => ({
        line: i + 1,
        email: String(r?.email ?? ''),
        firstName: String(r?.firstName ?? ''),
        lastName: String(r?.lastName ?? ''),
      })),
      []
    );

    try {
      const benefit = await memberBenefit.create(req.db, req.query.id, {
        type: body.type,
        amount,
        productIds: readProductIds(body.type, body.productIds),
        access: readAccess(body.access),
        funding,
        copy,
        members,
      });
      res.json({ benefit });
    } catch (error) {
      res.status(400).json({
        error: error instanceof Error ? error.message : 'Failed to create.',
      });
    }
  });

export default withAuth(handler);
