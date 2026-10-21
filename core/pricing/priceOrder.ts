// The one place an order is priced.
//
// The cart, the checkout page, and the submit-order route all call this with
// the same inputs and get the same numbers, so the total a customer is shown
// is the total they are charged. Before this existed, five places each
// computed a total and two of them carried a "keep in sync" comment.
//
// Nothing here knows about a store, a product, or a sku. Lines arrive as
// prices and quantities, and every business value (tax rate, shipping,
// Stripe's minimum) is an input, because the next tenant of this code is not
// in Wisconsin. That is what lets this file move to Heddley as a file.
//
// Order of application, fixed here and nowhere else:
//
//   1. line subtotals
//   2. line-level adjustments (a free item)
//   3. cart-level adjustments (a fixed discount)
//   4. sales tax on the result of 3
//   5. shipping, whose free threshold is measured on the result of 3
//   6. credit, against the whole of 3 + 4 + 5
//   7. the sub-minimum waiver
//
// A discount is a price cut and a credit is a payment, and they are treated
// the way a coupon and a gift card are everywhere else. A discount lowers
// the price, so it lowers the tax and the free-shipping measure. A credit
// changes nothing about the price: tax is charged on the full merchandise, a
// $75 credit against an $80 cart still earns free shipping as an $80
// purchase, and the credit then pays for as much of the total as it can,
// tax and shipping included. Whoever funds the credit is invoiced for
// exactly what it paid, with the tax already inside that figure.
//
// Tax on each line of an order is therefore charged exactly once: to the
// customer on what they pay, and to the credit's funder on what the credit
// paid. The dashboard must not add tax on top of credit used.
//
// Every amount is an integer number of cents.

export type Cents = number;

export type ShippingMethod = 'Primary' | 'Direct' | 'Store Pickup';

export interface PriceLine {
  id: string;
  // What one garment costs before anything is printed on it. This is the part
  // a free item covers.
  unitPrice: Cents;
  // Personalization and other add-ons, per unit. Never covered by a free
  // item, which is how the free shirt has always worked.
  addOnUnitPrice?: Cents;
  quantity: number;
  // Lets a free-item benefit say which products qualify.
  productId?: string;
}

// What the pipeline needs to know about a member benefit. The full document
// lives in core/memberBenefits; this is the slice that affects money.
export type BenefitForPricing =
  | {
      type: 'credit';
      label: string;
      // What this member still has, after everything they have already spent.
      remaining: Cents;
    }
  | {
      type: 'discount';
      label: string;
      amount: Cents;
    }
  | {
      type: 'freeItem';
      label: string;
      // How many units this member may still take for free.
      count: number;
      // null means every product in the store qualifies.
      productIds: string[] | null;
    };

export interface ShippingInput {
  method: ShippingMethod;
  price: Cents;
  freeMinimum: Cents;
}

export interface PriceOrderInput {
  lines: PriceLine[];
  benefit?: BenefitForPricing | null;
  // 0.055 for Wisconsin. A tax-exempt store later is this set to 0.
  taxRate: number;
  shipping: ShippingInput;
  // Stripe refuses a charge below this. Defaults to its $0.50 floor.
  minimumCharge?: Cents;
}

export type AdjustmentKind = 'freeItem' | 'discount' | 'credit' | 'waived';

// One thing that changed the price, in the order it was applied. Stored on
// the order as a list so that the receipt, the confirmation page, and the
// dashboard render whatever happened without knowing what kinds exist.
export interface Adjustment {
  kind: AdjustmentKind;
  label: string;
  // Always zero or negative: what it took off.
  amount: Cents;
  // Set when the adjustment belongs to one line rather than the order.
  lineId?: string;
  // Free items only: how many garments on that line this covered. It is what
  // gets drawn down from the member's allowance, since that is counted in
  // shirts rather than cents.
  units?: number;
}

export interface PricedLine extends PriceLine {
  addOnUnitPrice: Cents;
  lineSubtotal: Cents;
  adjustments: Adjustment[];
  lineTotal: Cents;
}

export interface PricedOrder {
  lines: PricedLine[];
  // Everything in the cart at its listed price, before any adjustment. This
  // is the number the customer recognises as "what I bought".
  subtotal: Cents;
  adjustments: Adjustment[];
  // Subtotal after free items and discounts, before credit. Shipping's free
  // threshold is measured on this.
  merchandiseTotal: Cents;
  creditApplied: Cents;
  // What the member has left after this order. Zero unless the benefit is a
  // credit.
  creditRemaining: Cents;
  // What tax was charged on: the merchandise after free items and discounts.
  // A credit does not reduce it.
  taxableAmount: Cents;
  salesTax: Cents;
  shipping: Cents;
  // A total too small for Stripe that Macaport chose to forgive.
  waived: Cents;
  total: Cents;
}

export const STRIPE_MINIMUM_CHARGE: Cents = 50;

export function priceOrder(input: PriceOrderInput): PricedOrder {
  const minimumCharge = input.minimumCharge ?? STRIPE_MINIMUM_CHARGE;
  assertRate(input.taxRate);
  assertCents(minimumCharge, 'minimumCharge');
  assertCents(input.shipping.price, 'shipping.price');
  assertCents(input.shipping.freeMinimum, 'shipping.freeMinimum');

  // 1. line subtotals
  const lines: PricedLine[] = input.lines.map(line => {
    const addOnUnitPrice = line.addOnUnitPrice ?? 0;
    assertCents(line.unitPrice, `line ${line.id} unitPrice`);
    assertCents(addOnUnitPrice, `line ${line.id} addOnUnitPrice`);
    assertQuantity(line.quantity, line.id);

    const lineSubtotal = (line.unitPrice + addOnUnitPrice) * line.quantity;
    return {
      ...line,
      addOnUnitPrice,
      lineSubtotal,
      adjustments: [],
      lineTotal: lineSubtotal,
    };
  });

  const subtotal = lines.reduce((sum, line) => sum + line.lineSubtotal, 0);
  const adjustments: Adjustment[] = [];
  const benefit = input.benefit ?? null;

  // 2. line-level adjustments
  if (benefit && benefit.type === 'freeItem') {
    for (const adjustment of freeItemAdjustments(lines, benefit)) {
      const line = lines.find(l => l.id === adjustment.lineId);
      if (line) {
        line.adjustments.push(adjustment);
        line.lineTotal += adjustment.amount;
      }
      adjustments.push(adjustment);
    }
  }

  const afterLineAdjustments = lines.reduce(
    (sum, line) => sum + line.lineTotal,
    0
  );

  // 3. cart-level adjustments
  let merchandiseTotal = afterLineAdjustments;
  if (benefit && benefit.type === 'discount') {
    assertCents(benefit.amount, 'discount amount');
    const amount = Math.min(benefit.amount, merchandiseTotal);
    if (amount > 0) {
      adjustments.push({
        kind: 'discount',
        label: benefit.label,
        amount: -amount,
      });
      merchandiseTotal -= amount;
    }
  }

  // 4. tax on the price, which a credit does not change
  const taxableAmount = merchandiseTotal;
  const salesTax = Math.round(taxableAmount * input.taxRate);

  // 5. shipping, measured on what they bought rather than how they paid
  const shipping =
    lines.length === 0 ? 0 : shippingCost(input.shipping, merchandiseTotal);

  // 6. credit, paying for as much of the whole order as it can
  const beforeCredit = merchandiseTotal + salesTax + shipping;
  let creditApplied = 0;
  let creditRemaining = 0;
  if (benefit && benefit.type === 'credit') {
    assertCents(benefit.remaining, 'credit remaining');
    creditApplied = Math.min(benefit.remaining, beforeCredit);
    creditRemaining = benefit.remaining - creditApplied;
    if (creditApplied > 0) {
      adjustments.push({
        kind: 'credit',
        label: benefit.label,
        amount: -creditApplied,
      });
    }
  }

  // 7. a total Stripe would refuse is forgiven rather than topped up
  let total = beforeCredit - creditApplied;
  let waived = 0;
  if (total > 0 && total < minimumCharge) {
    waived = total;
    adjustments.push({
      kind: 'waived',
      label: 'Small balance waived',
      amount: -waived,
    });
    total = 0;
  }

  return {
    lines,
    subtotal,
    adjustments,
    merchandiseTotal,
    creditApplied,
    creditRemaining,
    taxableAmount,
    salesTax,
    shipping,
    waived,
    total,
  };
}

// The cheapest qualifying units are the free ones, ties broken by cart
// order. That is what every buy-one-get-one on the internet does, it does not
// depend on the order things were added, and it stops a 2XL hoodie being
// added just to take the free slot from whoever is paying for it. Add-ons
// stay charged: the shirt is free, the name on the back is not.
function freeItemAdjustments(
  lines: PricedLine[],
  benefit: Extract<BenefitForPricing, { type: 'freeItem' }>
): Adjustment[] {
  if (!Number.isInteger(benefit.count) || benefit.count <= 0) return [];

  const qualifies = (line: PricedLine) =>
    line.unitPrice > 0 &&
    (benefit.productIds === null ||
      (!!line.productId && benefit.productIds.indexOf(line.productId) !== -1));

  // One entry per unit, so a line with quantity 3 can have one or all three
  // of its shirts covered.
  const units: { lineId: string; unitPrice: Cents; order: number }[] = [];
  lines.forEach((line, order) => {
    if (!qualifies(line)) return;
    for (let i = 0; i < line.quantity; i++) {
      units.push({ lineId: line.id, unitPrice: line.unitPrice, order });
    }
  });

  units.sort((a, b) => a.unitPrice - b.unitPrice || a.order - b.order);

  const perLine = new Map<string, { amount: Cents; units: number }>();
  units.slice(0, benefit.count).forEach(unit => {
    const sofar = perLine.get(unit.lineId) ?? { amount: 0, units: 0 };
    perLine.set(unit.lineId, {
      amount: sofar.amount + unit.unitPrice,
      units: sofar.units + 1,
    });
  });

  // Emitted in cart order so the list reads the way the cart does.
  return lines
    .filter(line => perLine.has(line.id))
    .map(line => {
      const covered = perLine.get(line.id) as { amount: Cents; units: number };
      return {
        kind: 'freeItem' as const,
        label: benefit.label,
        amount: -covered.amount,
        lineId: line.id,
        units: covered.units,
      };
    });
}

function shippingCost(shipping: ShippingInput, merchandiseTotal: Cents) {
  if (shipping.method !== 'Direct') return 0;
  if (merchandiseTotal >= shipping.freeMinimum) return 0;
  return shipping.price;
}

// Cents are integers. A float here means someone passed dollars, and the
// order would be off by a factor of a hundred somewhere downstream.
function assertCents(value: number, name: string) {
  if (!Number.isInteger(value) || value < 0) {
    throw new Error(`${name} must be a whole number of cents, got ${value}`);
  }
}

function assertQuantity(value: number, lineId: string) {
  if (!Number.isInteger(value) || value <= 0) {
    throw new Error(`line ${lineId} quantity must be a positive integer`);
  }
}

function assertRate(rate: number) {
  if (!(rate >= 0 && rate < 1)) {
    throw new Error(`taxRate must be a fraction between 0 and 1, got ${rate}`);
  }
}
