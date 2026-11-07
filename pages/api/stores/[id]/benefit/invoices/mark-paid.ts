import { NextApiResponse } from 'next';
import nc from 'next-connect';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../../auth/[...nextauth]';
import { withAuth } from '../../../../../../utils/withAuth';
import { Request } from '../../../../../../interfaces';
import database from '../../../../../../middleware/db';
import { clientInvoice } from '../../../../../../db';

const DATE = /^\d{4}-\d{2}-\d{2}$/;

const handler = nc<Request, NextApiResponse>()
  .use(database)
  .post(async (req, res) => {
    const id = String(req.body?.invoiceId ?? '');
    const paidAt = String(req.body?.paidAt ?? '').trim();
    const reference = String(req.body?.reference ?? '')
      .trim()
      .slice(0, 120);
    if (!DATE.test(paidAt)) {
      return res.status(400).json({ error: 'A payment date is required.' });
    }
    const existing = await clientInvoice.getById(req.db, id);
    if (!existing || existing.storeId !== req.query.id) {
      return res.status(404).json({ error: 'Invoice not found.' });
    }
    const session = await getServerSession(req, res, authOptions);
    const invoice = await clientInvoice.markPaid(
      req.db,
      id,
      paidAt,
      reference,
      session?.user?.email ?? ''
    );
    if (!invoice) {
      return res
        .status(409)
        .json({ error: 'Only an open invoice can be marked paid.' });
    }
    res.json({ invoice });
  });

export default withAuth(handler);
