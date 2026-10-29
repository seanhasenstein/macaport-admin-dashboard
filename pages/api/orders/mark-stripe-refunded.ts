import { NextApiResponse } from 'next';
import nc from 'next-connect';
import { ObjectId } from 'mongodb';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]';
import { withAuth } from '../../../utils/withAuth';
import { Request } from '../../../interfaces';
import database from '../../../middleware/db';
import { order as orderModel } from '../../../db';

// Records that the card refund owed on an order has been made in Stripe,
// up to the amount recorded at the time. The dashboard never calls Stripe.
const handler = nc<Request, NextApiResponse>()
  .use(database)
  .post(async (req, res) => {
    const storeId = req.query.sid;
    const orderId = req.query.oid;
    if (!storeId || !ObjectId.isValid(storeId) || !orderId) {
      return res
        .status(400)
        .json({ error: 'A store and order id are required.' });
    }
    const found = await orderModel.getOrderById(req.db, storeId, orderId);
    if (!found) return res.status(404).json({ error: 'Order not found.' });
    const card = found.order.refund?.card ?? 0;
    if (card <= (found.order.refund?.stripeRefunded ?? 0)) {
      return res
        .status(409)
        .json({ error: 'There is no card refund waiting on this order.' });
    }
    const session = await getServerSession(req, res, authOptions);
    // Conditional on the recorded amount, so a refund recorded a moment ago
    // is not marked done by a click on an older figure.
    const result = await req.db.collection('stores').updateOne(
      {
        _id: new ObjectId(storeId),
        orders: { $elemMatch: { orderId, 'refund.card': card } },
      },
      {
        $set: {
          'orders.$.refund.stripeRefunded': card,
          'orders.$.refund.stripeRefundedAt': new Date().toISOString(),
          'orders.$.refund.stripeRefundedBy': session?.user?.email ?? '',
        },
      }
    );
    if (result.matchedCount !== 1) {
      return res
        .status(409)
        .json({
          error: 'The refund on this order just changed. Reload and try again.',
        });
    }
    res.json({ stripeRefunded: card });
  });

export default withAuth(handler);
