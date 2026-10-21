import { NextApiResponse } from 'next';
import nc from 'next-connect';
import { ObjectId } from 'mongodb';
import { withAuth } from '../../../../../utils/withAuth';
import { Order, Request } from '../../../../../interfaces';
import database from '../../../../../middleware/db';
import { memberBenefit } from '../../../../../db';
import { benefitForStore } from '../../../../../utils/benefitApi';

// Refused while any order in the store links to the benefit: those orders'
// adjustments and refunds still point at it.
const handler = nc<Request, NextApiResponse>()
  .use(database)
  .post(async (req, res) => {
    const benefit = await benefitForStore(req, res);
    if (!benefit) return;

    const store = await req.db
      .collection('stores')
      .findOne(
        { _id: new ObjectId(req.query.id) },
        { projection: { 'orders.orderId': 1, 'orders.benefit.benefitId': 1 } }
      );
    const linked = ((store?.orders ?? []) as Order[]).filter(
      o => o.benefit?.benefitId === benefit._id
    );
    if (linked.length > 0) {
      return res.status(409).json({
        error: `${linked.length} order${
          linked.length === 1 ? '' : 's'
        } used this benefit. Pause it instead of deleting it.`,
      });
    }

    await memberBenefit.remove(req.db, benefit._id, req.query.id);
    res.json({ success: true });
  });

export default withAuth(handler);
