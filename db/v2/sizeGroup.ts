import { Db, ObjectId } from 'mongodb';

import { CreateSizeGroup, UpdateSizeGroup } from '../../types';

// **************************************************************

async function findSizeGroup(
  db: Db,
  filter: { _id: string; code: string; name: string }
) {
  const query = {
    ...(filter._id && { _id: new ObjectId(filter._id) }),
    ...(filter.code && { code: filter.code }),
    ...(filter.name && { name: filter.name }),
  };

  return await db.collection('sizeGroups').findOne(query);
}

// **************************************************************

async function createSizeGroup(db: Db, input: CreateSizeGroup) {
  const now = new Date();

  const formattedInput = {
    ...input,
    createdAt: now,
    updatedAt: now,
  };

  const result = await db.collection('sizeGroups').insertOne(formattedInput);

  return { _id: result.insertedId.toString(), ...formattedInput };
}

// **************************************************************

async function updateSizeGroup(db: Db, updates: UpdateSizeGroup) {
  const { _id, ...restOfUpdates } = updates;
  const now = new Date();

  const formattedUpdate = {
    ...restOfUpdates,
    updatedAt: now,
  };

  return await db
    .collection('sizeGroups')
    .findOneAndUpdate({ _id: new ObjectId(_id) }, { $set: formattedUpdate });
}

// **************************************************************

export { createSizeGroup, findSizeGroup, updateSizeGroup };
