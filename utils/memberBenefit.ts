// Pure helpers for member benefits and the adjustments they leave on orders.
// Nothing here touches the database, so both the browser and API routes can
// import it. The document shape is the storefront's; see
// core/memberBenefits/types.ts.

import { Adjustment } from '../core/pricing/priceOrder';
import {
  BenefitType,
  MemberBenefit,
  MemberBenefitMember,
} from '../core/memberBenefits/types';
import { memberAllowance } from '../core/memberBenefits/eligibility';
import { ClientInvoice, Order, OrderItem } from '../interfaces';
import { formatToMoney } from './index';

export const SALES_TAX_RATE = 0.055;

export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Copy length caps, shared by the form and the API routes.
export const NAME_MAX = 60;
export const LABEL_MAX = 30;
export const INSTRUCTIONS_MAX = 300;

export function normalizeEmail(email: string) {
  return String(email || '')
    .trim()
    .toLowerCase();
}

// Every renderer of an order's totals reads the adjustments through this,
// so an order written by one of the three old programs shows the same rows
// as a new one. This mirrors the storefront's utils/benefitDisplay.ts. Once
// the migration has run in production the legacy branches are dead.
export function orderAdjustments(order: Order): Adjustment[] {
  if (order.summary.adjustments) return order.summary.adjustments;

  const adjustments: Adjustment[] = [];

  if (order.sheboyganLutheranStaffDiscount) {
    adjustments.push({
      kind: 'credit',
      label: 'Sheboygan Lutheran Staff Credit',
      // Same rule as the storefront and the migration script: the order's
      // own figure only. summary.discount also carries Switch Fitness
      // amounts, so it is not a safe fallback.
      amount: -(order.sheboyganLutheranStaffDiscount.discount || 0),
    });
  }

  if (order.switchFitnessDiscount) {
    adjustments.push({
      kind: 'discount',
      label: 'Switch Fitness Promo',
      amount: -(order.summary.discount || 0),
    });
  }

  if (order.teacherAppreciation) {
    const freeItem = order.items.find(item => item.itemTotal === 0);
    if (freeItem) {
      adjustments.push({
        kind: 'freeItem',
        label: 'Free Staff Appreciation Shirt',
        amount: -freeItem.sku.size.price,
        lineId: freeItem.id,
        units: 1,
      });
    }
  }

  return adjustments;
}

// What the benefit took off this order, as a positive number of cents. The
// waived small balance is Macaport's, not the benefit's, so it is left out.
export function orderBenefitAmount(order: Order) {
  return orderAdjustments(order).reduce(
    (sum, a) => sum + (a.kind === 'waived' ? 0 : -a.amount),
    0
  );
}

// A short tag for an order that used a member benefit, for lists where only
// the total shows: "Credit $63.30", "Discount $25.00", "Free item". Null when
// no benefit applied. Reads through orderAdjustments, so legacy orders tag too.
export function orderBenefitTag(order: Order): string | null {
  const used = orderAdjustments(order).filter(a => a.kind !== 'waived');
  if (used.length === 0) return null;
  const kind = used[0].kind;
  if (kind === 'freeItem') {
    const units = used.reduce((sum, a) => sum + (a.units ?? 1), 0);
    return units === 1 ? 'Free item' : `${units} free items`;
  }
  const amount = used.reduce((sum, a) => sum - a.amount, 0);
  return `${kind === 'credit' ? 'Credit' : 'Discount'} ${formatToMoney(
    amount,
    true
  )}`;
}

export function adjustmentKindLabel(kind: Adjustment['kind']) {
  switch (kind) {
    case 'freeItem':
      return 'Free item';
    case 'discount':
      return 'Discount';
    case 'credit':
      return 'Credit';
    case 'waived':
      return 'Waived';
  }
}

// Per unit. The storefront writes personalizationTotal; for an older order
// it is rebuilt from the addons the way the storefront's cart did.
export function itemPersonalizationTotal(item: OrderItem) {
  if (typeof item.personalizationTotal === 'number') {
    return item.personalizationTotal;
  }
  return (item.personalizationAddons || []).reduce(
    (sum, addon) =>
      sum +
      (addon.price || 0) +
      (addon.subItems || []).reduce((s, sub) => s + (sub.price || 0), 0),
    0
  );
}

// Type helpers *************************************************************

export function benefitTypeLabel(type: BenefitType) {
  switch (type) {
    case 'credit':
      return 'Store credit';
    case 'discount':
      return 'Fixed discount';
    case 'freeItem':
      return 'Free item';
  }
}

// The unit an amount is stored in for a type.
export function benefitUnitLabel(type: BenefitType, count = 2) {
  if (type === 'freeItem') return count === 1 ? 'garment' : 'garments';
  return 'dollars';
}

// "$75.00" or "2 garments".
export function formatBenefitAmount(type: BenefitType, amount: number) {
  if (type === 'freeItem') {
    return `${amount} ${benefitUnitLabel(type, amount)}`;
  }
  return formatToMoney(amount, true);
}

// A dollar amount as a person types it: "75", "75.5", "75.50", "$1,250.00".
// Rejects a trailing point, more than two decimals, zero, negatives and
// anything else. Built from the string rather than a float so 10.20 is
// 1020 cents and never 1019.
export function parseDollars(input: string | number): number | null {
  const raw = String(input ?? '')
    .trim()
    .replace(/^\$/, '');
  // Commas only as thousands separators: "1,250" yes, "10,2" no.
  const match = /^(\d{1,3}(?:,\d{3})*|\d+)(?:\.(\d{1,2}))?$/.exec(raw);
  if (!match) return null;
  const dollars = Number(match[1].replace(/,/g, ''));
  const cents = match[2] ? Number(match[2].padEnd(2, '0')) : 0;
  const total = dollars * 100 + cents;
  return total > 0 ? total : null;
}

// A whole number of garments, at least one.
export function parseCount(input: string | number): number | null {
  const raw = String(input ?? '').trim();
  if (!/^\d+$/.test(raw)) return null;
  const count = Number(raw);
  return count > 0 ? count : null;
}

// Cents for credit and discount, a count for freeItem. null when unusable.
export function parseBenefitAmount(type: BenefitType, input: string | number) {
  return type === 'freeItem' ? parseCount(input) : parseDollars(input);
}

// A credit is a payment at face value: tax is charged on the full price and
// the credit pays it. If Macaport funds that, Macaport pays tax on its own
// giveaway. A Macaport-funded amount off is a discount, which lowers the
// price and the tax, so that is the type it must use.
export const MACAPORT_CREDIT_ERROR =
  'A Macaport-funded balance is a discount, not a credit. Choose the discount type, or set funding to client.';

export function fundingAllowed(type: BenefitType, funding: string) {
  return !(type === 'credit' && funding === 'macaport');
}

export function amountErrorMessage(type: BenefitType) {
  return type === 'freeItem'
    ? 'Enter a whole number of garments, like 1 or 2.'
    : 'Enter a dollar amount like 75 or 74.99.';
}

// What to show in the input for a stored amount: "75" or "74.99".
export function amountToInput(type: BenefitType, amount: number) {
  if (type === 'freeItem') return String(amount);
  return amount % 100 === 0 ? String(amount / 100) : (amount / 100).toFixed(2);
}

// The form's view of a benefit. Shared by the edit modal and by the panel's
// inline logo actions, which save through the same update route.
export function benefitFormValues(benefit: MemberBenefit) {
  return {
    type: benefit.type,
    amount: amountToInput(benefit.type, benefit.amount),
    benefitName: benefit.copy.benefitName,
    memberLabel: benefit.copy.memberLabel,
    instructions: benefit.copy.instructions ?? '',
    logo: benefit.copy.logo ?? '',
    access: benefit.access,
    funding: benefit.funding,
    allProducts:
      benefit.productIds === null || benefit.productIds === undefined,
    productIds: benefit.productIds ?? [],
    members: [] as { email: string; firstName?: string; lastName?: string }[],
  };
}

export function memberUsage(
  benefit: MemberBenefit,
  member: MemberBenefitMember
) {
  const allowance = memberAllowance(benefit, member);
  const used = member.used ?? 0;
  return { allowance, used, remaining: Math.max(0, allowance - used) };
}

export function memberDisplayName(member: {
  email: string;
  firstName?: string;
  lastName?: string;
}) {
  const name = [member.firstName, member.lastName].filter(Boolean).join(' ');
  return name || member.email;
}

// Member list parsing ******************************************************

export interface ParsedMemberRow {
  line: number;
  email: string;
  firstName: string;
  lastName: string;
}

export type RejectedReason = 'invalid' | 'duplicate' | 'existing';

export interface RejectedMemberRow extends ParsedMemberRow {
  reason: RejectedReason;
  raw: string;
}

export interface MemberInput {
  email: string;
  firstName?: string;
  lastName?: string;
}

function splitCsvLine(line: string) {
  const cells: string[] = [];
  let current = '';
  let quoted = false;
  for (const ch of line) {
    if (ch === '"') quoted = !quoted;
    else if (ch === ',' && !quoted) {
      cells.push(current);
      current = '';
    } else current += ch;
  }
  cells.push(current);
  return cells.map(c => c.trim());
}

// Accepts either a CSV with a header row (email, and optionally firstName and
// lastName, matched the way scripts/create-member-benefit.js matches them)
// or a bare list of emails separated by commas, spaces, semicolons or
// newlines. Rows are returned as typed, unvalidated; see reviewMembers.
export function parseMemberText(text: string): ParsedMemberRow[] {
  const lines = text.split(/\r?\n/).filter(line => line.trim() !== '');
  if (lines.length === 0) return [];

  const header = splitCsvLine(lines[0]).map(h =>
    h.toLowerCase().replace(/[^a-z]/g, '')
  );
  const col = (name: string) => header.indexOf(name);
  const emailCol = col('email') !== -1 ? col('email') : col('emailaddress');

  if (emailCol !== -1) {
    const firstCol = col('firstname') !== -1 ? col('firstname') : col('first');
    const lastCol = col('lastname') !== -1 ? col('lastname') : col('last');
    return lines.slice(1).map((line, i) => {
      const cells = splitCsvLine(line);
      return {
        line: i + 2,
        email: normalizeEmail(cells[emailCol] || ''),
        firstName: firstCol !== -1 ? cells[firstCol] || '' : '',
        lastName: lastCol !== -1 ? cells[lastCol] || '' : '',
      };
    });
  }

  // No header: find every email in the text, however it is wrapped. A line
  // like "Jane Doe <jane@acme.com>" or "Doe, Jane jane@acme.com" keeps the
  // words around the address as the name; a bare address keeps nothing.
  const rows: ParsedMemberRow[] = [];
  lines.forEach((line, i) => {
    const pattern = /[^\s<>,;"']+@[^\s<>,;"']+\.[^\s<>,;"'()]+/g;
    const found = line.match(pattern) ?? [];
    if (found.length === 0) {
      // Keep the line so the review can report it as invalid.
      const token = line.trim();
      if (token) {
        rows.push({
          line: i + 1,
          email: normalizeEmail(token),
          firstName: '',
          lastName: '',
        });
      }
      return;
    }
    const nameWords =
      found.length === 1
        ? line
            .replace(found[0], ' ')
            .replace(/[<>"'()]/g, ' ')
            .split(/[\s,;]+/)
            .map(w => w.trim())
            .filter(w => w && !w.includes('@'))
        : [];
    const [firstName = '', lastName = ''] =
      nameWords.length >= 2
        ? [nameWords[0], nameWords.slice(1).join(' ')]
        : nameWords.length === 1
        ? [nameWords[0], '']
        : ['', ''];
    found.forEach(email => {
      rows.push({
        line: i + 1,
        email: normalizeEmail(email.replace(/^mailto:/i, '')),
        firstName: found.length === 1 ? firstName : '',
        lastName: found.length === 1 ? lastName : '',
      });
    });
  });
  return rows;
}

// Normalizes, validates and deduplicates. Rows are rejected for a bad email,
// for repeating an earlier row, or for already being a member; each is
// reported with its reason so the admin can see what will not be saved.
export function reviewMembers(
  rows: ParsedMemberRow[],
  existingEmails: string[]
): { members: MemberInput[]; rejected: RejectedMemberRow[] } {
  const existing = new Set(existingEmails.map(normalizeEmail));
  const seen = new Set<string>();
  const members: MemberInput[] = [];
  const rejected: RejectedMemberRow[] = [];

  for (const row of rows) {
    const email = normalizeEmail(row.email);
    const raw = [row.email, row.firstName, row.lastName]
      .filter(Boolean)
      .join(', ');
    if (!EMAIL_REGEX.test(email)) {
      rejected.push({ ...row, email, raw, reason: 'invalid' });
      continue;
    }
    if (seen.has(email)) {
      rejected.push({ ...row, email, raw, reason: 'duplicate' });
      continue;
    }
    if (existing.has(email)) {
      rejected.push({ ...row, email, raw, reason: 'existing' });
      continue;
    }
    seen.add(email);
    const member: MemberInput = { email };
    if (row.firstName) member.firstName = row.firstName.trim();
    if (row.lastName) member.lastName = row.lastName.trim();
    members.push(member);
  }

  return { members, rejected };
}

export function rejectedReasonLabel(reason: RejectedReason) {
  switch (reason) {
    case 'invalid':
      return 'Invalid email';
    case 'duplicate':
      return 'Duplicate in list';
    case 'existing':
      return 'Already a member';
  }
}

// Usage report *************************************************************

export interface BenefitUsageReport {
  memberCount: number;
  membersWithUsage: number;
  // In the benefit's unit.
  totalUsed: number;
  totalAllowance: number;
  linkedOrders: Order[];
}

export function buildUsageReport(
  benefit: MemberBenefit,
  orders: Order[]
): BenefitUsageReport {
  const linkedOrders = orders.filter(
    o => o.benefit && o.benefit.benefitId === benefit._id
  );

  let totalUsed = 0;
  let totalAllowance = 0;
  let membersWithUsage = 0;
  for (const member of benefit.members) {
    const usage = memberUsage(benefit, member);
    totalUsed += usage.used;
    totalAllowance += usage.allowance;
    if (usage.used > 0) membersWithUsage += 1;
  }

  return {
    memberCount: benefit.members.length,
    membersWithUsage,
    totalUsed,
    totalAllowance,
    linkedOrders,
  };
}

// Client invoicing ***********************************************************

// Cents the benefit covered on an order, net of credit a refund restored.
// Garments are not money, so a free-item refund does not reduce this; the
// freeItem adjustment amount already is the money.
export function orderNetBenefitAmount(order: Order) {
  const restored =
    order.benefit?.type === 'freeItem' ? 0 : order.refund?.creditRestored ?? 0;
  return Math.max(0, orderBenefitAmount(order) - restored);
}

export type InvoiceState =
  | 'canceled'
  | 'invoiced'
  | 'excluded'
  | 'awaiting'
  | 'grace'
  | 'eligible';

export const DEFAULT_INVOICE_GRACE_DAYS = 14;

const DAY_MS = 24 * 60 * 60 * 1000;

// When the order finished shipping: the latest Shipped timestamp across its
// items. Null until every unCanceled item has shipped.
export function orderShippedAt(order: Order): string | null {
  if (order.orderStatus !== 'Shipped') return null;
  let latest: string | null = null;
  for (const item of order.items) {
    const at = item.status?.meta?.Shipped?.updatedAt;
    if (at && (!latest || at > latest)) latest = at;
  }
  return latest ?? order.updatedAt ?? null;
}

// The day the return window closes and the order can be billed.
export function orderInvoiceableAt(order: Order, graceDays: number) {
  const shippedAt = orderShippedAt(order);
  if (!shippedAt) return null;
  return new Date(new Date(shippedAt).getTime() + graceDays * DAY_MS);
}

// Whether an order can go on the next invoice. Shipped means Macaport has
// delivered what the client is paying for and a cancellation can no longer
// happen. A return still can, so the order waits out the grace period, and
// invoices freeze their amounts for anything that comes back after that.
export function orderInvoiceState(
  order: Order,
  graceDays = DEFAULT_INVOICE_GRACE_DAYS,
  now = Date.now()
): InvoiceState {
  if (order.orderStatus === 'Canceled') return 'canceled';
  if (order.clientInvoiceId) return 'invoiced';
  if (order.clientInvoiceExcluded) return 'excluded';
  if (order.orderStatus !== 'Shipped') return 'awaiting';
  if (orderNetBenefitAmount(order) <= 0) return 'canceled';
  const at = orderInvoiceableAt(order, graceDays);
  if (at && at.getTime() > now) return 'grace';
  return 'eligible';
}

export function splitOrdersForInvoicing(
  benefit: Pick<MemberBenefit, '_id'>,
  orders: Order[],
  graceDays = DEFAULT_INVOICE_GRACE_DAYS,
  now = Date.now()
) {
  const linked = orders.filter(
    o => o.benefit && o.benefit.benefitId === benefit._id
  );
  const out = {
    eligible: [] as Order[],
    grace: [] as Order[],
    awaiting: [] as Order[],
    excluded: [] as Order[],
    invoiced: [] as Order[],
    canceled: [] as Order[],
  };
  for (const order of linked) {
    out[orderInvoiceState(order, graceDays, now)].push(order);
  }
  const byDate = (a: Order, b: Order) =>
    a.createdAt < b.createdAt ? -1 : a.createdAt > b.createdAt ? 1 : 0;
  out.eligible.sort(byDate);
  out.grace.sort(byDate);
  out.awaiting.sort(byDate);
  out.excluded.sort(byDate);
  return out;
}

// Drift still owed on an issued invoice, per order: what the order's net
// amount is now, less what was billed, less what a later invoice already
// credited. Negative means the client is owed money back.
export function invoiceUnsettledDrift(invoice: ClientInvoice, orders: Order[]) {
  const out: { orderId: string; customer: string; amount: number }[] = [];
  for (const line of invoice.lines) {
    if (line.kind === 'adjustment') continue;
    const order = orders.find(o => o.orderId === line.orderId);
    if (!order) continue;
    const settled = invoice.settledDrift?.[line.orderId] ?? 0;
    const drift = orderNetBenefitAmount(order) - line.amount - settled;
    if (drift !== 0) {
      out.push({
        orderId: line.orderId,
        customer: line.customer,
        amount: drift,
      });
    }
  }
  return out;
}

// Face value: the client is billed exactly what the credit paid. The tax on
// those goods was charged to the customer and the credit paid it, so adding
// tax here would charge it twice.
export function invoiceTotals(amounts: number[]) {
  const subtotal = amounts.reduce((sum, a) => sum + a, 0);
  return { subtotal, total: subtotal };
}

// yyyy-MM (local) for the month filter.
export function orderMonth(order: Order) {
  return order.createdAt.slice(0, 7);
}

export function todayInputDate() {
  const now = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(
    now.getDate()
  )}`;
}

export function isOverdue(invoice: ClientInvoice, today = todayInputDate()) {
  return invoice.status === 'open' && !!invoice.dueAt && invoice.dueAt < today;
}

// Total drift on an invoice not yet credited back, for the row's marker.
export function invoiceDrift(invoice: ClientInvoice, orders: Order[]) {
  return invoiceUnsettledDrift(invoice, orders).reduce(
    (sum, d) => sum + d.amount,
    0
  );
}

export function downloadCsv(filename: string, rows: string[][]) {
  const escape = (value: string) =>
    /[",\n]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value;
  const csv = rows.map(row => row.map(escape).join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
