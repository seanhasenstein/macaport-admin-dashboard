import { NextApiResponse } from 'next';
import nc from 'next-connect';
import { withAuth } from '../../../../../../utils/withAuth';
import { Request } from '../../../../../../interfaces';
import database from '../../../../../../middleware/db';
import { memberBenefit } from '../../../../../../db';
import { reviewMembers } from '../../../../../../utils/memberBenefit';
import { benefitForStore } from '../../../../../../utils/benefitApi';

const handler = nc<Request, NextApiResponse>()
  .use(database)
  .post(async (req, res) => {
    const benefit = await benefitForStore(req, res);
    if (!benefit) return;

    const rows: unknown = req.body?.members;
    if (!Array.isArray(rows)) {
      return res.status(400).json({ error: 'members must be an array.' });
    }
    const { members } = reviewMembers(
      rows.map((r: any, i: number) => ({
        line: i + 1,
        email: String(r?.email ?? ''),
        firstName: String(r?.firstName ?? ''),
        lastName: String(r?.lastName ?? ''),
      })),
      benefit.members.map(m => m.email)
    );
    if (members.length === 0) {
      return res.status(400).json({ error: 'No new members to add.' });
    }

    const result = await memberBenefit.addMembers(req.db, benefit._id, members);
    res.json({ benefit: result.benefit, added: result.added });
  });

export default withAuth(handler);
