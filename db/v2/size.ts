import { Db, ObjectId, WithoutId } from 'mongodb';

import { CreateSize, Size, UpdateSize } from '../../types';

// **************************************************************

async function findSize(
  db: Db,
  filter: { _id?: string; code?: string; name?: string }
) {
  const query = {
    ...(filter._id && { _id: new ObjectId(filter._id) }),
    ...(filter.code && { code: filter.code }),
    ...(filter.name && { name: filter.name }),
  };

  return await db.collection<WithoutId<Size>>('sizes').findOne(query);
}

// **************************************************************

async function findSizesBySizeGroup(db: Db, sizeGroupId: string) {
  return await db
    .collection('sizes')
    .find({ sizeGroupId: new ObjectId(sizeGroupId) })
    .toArray();
}

// **************************************************************

async function createSize(db: Db, input: CreateSize) {
  const now = new Date();

  const formattedInput = {
    ...input,
    createdAt: now,
    updatedAt: now,
  };

  const result = await db.collection('sizes').insertOne(formattedInput);

  return { _id: result.insertedId.toString(), ...formattedInput };
}

// **************************************************************

async function updateSize(db: Db, updates: UpdateSize) {
  const { _id, ...restOfUpdates } = updates;
  const now = new Date();

  const formattedUpdate = {
    ...restOfUpdates,
    updatedAt: now,
  };

  return await db
    .collection('sizes')
    .updateOne({ _id: new ObjectId(_id) }, { $set: formattedUpdate });
}

// **************************************************************

export { createSize, findSize, findSizesBySizeGroup, updateSize };
