import { NextApiResponse } from 'next';
import nc from 'next-connect';
import { ObjectId } from 'mongodb';
import { getSession } from 'next-auth/react';
import { withAuth } from '../../../../../../utils/withAuth';
import { Order, Request } from '../../../../../../interfaces';
import database from '../../../../../../middleware/db';
import { clientInvoice } from '../../../../../../db';
import { benefitForStore } from '../../../../../../utils/benefitApi';

// Takes an order off the invoiceable list, with a reason, or puts it back.
// Only an order that is not already on an invoice can be excluded.
const handler = nc<Request, NextApiResponse>()
  .use(database)
  .post(async (req, res) => {
    const benefit = await benefitForStore(req, res);
    if (!benefit) return;
    const orderId = String(req.body?.orderId ?? '');
    const exclude = req.body?.exclude !== false;
    const reason = String(req.body?.reason ?? '')
      .trim()
      .slice(0, 300);
    if (!orderId)
      return res.status(400).json({ error: 'An order id is required.' });
    if (exclude && !reason) {
      return res
        .status(400)
        .json({ error: 'Say why this order is not being billed.' });
    }

    const store = await req.db
      .collection('stores')
      .findOne(
        { _id: new ObjectId(req.query.id), 'orders.orderId': orderId },
        { projection: { 'orders.$': 1 } }
      );
    const order = (store?.orders as Order[] | undefined)?.[0];
    if (!order || order.benefit?.benefitId !== benefit._id) {
      return res
        .status(404)
        .json({ error: 'Order not found on this benefit.' });
    }
    if (order.clientInvoiceId) {
      return res
        .status(409)
        .json({ error: 'That order is already on an invoice.' });
    }

    const session = await getSession({ req });
    await clientInvoice.setOrderExclusion(
      req.db,
      req.query.id,
      orderId,
      exclude
        ? {
            reason,
            by: session?.user?.email ?? '',
            at: new Date().toISOString(),
          }
        : null
    );
    res.json({ success: true });
  });

export default withAuth(handler);
