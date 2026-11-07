import { NextApiResponse } from 'next';
import nc from 'next-connect';
import { ObjectId } from 'mongodb';
import { withAuth } from '../../../utils/withAuth';
import { Request } from '../../../interfaces';
import database from '../../../middleware/db';
import { order as orderModel } from '../../../db';

// Undoes "Mark refunded in Stripe" when it was clicked by mistake. It only
// clears the dashboard's record; nothing in Stripe changes, and the card
// refund shows as due again.
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
    const marked = found.order.refund?.stripeRefunded;
    if (!marked) {
      return res
        .status(409)
        .json({ error: 'This order is not marked refunded in Stripe.' });
    }
    // Conditional on the figure that was read, so an undo cannot clear a
    // newer confirmation someone else just saved.
    const result = await req.db.collection('stores').updateOne(
      {
        _id: new ObjectId(storeId),
        orders: {
          $elemMatch: { orderId, 'refund.stripeRefunded': marked },
        },
      },
      {
        $unset: {
          'orders.$.refund.stripeRefunded': '',
          'orders.$.refund.stripeRefundedAt': '',
          'orders.$.refund.stripeRefundedBy': '',
        },
      }
    );
    if (result.matchedCount !== 1) {
      return res.status(409).json({
        error: 'The refund on this order just changed. Reload and try again.',
      });
    }
    res.json({ ok: true });
  });

export default withAuth(handler);
