import { Db, ObjectId } from 'mongodb';
import {
  ClientInvoice,
  ClientInvoiceLine,
  ClientInvoiceStatus,
} from '../interfaces';

// What Macaport bills a client for a client-funded benefit. Created from
// the benefit panel, paid and voided from there or from the receivables
// page. Each order carries the invoice it is on, so an order is never billed
// twice and a void releases it.

const COLLECTION = 'clientInvoices';

interface InvoiceDoc extends Omit<ClientInvoice, '_id'> {
  _id: ObjectId;
}

function collection(db: Db) {
  return db.collection<InvoiceDoc>(COLLECTION);
}

function withStringId(doc: InvoiceDoc): ClientInvoice {
  return { ...doc, _id: String(doc._id) };
}

export async function getById(db: Db, id: string) {
  if (!ObjectId.isValid(id)) return null;
  const doc = await collection(db).findOne({ _id: new ObjectId(id) });
  return doc ? withStringId(doc) : null;
}

export async function listByBenefit(db: Db, benefitId: string) {
  const docs = await collection(db)
    .find({ benefitId })
    .sort({ issuedAt: -1, createdAt: -1 })
    .toArray();
  return docs.map(withStringId);
}

export async function listByStatus(
  db: Db,
  status: ClientInvoiceStatus,
  limit = 200
) {
  const docs = await collection(db)
    .find({ status })
    .sort(status === 'open' ? { issuedAt: 1 } : { paidAt: -1 })
    .limit(limit)
    .toArray();
  return docs.map(withStringId);
}

export interface CreateInvoiceInput {
  storeId: string;
  storeName: string;
  benefitId: string;
  benefitName: string;
  number: string;
  issuedAt: string;
  dueAt: string | null;
  note: string;
  lines: ClientInvoiceLine[];
  subtotal: number;
  total: number;
  createdBy: string;
  paid: { paidAt: string; reference: string } | null;
}

export async function create(db: Db, input: CreateInvoiceInput) {
  const now = new Date().toISOString();
  const { paid, ...rest } = input;
  const doc: Omit<InvoiceDoc, '_id'> = {
    ...rest,
    status: paid ? 'paid' : 'open',
    paidAt: paid ? paid.paidAt : null,
    paymentReference: paid ? paid.reference : '',
    paidBy: paid ? input.createdBy : '',
    voidedAt: null,
    voidedBy: '',
    createdAt: now,
    updatedAt: now,
  };
  const inserted = await db
    .collection<Omit<InvoiceDoc, '_id'>>(COLLECTION)
    .insertOne(doc);
  const id = String(inserted.insertedId);

  // Link every order on the invoice in one write.
  await db.collection('stores').updateOne(
    { _id: new ObjectId(input.storeId) },
    { $set: { 'orders.$[o].clientInvoiceId': id } },
    {
      arrayFilters: [{ 'o.orderId': { $in: input.lines.map(l => l.orderId) } }],
    }
  );

  return withStringId({ ...doc, _id: inserted.insertedId });
}

export async function markPaid(
  db: Db,
  id: string,
  paidAt: string,
  reference: string,
  paidBy: string
) {
  const result = await collection(db).findOneAndUpdate(
    { _id: new ObjectId(id), status: 'open' },
    {
      $set: {
        status: 'paid',
        paidAt,
        paymentReference: reference,
        paidBy,
        updatedAt: new Date().toISOString(),
      },
    },
    { returnDocument: 'after' }
  );
  return result.value ? withStringId(result.value) : null;
}

// Marks an order as not to be billed, or clears that. The order keeps its
// benefit link; only the invoicing side ignores it.
export async function setOrderExclusion(
  db: Db,
  storeId: string,
  orderId: string,
  exclusion: { reason: string; by: string; at: string } | null
) {
  const result = await db
    .collection('stores')
    .updateOne(
      { _id: new ObjectId(storeId), 'orders.orderId': orderId },
      { $set: { 'orders.$.clientInvoiceExcluded': exclusion } }
    );
  return result.matchedCount === 1;
}

// Records that a later invoice credited back part of an earlier one's
// drift, per order, so the same drift is never credited twice.
export async function settleDrift(
  db: Db,
  invoiceId: string,
  perOrder: { orderId: string; amount: number }[]
) {
  if (perOrder.length === 0) return;
  const inc: Record<string, number> = {};
  for (const { orderId, amount } of perOrder) {
    inc[`settledDrift.${orderId}`] = amount;
  }
  await collection(db).updateOne(
    { _id: new ObjectId(invoiceId) },
    { $inc: inc, $set: { updatedAt: new Date().toISOString() } }
  );
}

// Keeps the record, releases the orders.
export async function voidInvoice(db: Db, id: string, voidedBy: string) {
  const result = await collection(db).findOneAndUpdate(
    { _id: new ObjectId(id), status: { $ne: 'void' } },
    {
      $set: {
        status: 'void',
        voidedAt: new Date().toISOString(),
        voidedBy,
        updatedAt: new Date().toISOString(),
      },
    },
    { returnDocument: 'after' }
  );
  if (!result.value) return null;
  await db
    .collection('stores')
    .updateOne(
      { _id: new ObjectId(result.value.storeId) },
      { $set: { 'orders.$[o].clientInvoiceId': null } },
      { arrayFilters: [{ 'o.clientInvoiceId': id }] }
    );
  return withStringId(result.value);
}
