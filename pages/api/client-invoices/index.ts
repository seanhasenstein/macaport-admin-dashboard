import { NextApiResponse } from 'next';
import nc from 'next-connect';
import { withAuth } from '../../../utils/withAuth';
import { Request } from '../../../interfaces';
import database from '../../../middleware/db';
import { clientInvoice } from '../../../db';

// Receivables across every store. Reads only the invoices collection, so it
// stays fast however many stores there are.
const handler = nc<Request, NextApiResponse>()
  .use(database)
  .get(async (req, res) => {
    const status = (req.query as any).status === 'paid' ? 'paid' : 'open';
    const invoices = await clientInvoice.listByStatus(req.db, status);
    res.json({ invoices });
  });

export default withAuth(handler);
