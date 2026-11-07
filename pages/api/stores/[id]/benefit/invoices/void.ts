import { NextApiResponse } from 'next';
import nc from 'next-connect';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../../auth/[...nextauth]';
import { withAuth } from '../../../../../../utils/withAuth';
import { Request } from '../../../../../../interfaces';
import database from '../../../../../../middleware/db';
import { clientInvoice } from '../../../../../../db';

const handler = nc<Request, NextApiResponse>()
  .use(database)
  .post(async (req, res) => {
    const id = String(req.body?.invoiceId ?? '');
    const existing = await clientInvoice.getById(req.db, id);
    if (!existing || existing.storeId !== req.query.id) {
      return res.status(404).json({ error: 'Invoice not found.' });
    }
    if (await clientInvoice.hasLaterCredits(req.db, id)) {
      return res.status(409).json({
        error:
          'A later invoice already credits the client for changes to this one. Void that invoice first, or leave this one as it is.',
      });
    }
    const session = await getServerSession(req, res, authOptions);
    const invoice = await clientInvoice.voidInvoice(
      req.db,
      id,
      session?.user?.email ?? ''
    );
    if (!invoice) {
      return res.status(409).json({ error: 'That invoice is already void.' });
    }
    res.json({ invoice });
  });

export default withAuth(handler);
