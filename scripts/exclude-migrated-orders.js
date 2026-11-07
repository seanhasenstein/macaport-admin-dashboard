/*
 * One-time, after the storefront's member-benefits migration: marks the
 * orders it rewrote as excluded from client invoicing, because they were
 * billed before the dashboard tracked benefits. Without this, every shipped
 * past order shows as "Ready to invoice" on the benefit's Invoicing tab.
 *
 * Only orders that used the store's benefit, are not already invoiced or
 * excluded, and were placed before the cutoff are touched. Any one of them
 * can be put back on invoicing from the dashboard afterwards.
 *
 * Dry run by default; --apply writes. DATABASE_URL must be given on the
 * command line (it does not read .env.local), and must name the database.
 *
 *   DATABASE_URL='<connection string>' node scripts/exclude-migrated-orders.js
 *   DATABASE_URL='<connection string>' node scripts/exclude-migrated-orders.js --apply
 *
 * Options:
 *   --stores=<id>,<id>   stores to process (default: the two migrated stores)
 *   --before=<ISO date>  only orders placed before this (default: now)
 */
const { MongoClient, ObjectId } = require('mongodb');

const DEFAULT_STORES = [
  '6638dbdb1ea56000083010a4', // 2026 Staff Appreciation
  '64ee1e2a3eb408000962ac26', // Switch Fitness
];
const REASON = 'Before member benefits, billed outside the dashboard';
const BY = 'Member benefits migration';

const APPLY = process.argv.includes('--apply');
const arg = name => {
  const hit = process.argv.find(a => a.startsWith(`--${name}=`));
  return hit ? hit.slice(name.length + 3) : undefined;
};

const money = cents => `$${(cents / 100).toFixed(2)}`;

// What the benefit covered on the order, net of credit given back, in
// cents. Matches orderNetBenefitAmount in utils/memberBenefit.ts.
function netBenefitCents(order) {
  const covered = ((order.summary && order.summary.adjustments) || [])
    .filter(a => a.kind !== 'waived')
    .reduce((sum, a) => sum - (a.amount || 0), 0);
  const restored =
    order.benefit && order.benefit.type === 'freeItem'
      ? 0
      : (order.refund && order.refund.creditRestored) || 0;
  return Math.max(0, covered - restored);
}

async function main() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error('Set DATABASE_URL on the command line.');
  const storeIds = (arg('stores') || DEFAULT_STORES.join(','))
    .split(',')
    .map(s => s.trim())
    .filter(Boolean);
  const before = arg('before') || new Date().toISOString();
  if (Number.isNaN(Date.parse(before))) {
    throw new Error(`--before is not a date: ${before}`);
  }

  const client = new MongoClient(url);
  await client.connect();
  const db = client.db();
  const host = url.replace(/^.*@/, '').replace(/[/?].*$/, '');
  console.log(`${APPLY ? 'APPLYING' : 'DRY RUN (pass --apply to write)'}`);
  console.log(`Database "${db.databaseName}" on ${host}`);
  console.log(`Orders placed before ${before}`);

  let total = 0;
  for (const id of storeIds) {
    if (!ObjectId.isValid(id)) {
      console.log(`- ${id}: not a valid store id, skipping`);
      continue;
    }
    const store = await db
      .collection('stores')
      .findOne(
        { _id: new ObjectId(id) },
        { projection: { name: 1, benefitId: 1, orders: 1 } }
      );
    if (!store) {
      console.log(`- ${id}: no such store, skipping`);
      continue;
    }
    if (!store.benefitId) {
      console.log(
        `- ${store.name} (${id}): no benefit yet. Run the storefront migration with --apply first. Skipping.`
      );
      continue;
    }
    const matches = (store.orders || []).filter(
      o =>
        o.benefit &&
        o.benefit.benefitId === store.benefitId &&
        !o.clientInvoiceId &&
        !o.clientInvoiceExcluded &&
        o.createdAt < before
    );
    const statuses = {};
    for (const o of matches) {
      statuses[o.orderStatus] = (statuses[o.orderStatus] || 0) + 1;
    }
    const cents = matches.reduce((sum, o) => sum + netBenefitCents(o), 0);
    console.log(
      `- ${store.name} (${id}): ${matches.length} order(s) to exclude, ${money(
        cents
      )} of benefit, by status ${JSON.stringify(statuses)}`
    );
    total += matches.length;
    if (!APPLY || matches.length === 0) continue;

    const result = await db.collection('stores').updateOne(
      { _id: store._id },
      {
        $set: {
          'orders.$[o].clientInvoiceExcluded': {
            reason: REASON,
            by: BY,
            at: new Date().toISOString(),
          },
        },
      },
      {
        arrayFilters: [
          {
            'o.benefit.benefitId': store.benefitId,
            'o.clientInvoiceId': null,
            'o.clientInvoiceExcluded': null,
            'o.createdAt': { $lt: before },
          },
        ],
      }
    );
    console.log(`    updated: ${result.modifiedCount === 1 ? 'yes' : 'no'}`);
  }
  console.log(`${total} order(s) ${APPLY ? 'excluded' : 'would be excluded'}`);
  await client.close();
}

main().catch(error => {
  console.error(error.message || error);
  process.exit(1);
});
