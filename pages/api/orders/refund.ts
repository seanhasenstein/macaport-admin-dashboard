import { NextApiResponse } from 'next';
import nc from 'next-connect';
import { ObjectId } from 'mongodb';
import { withAuth } from '../../../utils/withAuth';
import { Request, ReturnedItem } from '../../../interfaces';
import database from '../../../middleware/db';
import {
  inventoryProduct,
  memberBenefit,
  order as orderModel,
  shipping as shippingModel,
} from '../../../db';
import { memberEnded } from '../../../utils/memberBenefit';
import {
  applyChoices,
  computeRefund,
  customerRefundSentence,
  RefundChoices,
  RefundInput,
} from '../../../utils/refund';
import { refundEmail, sendEmail } from '../../../utils/email';

// The credit side of a refund. Recomputes the split from the same input the
// admin previewed, restores the member's allowance with a conditional
// update, records the refund on the order, and emails the customer. Never
// calls Stripe: the card refund is made there by hand.
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

    const input = readInput(req.body);
    if (!input) {
      return res.status(400).json({ error: 'Invalid refund input.' });
    }
    const choices: RefundChoices = {
      restoreCredit: req.body?.restoreCredit !== false,
      restock: Array.isArray(req.body?.restock)
        ? req.body.restock.filter((id: unknown) => typeof id === 'string')
        : [],
    };

    const found = await orderModel.getOrderById(req.db, storeId, orderId);
    if (!found) {
      return res.status(404).json({ error: 'Order not found.' });
    }
    const { order, storeName } = found;
    if (order.orderStatus === 'Canceled') {
      return res.status(400).json({ error: 'This order is canceled.' });
    }

    const benefit = order.benefit
      ? await memberBenefit.getById(req.db, order.benefit.benefitId)
      : null;
    // A member whose benefit was ended could not spend restored credit, so
    // none is restored and the customer is not told it was.
    if (memberEnded(benefit, order.benefit?.email)) {
      choices.restoreCredit = false;
    }
    const shipping = await shippingModel.findShippingData(req.db);
    if (!shipping) {
      return res.status(409).json({
        error:
          'Store settings have not been set up yet. Open the settings menu next to Search and save them first.',
      });
    }

    const computed = computeRefund({ order, benefit, shipping }, input);
    const split = applyChoices(computed, choices);
    // Restock only what this call newly accepted as returned, so a repeat
    // submission cannot add the same garments to inventory twice.
    const previouslyReturned = new Map(
      (order.refund?.returnedItems ?? []).map(r => [r.id, r.quantity])
    );
    const restocking = split.cumulativeReturned
      .map(r => ({
        id: r.id,
        quantity: r.quantity - (previouslyReturned.get(r.id) ?? 0),
      }))
      .filter(r => r.quantity > 0 && choices.restock.includes(r.id));
    if (
      split.card === 0 &&
      split.creditRestored === 0 &&
      restocking.length === 0
    ) {
      return res.status(400).json({ error: 'Nothing to refund.' });
    }

    // 1. restore the credit, if any, and only if the member still has it
    if (split.creditRestored > 0) {
      if (!benefit || !order.benefit) {
        return res.status(409).json({
          error:
            'The benefit this order used no longer exists, so its credit cannot be restored.',
        });
      }
      const result = await memberBenefit.restoreUsed(
        req.db,
        benefit._id,
        order.benefit.email,
        split.creditRestored
      );
      if (result !== 'restored') {
        return res.status(409).json({
          error:
            result === 'notFound'
              ? 'The member is no longer on the benefit, so their credit cannot be restored.'
              : 'The member has less used than this refund would restore.',
        });
      }
    }

    // 2. record it on the order
    // Only the refund's own fields are written, so a Stripe confirmation
    // saved by someone else in the meantime is left alone.
    const updated = await req.db.collection('stores').updateOne(
      { _id: new ObjectId(storeId), 'orders.orderId': orderId },
      {
        $set: {
          'orders.$.refund.status': split.full ? 'Full' : 'Partial',
          'orders.$.refund.amount': split.cumulativeCard,
          'orders.$.refund.card': split.cumulativeCard,
          'orders.$.refund.creditRestored': split.cumulativeRestored,
          'orders.$.refund.returnedItems': split.cumulativeReturned,
          'orders.$.refund.updatedAt': new Date().toISOString(),
        },
      }
    );
    if (updated.matchedCount !== 1) {
      console.error(
        `Refund for order ${orderId} restored ${split.creditRestored} but could not be recorded.`
      );
      return res.status(500).json({
        error:
          'The credit was restored but the refund could not be recorded on the order.',
      });
    }

    // 3. put returned garments back on the shelf, where the admin said so
    for (const returned of restocking) {
      const item = order.items.find(i => i.id === returned.id);
      if (!item) continue;
      const sku = await inventoryProduct.getInventoryProductSku(
        req.db,
        item.sku.inventoryProductId,
        item.sku.inventorySkuId
      );
      if (sku) {
        await inventoryProduct.updateInventoryProductSkusInventory(
          req.db,
          item.sku.inventoryProductId,
          item.sku.inventorySkuId,
          sku.inventory + returned.quantity
        );
      }
    }

    // 4. tell the customer, unless nothing changed for them (restock only)
    const sentence = customerRefundSentence(split);
    let emailed = false;
    let redirectedTo: string | null = null;
    if (sentence) {
      try {
        const message = refundEmail({
          firstName: order.customer.firstName,
          orderId: order.orderId,
          storeName,
          sentence,
        });
        const result = await sendEmail({
          to: order.customer.email,
          ...message,
        });
        if (result.redirected) redirectedTo = result.deliveredTo;
        emailed = true;
      } catch (error) {
        console.error('Refund email failed', error);
      }
    }

    res.json({
      split,
      emailed,
      redirectedTo,
      restocked: restocking.reduce((sum, r) => sum + r.quantity, 0),
    });
  });

function readInput(body: any): RefundInput | null {
  if (!body) return null;
  if (body.mode === 'amount') {
    const amount = Number(body.amount);
    if (!Number.isInteger(amount) || amount <= 0) return null;
    return { mode: 'amount', amount };
  }
  if (body.mode === 'items' && Array.isArray(body.returnedItems)) {
    const returnedItems: ReturnedItem[] = [];
    for (const r of body.returnedItems) {
      const quantity = Number(r?.quantity);
      if (typeof r?.id !== 'string' || !Number.isInteger(quantity)) return null;
      if (quantity > 0) returnedItems.push({ id: r.id, quantity });
    }
    if (returnedItems.length === 0) return null;
    return { mode: 'items', returnedItems };
  }
  return null;
}

export default withAuth(handler);
