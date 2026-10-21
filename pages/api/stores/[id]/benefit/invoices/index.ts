import { NextApiResponse } from 'next';
import nc from 'next-connect';
import { withAuth } from '../../../../../../utils/withAuth';
import { Request } from '../../../../../../interfaces';
import database from '../../../../../../middleware/db';
import { clientInvoice } from '../../../../../../db';
import { benefitForStore } from '../../../../../../utils/benefitApi';

const handler = nc<Request, NextApiResponse>()
  .use(database)
  .get(async (req, res) => {
    const benefit = await benefitForStore(req, res);
    if (!benefit) return;
    const invoices = await clientInvoice.listByBenefit(req.db, benefit._id);
    res.json({ invoices });
  });

export default withAuth(handler);
