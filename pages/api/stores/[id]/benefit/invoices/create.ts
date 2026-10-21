import { NextApiResponse } from 'next';
import nc from 'next-connect';
import { ObjectId } from 'mongodb';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../../auth/[...nextauth]';
import { withAuth } from '../../../../../../utils/withAuth';
import { Request, Store } from '../../../../../../interfaces';
import database from '../../../../../../middleware/db';
import { clientInvoice } from '../../../../../../db';
import { benefitForStore } from '../../../../../../utils/benefitApi';
import {
  DEFAULT_INVOICE_GRACE_DAYS,
  invoiceTotals,
  invoiceUnsettledDrift,
  orderInvoiceState,
  orderNetBenefitAmount,
} from '../../../../../../utils/memberBenefit';
import { ClientInvoiceLine } from '../../../../../../interfaces';

const DATE = /^\d{4}-\d{2}-\d{2}$/;

// Freezes the selected orders' amounts onto a new invoice. Every order is
// re-checked here: it must still be eligible, so a stale tab cannot bill
// an order twice or bill one that was canceled since the page loaded.
const handler = nc<Request, NextApiResponse>()
  .use(database)
  .post(async (req, res) => {
    const benefit = await benefitForStore(req, res);
    if (!benefit) return;
    if (benefit.funding !== 'client') {
      return res
        .status(400)
        .json({ error: 'Only a client-funded benefit is invoiced.' });
    }

    const body = req.body ?? {};
    const number = String(body.number ?? '').trim();
    const issuedAt = String(body.issuedAt ?? '').trim();
    const dueAt = body.dueAt ? String(body.dueAt).trim() : null;
    const note = String(body.note ?? '')
      .trim()
      .slice(0, 500);
    const orderIds: unknown = body.orderIds;

    if (!number)
      return res.status(400).json({ error: 'An invoice number is required.' });
    if (!DATE.test(issuedAt))
      return res.status(400).json({ error: 'An issue date is required.' });
    if (dueAt && !DATE.test(dueAt))
      return res.status(400).json({ error: 'The due date is not valid.' });
    if (!Array.isArray(orderIds) || orderIds.length === 0) {
      return res.status(400).json({ error: 'Pick at least one order.' });
    }

    let paid: { paidAt: string; reference: string } | null = null;
    if (body.paid) {
      const paidAt = String(body.paid.paidAt ?? '').trim();
      if (!DATE.test(paidAt))
        return res.status(400).json({ error: 'A payment date is required.' });
      paid = {
        paidAt,
        reference: String(body.paid.reference ?? '')
          .trim()
          .slice(0, 120),
      };
    }

    const store = await req.db
      .collection<Store>('stores')
      .findOne({ _id: new ObjectId(req.query.id) } as any);
    if (!store) return res.status(404).json({ error: 'Store not found.' });

    const settings = await req.db.collection('shipping').findOne({});
    const graceDays =
      typeof settings?.invoiceGraceDays === 'number'
        ? settings.invoiceGraceDays
        : DEFAULT_INVOICE_GRACE_DAYS;

    const wanted = new Set(orderIds.map(String));
    const orders = store.orders.filter(o => wanted.has(o.orderId));
    if (orders.length !== wanted.size) {
      return res
        .status(400)
        .json({ error: 'One of the orders could not be found.' });
    }
    const notEligible = orders.filter(
      o =>
        o.benefit?.benefitId !== benefit._id ||
        orderInvoiceState(o, graceDays) !== 'eligible'
    );
    if (notEligible.length > 0) {
      return res.status(409).json({
        error: `Order${notEligible.length === 1 ? '' : 's'} ${notEligible
          .map(o => `#${o.orderId}`)
          .join(', ')} can no longer be invoiced. Reload and try again.`,
      });
    }

    const lines: ClientInvoiceLine[] = orders.map(o => ({
      orderId: o.orderId,
      customer: `${o.customer.firstName} ${o.customer.lastName}`.trim(),
      orderDate: o.createdAt,
      amount: orderNetBenefitAmount(o),
      kind: 'order',
    }));

    // Earlier invoices whose orders were refunded or canceled since: credit
    // the difference back here, so the client's next bill nets out without
    // anyone remembering to.
    const earlier = (
      await clientInvoice.listByBenefit(req.db, benefit._id)
    ).filter(i => i.status !== 'void');
    const settlements: {
      invoiceId: string;
      perOrder: { orderId: string; amount: number; expectedSettled: number }[];
    }[] = [];
    for (const inv of earlier) {
      const drift = invoiceUnsettledDrift(inv, store.orders).filter(
        d => d.amount < 0
      );
      if (drift.length === 0) continue;
      for (const d of drift) {
        lines.push({
          orderId: d.orderId,
          customer: d.customer,
          orderDate: inv.issuedAt,
          amount: d.amount,
          kind: 'adjustment',
          adjustsInvoiceId: inv._id,
          adjustsInvoiceNumber: inv.number,
        });
      }
      settlements.push({
        invoiceId: inv._id,
        perOrder: drift.map(d => ({
          orderId: d.orderId,
          amount: d.amount,
          expectedSettled: inv.settledDrift?.[d.orderId] ?? 0,
        })),
      });
    }

    const totals = invoiceTotals(lines.map(l => l.amount));
    if (totals.total < 0) {
      return res.status(409).json({
        error:
          'Credits from earlier invoices exceed this one. Issue a credit memo in QuickBooks instead, or include more orders.',
      });
    }

    const session = await getServerSession(req, res, authOptions);
    const invoice = await clientInvoice.create(req.db, {
      storeId: String(store._id),
      storeName: store.name,
      benefitId: benefit._id,
      benefitName: benefit.copy.benefitName,
      number,
      issuedAt,
      dueAt,
      note,
      lines,
      ...totals,
      createdBy: session?.user?.email ?? '',
      paid,
    });

    if (!invoice) {
      return res.status(409).json({
        error:
          'One of these orders was invoiced a moment ago by someone else. Reload and try again.',
      });
    }

    // Settle the credits this invoice carries. If another invoice took one
    // of them a moment ago, this invoice is withdrawn rather than crediting
    // the client twice.
    for (const settlement of settlements) {
      const ok = await clientInvoice.settleDrift(
        req.db,
        settlement.invoiceId,
        settlement.perOrder
      );
      if (!ok) {
        await clientInvoice.deleteInvoiceAndRelease(req.db, invoice);
        return res.status(409).json({
          error:
            'A credit on this invoice was just applied by another invoice. Reload and try again.',
        });
      }
    }

    res.json({ invoice });
  });

export default withAuth(handler);
