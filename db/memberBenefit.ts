import {
  CreateIndexesOptions,
  Db,
  IndexSpecification,
  ObjectId,
} from 'mongodb';
import {
  BenefitAccess,
  BenefitFunding,
  BenefitType,
  MemberBenefit,
  MemberBenefitCopy,
  MemberBenefitMember,
} from '../core/memberBenefits/types';
import { MemberInput, normalizeEmail } from '../utils/memberBenefit';

// The dashboard is the only thing that creates or edits a benefit. The
// storefront reads them and writes members[].used through its own atomic
// reservation. Two rules from the contract are enforced here: `used` only
// ever moves through restoreUsed(), with a filter that cannot take it below
// zero, and the store pointer and benefit.storeId are set and cleared
// together.

const COLLECTION = 'memberBenefits';

interface BenefitDoc extends Omit<MemberBenefit, '_id'> {
  _id: ObjectId;
}

function collection(db: Db) {
  return db.collection<BenefitDoc>(COLLECTION);
}

function withStringId(
  doc: BenefitDoc | (Omit<BenefitDoc, '_id'> & { _id: ObjectId })
): MemberBenefit {
  return { ...doc, _id: String(doc._id) };
}

export async function getById(db: Db, id: string) {
  if (!ObjectId.isValid(id)) return null;
  const doc = await collection(db).findOne({ _id: new ObjectId(id) });
  return doc ? withStringId(doc) : null;
}

export async function getByStoreId(db: Db, storeId: string) {
  const doc = await collection(db).findOne({ storeId });
  return doc ? withStringId(doc) : null;
}

export interface CreateBenefitInput {
  type: BenefitType;
  amount: number;
  productIds: string[] | null;
  access: BenefitAccess;
  funding: BenefitFunding;
  copy: MemberBenefitCopy;
  members: MemberInput[];
}

export function toMember(input: MemberInput): MemberBenefitMember {
  const member: MemberBenefitMember = {
    email: normalizeEmail(input.email),
    used: 0,
    orderIds: [],
  };
  if (input.firstName) member.firstName = input.firstName;
  if (input.lastName) member.lastName = input.lastName;
  return member;
}

export async function create(
  db: Db,
  storeId: string,
  input: CreateBenefitInput
) {
  const store = await db
    .collection('stores')
    .findOne({ _id: new ObjectId(storeId) }, { projection: { benefitId: 1 } });
  if (!store) throw new Error('Invalid store ID provided.');
  if (store.benefitId) {
    throw new Error('This store already has a member benefit.');
  }

  const now = new Date().toISOString();
  const doc = {
    storeId,
    type: input.type,
    amount: input.amount,
    productIds: input.type === 'freeItem' ? input.productIds : null,
    access: input.access,
    funding: input.funding,
    copy: input.copy,
    active: true,
    members: input.members.map(toMember),
    createdAt: now,
    updatedAt: now,
  };

  const inserted = await db
    .collection<Omit<BenefitDoc, '_id'>>(COLLECTION)
    .insertOne(doc);
  const benefitId = String(inserted.insertedId);
  await db
    .collection('stores')
    .updateOne({ _id: store._id }, { $set: { benefitId, updatedAt: now } });

  await ensureCodeIndexes(db);

  return withStringId({ ...doc, _id: inserted.insertedId });
}

// The storefront's one-time sign-in codes need two indexes on its
// memberBenefitCodes collection: a TTL index so expired codes are swept,
// and a unique index so two requests racing for the same email cannot
// leave two codes. They used to be created only by the storefront's
// scripts, so a database whose benefits came from the dashboard never got
// them. This is the one place the dashboard touches that collection, and
// it only provisions indexes; it never reads or writes a code.
//
// createIndex is a no-op when the index already exists. If one exists with
// the wrong options Mongo refuses, and this logs it rather than dropping an
// index from a web request; the storefront's
// scripts/check-member-benefit-indexes.js --apply repairs it.
const CODE_INDEXES: {
  spec: IndexSpecification;
  options: CreateIndexesOptions & { name: string };
}[] = [
  {
    spec: { expires: 1 },
    options: { name: 'expires_1', expireAfterSeconds: 0 },
  },
  {
    spec: { benefitId: 1, email: 1 },
    options: { name: 'benefitId_1_email_1', unique: true },
  },
];

export async function ensureCodeIndexes(db: Db) {
  for (const { spec, options } of CODE_INDEXES) {
    try {
      await db.collection('memberBenefitCodes').createIndex(spec, options);
    } catch (error) {
      console.warn(
        `memberBenefitCodes index ${options.name} could not be ensured; run the storefront's scripts/check-member-benefit-indexes.js --apply.`,
        error instanceof Error ? error.message : error
      );
    }
  }
}

export interface UpdateBenefitInput {
  amount?: number;
  productIds?: string[] | null;
  access?: BenefitAccess;
  funding?: BenefitFunding;
  copy?: MemberBenefitCopy;
}

export async function update(
  db: Db,
  id: string,
  updates: UpdateBenefitInput & { active?: boolean }
) {
  const result = await collection(db).findOneAndUpdate(
    { _id: new ObjectId(id) },
    { $set: { ...updates, updatedAt: new Date().toISOString() } },
    { returnDocument: 'after' }
  );
  if (!result.value) throw new Error('No member benefit found.');
  return withStringId(result.value);
}

export async function setActive(db: Db, id: string, active: boolean) {
  return update(db, id, { active });
}

// Clears the store pointer first so the storefront stops offering the
// benefit before the document goes.
export async function remove(db: Db, id: string, storeId: string) {
  const now = new Date().toISOString();
  await db
    .collection('stores')
    .updateOne(
      { _id: new ObjectId(storeId) },
      { $set: { benefitId: null, updatedAt: now } }
    );
  await collection(db).deleteOne({ _id: new ObjectId(id) });
}

export async function addMembers(db: Db, id: string, inputs: MemberInput[]) {
  const benefit = await getById(db, id);
  if (!benefit) throw new Error('No member benefit found.');

  const existing = new Set(benefit.members.map(m => normalizeEmail(m.email)));
  const seen = new Set<string>();
  const members: MemberBenefitMember[] = [];
  for (const input of inputs) {
    const email = normalizeEmail(input.email);
    if (!email || existing.has(email) || seen.has(email)) continue;
    seen.add(email);
    members.push(toMember({ ...input, email }));
  }

  if (members.length === 0) {
    return { benefit, added: 0 };
  }

  const result = await collection(db).findOneAndUpdate(
    { _id: new ObjectId(id) },
    {
      $push: { members: { $each: members } },
      $set: { updatedAt: new Date().toISOString() },
    },
    { returnDocument: 'after' }
  );
  if (!result.value) throw new Error('No member benefit found.');
  return { benefit: withStringId(result.value), added: members.length };
}

export async function removeMember(db: Db, id: string, email: string) {
  const result = await collection(db).findOneAndUpdate(
    { _id: new ObjectId(id) },
    {
      $pull: { members: { email: normalizeEmail(email) } },
      $set: { updatedAt: new Date().toISOString() },
    },
    { returnDocument: 'after' }
  );
  if (!result.value) throw new Error('No member benefit found.');
  return withStringId(result.value);
}

// Lowers `used` by `amount`, and only when the member has at least that
// much used. Mongo applies the filter and the update together, so this can
// never take `used` below zero even against the storefront's concurrent
// reservation.
export async function restoreUsed(
  db: Db,
  id: string,
  email: string,
  amount: number
): Promise<'restored' | 'insufficient' | 'notFound'> {
  if (!Number.isInteger(amount) || amount <= 0) {
    throw new Error('Amount must be a positive whole number.');
  }
  const normalized = normalizeEmail(email);
  const result = await collection(db).updateOne(
    {
      _id: new ObjectId(id),
      members: { $elemMatch: { email: normalized, used: { $gte: amount } } },
    },
    {
      $inc: { 'members.$.used': -amount },
      $set: { updatedAt: new Date().toISOString() },
    }
  );
  if (result.matchedCount === 1) return 'restored';

  const exists = await collection(db).countDocuments(
    { _id: new ObjectId(id), members: { $elemMatch: { email: normalized } } },
    { limit: 1 }
  );
  return exists ? 'insufficient' : 'notFound';
}

export async function setAllowance(
  db: Db,
  id: string,
  email: string,
  allowance: number | null
) {
  const now = new Date().toISOString();
  const result = await collection(db).findOneAndUpdate(
    { _id: new ObjectId(id), 'members.email': normalizeEmail(email) },
    allowance === null
      ? { $unset: { 'members.$.allowance': '' }, $set: { updatedAt: now } }
      : { $set: { 'members.$.allowance': allowance, updatedAt: now } },
    { returnDocument: 'after' }
  );
  if (!result.value) throw new Error('No member found with that email.');
  return withStringId(result.value);
}
