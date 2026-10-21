// The credit side of a refund, computed the same way in the browser (for
// the preview) and in the API route (before anything is written), so a
// stale tab cannot record a split the server did not agree with.
//
// Macaport refunds the card in Stripe by hand; nothing here calls Stripe.
// What this decides is how much of a return comes back off the card and how
// much goes back onto the member's allowance, by re-pricing what the
// customer kept with the balance they had before the order. Repeat refunds
// on one order work by accumulating the returned items and reporting the
// difference from what was recorded last time.

import {
  BenefitForPricing,
  PriceLine,
  priceOrder,
} from '../core/pricing/priceOrder';
import { BenefitType, MemberBenefit } from '../core/memberBenefits/types';
import { Order, ReturnedItem, ShippingData } from '../interfaces';
import {
  itemPersonalizationTotal,
  orderAdjustments,
  SALES_TAX_RATE,
} from './memberBenefit';

export type RefundInput =
  | { mode: 'items'; returnedItems: ReturnedItem[] }
  | { mode: 'amount'; amount: number };

// What the admin decided on top of the computed split.
export interface RefundChoices {
  // Give the member back the credit the re-pricing frees up. Off when the
  // member has left or the program has ended.
  restoreCredit: boolean;
  // Order item ids whose returned quantity goes back into inventory.
  restock: string[];
}

// The split with the admin's choices applied: declining the credit keeps
// the member's usage as it was, and the record says so.
export function applyChoices(split: RefundSplit, choices: RefundChoices) {
  if (choices.restoreCredit) return split;
  return {
    ...split,
    creditRestored: 0,
    cumulativeRestored: split.cumulativeRestored - split.creditRestored,
  };
}

export interface RefundContext {
  order: Order;
  // The benefit the order drew on, if it still exists. Only a free item
  // needs it (for which products qualify); the rest comes from the order.
  benefit: Pick<MemberBenefit, 'productIds' | 'copy'> | null;
  shipping: Pick<ShippingData, 'price' | 'freeMinimum'>;
}

export interface RefundSplit {
  // This refund, on top of whatever was recorded before.
  card: number;
  creditRestored: number;
  // Everything after this refund, which is what gets recorded.
  cumulativeCard: number;
  cumulativeRestored: number;
  cumulativeReturned: ReturnedItem[];
  // What the customer will have been charged once the card refund is made.
  repricedTotal: number;
  full: boolean;
  // What the card originally paid and what the benefit originally covered.
  cardPaid: number;
  benefitType: BenefitType | null;
  benefitLabel: string;
  originalUsed: number;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

export function benefitLabelFor(ctx: RefundContext) {
  const fromOrder = orderAdjustments(ctx.order).find(a => a.kind !== 'waived');
  return fromOrder?.label || ctx.benefit?.copy.benefitName || 'Member benefit';
}

// The balance the member had walking into this order, in the benefit's
// unit. Re-pricing with it reproduces what the storefront did.
function benefitForPricing(ctx: RefundContext): BenefitForPricing | null {
  const link = ctx.order.benefit;
  if (!link) return null;
  const balance = (link.used ?? 0) + (link.remainingAfter ?? 0);
  const label = benefitLabelFor(ctx);

  switch (link.type) {
    case 'credit':
      return { type: 'credit', label, remaining: balance };
    case 'discount':
      return { type: 'discount', label, amount: balance };
    case 'freeItem':
      return {
        type: 'freeItem',
        label,
        count: balance,
        productIds: ctx.benefit?.productIds ?? null,
      };
    default:
      return null;
  }
}

export function mergeReturnedItems(
  order: Order,
  previous: ReturnedItem[],
  next: ReturnedItem[]
): ReturnedItem[] {
  const totals = new Map<string, number>();
  for (const r of [...previous, ...next]) {
    totals.set(r.id, (totals.get(r.id) ?? 0) + r.quantity);
  }
  return order.items
    .filter(item => (totals.get(item.id) ?? 0) > 0)
    .map(item => ({
      id: item.id,
      quantity: Math.min(item.quantity, totals.get(item.id) ?? 0),
    }));
}

// How much of the allowance the re-priced order draws down. Mirrors the
// storefront's usageFor(): credit is the cents applied, a free item is the
// garments covered, a discount is all-or-nothing.
function usageFrom(
  type: BenefitType,
  balance: number,
  priced: ReturnType<typeof priceOrder>
) {
  switch (type) {
    case 'credit':
      return priced.creditApplied;
    case 'freeItem':
      return priced.adjustments.reduce(
        (sum, a) => sum + (a.kind === 'freeItem' ? a.units ?? 0 : 0),
        0
      );
    case 'discount':
      return priced.adjustments.some(a => a.kind === 'discount') ? balance : 0;
  }
}

export function computeRefund(
  ctx: RefundContext,
  input: RefundInput
): RefundSplit {
  const { order } = ctx;
  const cardPaid = order.summary.total;
  const alreadyCard = order.refund?.card ?? 0;
  const alreadyRestored = order.refund?.creditRestored ?? 0;
  const previousReturned = order.refund?.returnedItems ?? [];
  const benefitType = order.benefit?.type ?? null;
  const originalUsed = order.benefit?.used ?? 0;
  const benefitLabel = benefitLabelFor(ctx);

  if (input.mode === 'amount') {
    const amount = Math.max(0, Math.round(input.amount));
    const card = clamp(amount, 0, Math.max(0, cardPaid - alreadyCard));
    const rest = amount - card;
    // Only a credit can be partly restored in cents; a garment or a
    // one-shot discount cannot be split by an amount.
    const creditRestored =
      benefitType === 'credit'
        ? clamp(rest, 0, Math.max(0, originalUsed - alreadyRestored))
        : 0;
    return {
      card,
      creditRestored,
      cumulativeCard: alreadyCard + card,
      cumulativeRestored: alreadyRestored + creditRestored,
      cumulativeReturned: previousReturned,
      repricedTotal: cardPaid - alreadyCard - card,
      full: false,
      cardPaid,
      benefitType,
      benefitLabel,
      originalUsed,
    };
  }

  const cumulativeReturned = mergeReturnedItems(
    order,
    previousReturned,
    input.returnedItems
  );
  const returned = new Map(cumulativeReturned.map(r => [r.id, r.quantity]));

  const kept: PriceLine[] = order.items
    .map(item => {
      const addOn = itemPersonalizationTotal(item);
      return {
        id: item.id,
        unitPrice: Math.max(0, item.price - addOn),
        addOnUnitPrice: addOn,
        quantity: item.quantity - (returned.get(item.id) ?? 0),
        productId: item.sku.storeProductId,
      };
    })
    .filter(line => line.quantity > 0);

  const benefit = benefitForPricing(ctx);
  const balance = order.benefit
    ? (order.benefit.used ?? 0) + (order.benefit.remainingAfter ?? 0)
    : 0;

  const priced = priceOrder({
    lines: kept,
    benefit,
    taxRate: SALES_TAX_RATE,
    shipping: {
      method:
        order.shippingMethod === 'None' ? 'Store Pickup' : order.shippingMethod,
      price: ctx.shipping.price,
      freeMinimum: ctx.shipping.freeMinimum,
    },
  });

  const repricedUsage = benefitType
    ? usageFrom(benefitType, balance, priced)
    : 0;

  const cumulativeCard = clamp(cardPaid - priced.total, 0, cardPaid);
  const cumulativeRestored = clamp(
    originalUsed - repricedUsage,
    0,
    originalUsed
  );

  return {
    card: Math.max(0, cumulativeCard - alreadyCard),
    creditRestored: Math.max(0, cumulativeRestored - alreadyRestored),
    cumulativeCard,
    cumulativeRestored,
    cumulativeReturned,
    repricedTotal: priced.total,
    full: kept.length === 0,
    cardPaid,
    benefitType,
    benefitLabel,
    originalUsed,
  };
}

function money(cents: number) {
  return `$${(cents / 100).toFixed(2)}`;
}

export function restoredPhrase(type: BenefitType | null, amount: number) {
  if (type === 'freeItem') {
    return `${amount} free ${amount === 1 ? 'item' : 'items'}`;
  }
  return money(amount);
}

// "Refund $X to the card in Stripe. Restore $Y to Jane's Employee Credit."
export function adminRefundSentence(split: RefundSplit, memberName: string) {
  const parts: string[] = [];
  if (split.card > 0) {
    parts.push(`Refund ${money(split.card)} to the card in Stripe.`);
  }
  if (split.creditRestored > 0) {
    const owner = memberName.endsWith('s')
      ? `${memberName}'`
      : `${memberName}'s`;
    parts.push(
      `Restore ${restoredPhrase(
        split.benefitType,
        split.creditRestored
      )} to ${owner} ${split.benefitLabel}.`
    );
  }
  if (parts.length === 0) return 'Nothing to refund.';
  return parts.join(' ');
}

// The same numbers, addressed to the customer.
export function customerRefundSentence(split: RefundSplit) {
  const parts: string[] = [];
  if (split.card > 0) {
    parts.push(`We have refunded ${money(split.card)} to your card.`);
  }
  if (split.creditRestored > 0) {
    parts.push(
      `${restoredPhrase(split.benefitType, split.creditRestored)} ${
        split.benefitType === 'freeItem' && split.creditRestored !== 1
          ? 'have'
          : 'has'
      } been restored to your ${split.benefitLabel}.`
    );
  }
  return parts.join(' ');
}
